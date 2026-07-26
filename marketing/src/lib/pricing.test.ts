import { describe, expect, it } from "vitest";
import {
  BUSINESS,
  OVERAGE_CENTS_PER_TICKET,
  PLANS,
  PRO,
  annualMonthsFree,
  annualSavingsPercent,
  bestAnnualSavingsPercent,
  displayPriceCents,
  formatUsd,
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

describe("per-plan savings are genuinely per-plan", () => {
  // Regression guard: the toggle caption once hardcoded PRO's 41% above both
  // cards, understating Business's 47%. These differ, so any card rendering a
  // shared figure is lying about one plan.
  it("Pro and Business discount at different rates", () => {
    expect(annualSavingsPercent(PRO)).not.toBe(annualSavingsPercent(BUSINESS));
  });

  it("bestAnnualSavingsPercent reports the largest, for 'up to' copy", () => {
    expect(bestAnnualSavingsPercent()).toBe(
      Math.max(annualSavingsPercent(PRO), annualSavingsPercent(BUSINESS)),
    );
    expect(bestAnnualSavingsPercent()).toBe(47);
  });

  it("never understates a plan's own saving", () => {
    for (const plan of PLANS) {
      expect(bestAnnualSavingsPercent()).toBeGreaterThanOrEqual(annualSavingsPercent(plan));
    }
  });
});

describe("annualMonthsFree", () => {
  it("is 5 months on Pro", () => {
    expect(annualMonthsFree(PRO)).toBe(5);
  });

  it("is 6 months on Business", () => {
    expect(annualMonthsFree(BUSINESS)).toBe(6);
  });

  it("never claims more free months than a year has", () => {
    for (const plan of PLANS) {
      expect(annualMonthsFree(plan)).toBeLessThan(12);
      expect(annualMonthsFree(plan)).toBeGreaterThan(0);
    }
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
    expect(formatUsd(OVERAGE_CENTS_PER_TICKET)).toBe("$0.03");
  });

  it("keeps two decimals on part-dollar amounts", () => {
    expect(formatUsd(4_950)).toBe("$49.50");
  });

  it("handles zero", () => {
    expect(formatUsd(0)).toBe("$0");
  });
});
