import { createHmac, timingSafeEqual } from "node:crypto";

export interface RazorpayTestOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayLineItem {
  unitPrice: number;
  quantity: number;
}

export class RazorpayConfigurationError extends Error {
  constructor() {
    super("Razorpay test-mode credentials are required.");
    this.name = "RazorpayConfigurationError";
  }
}

export class RazorpayGatewayError extends Error {
  constructor(message = "Razorpay test gateway request failed.") {
    super(message);
    this.name = "RazorpayGatewayError";
  }
}

function getTestCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId?.startsWith("rzp_test_") || !keySecret) {
    throw new RazorpayConfigurationError();
  }
  return { keyId, keySecret };
}

export function calculateRazorpayOrderTotal(lines: RazorpayLineItem[]) {
  if (lines.length === 0) throw new Error("At least one order item is required.");

  const subtotalPaise = lines.reduce((subtotal, line) => {
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0 ||
      !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Order item parameters are invalid.");
    }
    return subtotal + Math.round(line.unitPrice * 100) * line.quantity;
  }, 0);
  const taxPaise = Math.round(subtotalPaise * 0.18);
  const totalPaise = subtotalPaise + taxPaise;
  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) {
    throw new Error("Order total is invalid.");
  }
  return { subtotalPaise, taxPaise, totalPaise };
}

export function getRazorpayTestKeyId(): string {
  return getTestCredentials().keyId;
}

export async function createRazorpayTestOrder(
  amount: number,
  receipt: string,
): Promise<RazorpayTestOrder> {
  const { keyId, keySecret } = getTestCredentials();
  if (!Number.isSafeInteger(amount) || amount < 100 || !receipt || receipt.length > 40) {
    throw new Error("Razorpay order parameters are invalid.");
  }

  let response: Response;
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency: "INR", receipt }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
  } catch {
    throw new RazorpayGatewayError();
  }

  if (!response.ok) {
    throw new RazorpayGatewayError(`Razorpay test gateway returned HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RazorpayGatewayError("Razorpay returned an unreadable test order.");
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    !("id" in payload) ||
    typeof payload.id !== "string" ||
    !payload.id.startsWith("order_") ||
    !("amount" in payload) ||
    payload.amount !== amount ||
    !("currency" in payload) ||
    payload.currency !== "INR"
  ) {
    throw new RazorpayGatewayError("Razorpay returned an invalid test order.");
  }

  return { id: payload.id, amount, currency: "INR" };
}

export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { keySecret } = getTestCredentials();
  if (
    !orderId.startsWith("order_") ||
    !paymentId.startsWith("pay_") ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const provided = Buffer.from(signature, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
