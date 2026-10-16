import { describe, expect, it } from "vitest";
import { getWelcomeCustomerHtml } from "./templates";

describe("email presentation tokens", () => {
  it("renders inline-safe colors from the shared email palette", () => {
    const html = getWelcomeCustomerHtml("Test Customer", "https://example.invalid/user");

    expect(html).toContain("background-color: #09090b");
    expect(html).toContain("color: #ef4444");
    expect(html).not.toContain("${emailTheme.");
  });
});
