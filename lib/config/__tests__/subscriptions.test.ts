import { describe, it, expect } from "vitest";
import { getPlanLimits, hasFeature, PLANS } from "../subscriptions";

describe("getPlanLimits", () => {
  it("returns FREE plan when no subscription", () => {
    const plan = getPlanLimits(undefined);
    expect(plan.slug).toBe("free");
    expect(plan.limits.research).toBe(5);
  });

  it("returns FREE plan when subscription is canceled", () => {
    const plan = getPlanLimits({ status: "canceled", planId: "team" });
    expect(plan.slug).toBe("free");
  });

  it("returns correct plan for active subscription with slug planId", () => {
    expect(getPlanLimits({ status: "active", planId: "team" }).slug).toBe("team");
    expect(getPlanLimits({ status: "active", planId: "startup" }).slug).toBe("startup");
    expect(getPlanLimits({ status: "active", planId: "enterprise" }).slug).toBe("enterprise");
  });

  it("returns correct plan for trialing subscription", () => {
    const plan = getPlanLimits({
      status: "trialing",
      planId: "startup",
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    expect(plan.slug).toBe("startup");
    expect(plan.limits.research).toBe(75);
  });

  it("returns FREE plan when trial has expired", () => {
    const plan = getPlanLimits({
      status: "trialing",
      planId: "team",
      currentPeriodEnd: new Date(Date.now() - 1000), // expired
    });
    expect(plan.slug).toBe("free");
  });

  it("defaults to TEAM for active subscription with unknown planId", () => {
    const plan = getPlanLimits({ status: "active", planId: "price_unknown123" });
    expect(plan.slug).toBe("team");
  });
});

describe("hasFeature", () => {
  it("returns true for included features", () => {
    expect(hasFeature(PLANS.STARTUP, "askAI")).toBe(true);
    expect(hasFeature(PLANS.TEAM, "slackIntegration")).toBe(true);
  });

  it("returns false for excluded features", () => {
    expect(hasFeature(PLANS.FREE, "askAI")).toBe(false);
    expect(hasFeature(PLANS.FREE, "slackIntegration")).toBe(false);
  });

  it("returns true for 'limited' features (compare tools on Free)", () => {
    expect(hasFeature(PLANS.FREE, "compareTools")).toBe(true);
  });
});

describe("plan limits", () => {
  it("FREE plan has correct limits", () => {
    expect(PLANS.FREE.limits.tools).toBe(15);
    expect(PLANS.FREE.limits.research).toBe(5);
    expect(PLANS.FREE.limits.members).toBe(1);
    expect(PLANS.FREE.extraCreditPrice).toBeNull();
  });

  it("paid plans have unlimited tools", () => {
    expect(PLANS.TEAM.limits.tools).toBe(Infinity);
    expect(PLANS.STARTUP.limits.tools).toBe(Infinity);
    expect(PLANS.ENTERPRISE.limits.tools).toBe(Infinity);
  });

  it("extra credit prices decrease with higher tiers", () => {
    expect(PLANS.TEAM.extraCreditPrice!).toBeGreaterThan(PLANS.STARTUP.extraCreditPrice!);
    expect(PLANS.STARTUP.extraCreditPrice!).toBeGreaterThan(PLANS.ENTERPRISE.extraCreditPrice!);
  });
});
