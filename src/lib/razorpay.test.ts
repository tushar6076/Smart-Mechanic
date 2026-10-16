import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import {
  calculateRazorpayOrderTotal,
  createRazorpayTestOrder,
  getRazorpayTestKeyId,
  RazorpayConfigurationError,
  verifyRazorpayPaymentSignature,
} from "./razorpay";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Razorpay test checkout", () => {
  it("calculates tax and totals in integer paise", () => {
    expect(calculateRazorpayOrderTotal([
      { unitPrice: 99.99, quantity: 2 },
      { unitPrice: 10, quantity: 1 },
    ])).toEqual({
      subtotalPaise: 20998,
      taxPaise: 3780,
      totalPaise: 24778,
    });
  });

  it("rejects invalid or empty order lines", () => {
    expect(() => calculateRazorpayOrderTotal([])).toThrow();
    expect(() => calculateRazorpayOrderTotal([{ unitPrice: -1, quantity: 1 }])).toThrow();
    expect(() => calculateRazorpayOrderTotal([{ unitPrice: 10, quantity: 0 }])).toThrow();
  });

  it("accepts only test key IDs", () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "example_secret");
    expect(getRazorpayTestKeyId()).toBe("rzp_test_example");

    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_example");
    expect(() => getRazorpayTestKeyId()).toThrow(RazorpayConfigurationError);
  });

  it("creates test orders with the server-side secret and validates the response", async () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "example_secret");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      id: "order_example",
      amount: 24778,
      currency: "INR",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createRazorpayTestOrder(24778, "sm_testreceipt")).resolves.toEqual({
      id: "order_example",
      amount: 24778,
      currency: "INR",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.razorpay.com/v1/orders");
  });

  it("rejects a payment signature that does not match the order and payment", () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "example_secret");
    const signature = createHmac("sha256", "example_secret")
      .update("order_example|pay_example")
      .digest("hex");

    expect(verifyRazorpayPaymentSignature("order_example", "pay_example", signature)).toBe(true);
    expect(verifyRazorpayPaymentSignature("order_example", "pay_other", signature)).toBe(false);
    expect(verifyRazorpayPaymentSignature("order_example", "pay_example", "invalid")).toBe(false);
  });
});
