import { describe, expect, it } from "vitest";
import {
  BUSINESS,
  OVERAGE_CENTS_PER_TICKET,
  PLANS,
  PRO,
  annualMonthsFree,
  annualSavingsPercent,
  displayPriceCents,
  formatUsd,
  maxAnnualMonthsFree,
  monthlyEquivalentCents,
} from "./pricing.ts";

describe("plan prices", () => {
  it("matches the Dodo products: Pro $49/mo, $348/yr", () => {
    expect(PRO.monthlyCents).toBe(4_900);
    expect(PRO.annualCents).toBe(34_800);
  });

  it("matches the Dodo products: Business $149/mo, $948/yr", () => {
    expect(BUSINESS.monthlyCents).toBe(14_900);
    expect(BUSINESS.annualCents).toBe(94_800);
  });

  it("only ever features one plan, so the page has a single focal point", () => {
    expect(PLANS.filter((p) => p.featured)).toHaveLength(1);
  });

  it("prices Business above Pro on both periods", () => {
    expect(BUSINESS.monthlyCents).toBeGreaterThan(PRO.monthlyCents);
    expect(BUSINESS.annualCents).toBeGreaterThan(PRO.annualCents);
  });
});

describe("monthlyEquivalentCents", () => {
  it("quotes Pro's annual plan at $29/mo", () => {
    expect(monthlyEquivalentCents(PRO)).toBe(2_900);
  });

  it("quotes Business's annual plan at $79/mo", () => {
    expect(monthlyEquivalentCents(BUSINESS)).toBe(7_900);
  });

  it("always beats the monthly price - otherwise annual is pointless", () => {
    for (const plan of PLANS) {
      expect(monthlyEquivalentCents(plan)).toBeLessThan(plan.monthlyCents);
    }
  });
});

describe("annualSavingsPercent", () => {
  it("is 41% on Pro", () => {
    expect(annualSavingsPercent(PRO)).toBe(41);
  });

  it("is 47% on Business", () => {
    expect(annualSavingsPercent(BUSINESS)).toBe(47);
  });
});

describe("overage leaves a real reason to upgrade", () => {
  // Pro + overage must overtake Business's flat price while still inside Pro's
  // usable range. Price the overage too cheaply and a growing customer just
  // parks on Pro forever and Business never sells.
  const crossover =
    PRO.ticketsPerMonth +
    (BUSINESS.monthlyCents - PRO.monthlyCents) / OVERAGE_CENTS_PER_TICKET;

  it("Pro plus overage costs more than Business at 3,000 tickets", () => {
    expect(crossover).toBe(3_000);
  });

  it("crosses over well before Business's own cap", () => {
    expect(crossover).toBeLessThan(BUSINESS.ticketsPerMonth);
  });

  it("still charges far above cost to serve", () => {
    // Transcription + storage land near $0.001/ticket, so any sane overage
    // clears it by an order of magnitude - this only catches a fat finger.
    expect(OVERAGE_CENTS_PER_TICKET).toBeGreaterThan(0);
    expect(OVERAGE_CENTS_PER_TICKET).toBeLessThan(100);
  });
});

describe("annualMonthsFree", () => {
  // Floored, never rounded: Pro genuinely saves 4.9 months and Business 5.6.
  // Advertising 5 and 6 would overstate a money claim on a public page.
  it("is 4 months on Pro (4.9 floored)", () => {
    expect(annualMonthsFree(PRO)).toBe(4);
  });

  it("is 5 months on Business (5.6 floored)", () => {
    expect(annualMonthsFree(BUSINESS)).toBe(5);
  });

  it("never claims more free months than the discount actually buys", () => {
    for (const plan of PLANS) {
      const exact = (plan.monthlyCents * 12 - plan.annualCents) / plan.monthlyCents;
      expect(annualMonthsFree(plan)).toBeLessThanOrEqual(exact);
    }
  });

  it("never claims more free months than a year has", () => {
    for (const plan of PLANS) {
      expect(annualMonthsFree(plan)).toBeLessThan(12);
      expect(annualMonthsFree(plan)).toBeGreaterThan(0);
    }
  });
});

describe("maxAnnualMonthsFree", () => {
  it("takes the most generous plan - Business's 5, not Pro's 4", () => {
    expect(maxAnnualMonthsFree()).toBe(5);
  });

  it("never claims less than a card does, or the toggle undersells a plan", () => {
    for (const plan of PLANS) {
      expect(maxAnnualMonthsFree()).toBeGreaterThanOrEqual(annualMonthsFree(plan));
    }
  });

  it("never claims more than some plan actually offers", () => {
    expect(PLANS.map(annualMonthsFree)).toContain(maxAnnualMonthsFree());
  });
});

describe("displayPriceCents", () => {
  it("shows the real monthly price on the monthly period", () => {
    expect(displayPriceCents(PRO, "monthly")).toBe(4_900);
  });

  it("shows the per-month equivalent on the annual period", () => {
    expect(displayPriceCents(PRO, "annual")).toBe(2_900);
  });
});

describe("formatUsd", () => {
  it("drops the cents on whole dollars", () => {
    expect(formatUsd(4_900)).toBe("$49");
    expect(formatUsd(34_800)).toBe("$348");
  });

  it("keeps two decimals on sub-dollar amounts", () => {
    expect(formatUsd(OVERAGE_CENTS_PER_TICKET)).toBe("$0.05");
  });

  it("keeps two decimals on part-dollar amounts", () => {
    expect(formatUsd(4_950)).toBe("$49.50");
  });

  it("handles zero", () => {
    expect(formatUsd(0)).toBe("$0");
  });
});
