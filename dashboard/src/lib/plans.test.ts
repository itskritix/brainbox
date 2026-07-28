import { describe, expect, it } from "vitest";

import {
  OVERAGE_CENTS_PER_TICKET,
  PLAN_OPTIONS,
  annualSavingsPercent,
  displayPriceCents,
  formatUsd,
} from "./plans";

const pro = PLAN_OPTIONS.find((p) => p.id === "pro")!;
const business = PLAN_OPTIONS.find((p) => p.id === "business")!;

describe("plan catalogue", () => {
  // These must not drift from marketing/src/lib/pricing.ts or the Dodo
  // products. A visitor who sees $49 on the site and $59 at checkout is a
  // refund, so pin them here too.
  it("prices Pro at $49/mo and $348/yr", () => {
    expect(pro.monthlyCents).toBe(4_900);
    expect(pro.annualCents).toBe(34_800);
  });

  it("prices Business at $149/mo and $948/yr", () => {
    expect(business.monthlyCents).toBe(14_900);
    expect(business.annualCents).toBe(94_800);
  });

  it("carries the ticket allowances the backend enforces", () => {
    expect(pro.ticketsPerMonth).toBe(1_000);
    expect(business.ticketsPerMonth).toBe(5_000);
  });

  it("features exactly one plan", () => {
    expect(PLAN_OPTIONS.filter((p) => p.featured)).toHaveLength(1);
  });
});

describe("displayPriceCents", () => {
  it("quotes annual per month", () => {
    expect(displayPriceCents(pro, "annual")).toBe(2_900);
    expect(displayPriceCents(business, "annual")).toBe(7_900);
  });

  it("quotes monthly as-is", () => {
    expect(displayPriceCents(pro, "monthly")).toBe(4_900);
  });
});

describe("annualSavingsPercent", () => {
  it("is 41% on Pro and 47% on Business", () => {
    expect(annualSavingsPercent(pro)).toBe(41);
    expect(annualSavingsPercent(business)).toBe(47);
  });

  it("differs between plans - a shared figure would misstate one", () => {
    expect(annualSavingsPercent(pro)).not.toBe(annualSavingsPercent(business));
  });
});

describe("overage", () => {
  it("still makes Business the cheaper option before Pro's band ends", () => {
    const crossover =
      pro.ticketsPerMonth +
      (business.monthlyCents - pro.monthlyCents) / OVERAGE_CENTS_PER_TICKET;
    expect(crossover).toBe(3_000);
    expect(crossover).toBeLessThan(business.ticketsPerMonth);
  });
});

describe("formatUsd", () => {
  it("drops cents on whole dollars", () => {
    expect(formatUsd(4_900)).toBe("$49");
  });

  it("keeps them below a dollar", () => {
    expect(formatUsd(OVERAGE_CENTS_PER_TICKET)).toBe("$0.05");
  });
});
