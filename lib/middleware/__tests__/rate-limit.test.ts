import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, getRateLimitHeaders } from "../rate-limit";

// Each test uses a unique identifier to avoid cross-test pollution
let testId = 0;
function uniqueId() {
  return `test-${++testId}-${Date.now()}`;
}

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const id = uniqueId();
    const result = rateLimit(id, { limit: 5, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("tracks request count correctly", () => {
    const id = uniqueId();
    const opts = { limit: 3, windowSeconds: 60 };

    const r1 = rateLimit(id, opts);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(id, opts);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(id, opts);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding limit", () => {
    const id = uniqueId();
    const opts = { limit: 2, windowSeconds: 60 };

    rateLimit(id, opts);
    rateLimit(id, opts);

    const r3 = rateLimit(id, opts);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const id = uniqueId();
    const opts = { limit: 1, windowSeconds: 0.1 }; // 100ms window

    const r1 = rateLimit(id, opts);
    expect(r1.success).toBe(true);

    const r2 = rateLimit(id, opts);
    expect(r2.success).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    const r3 = rateLimit(id, opts);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0); // limit 1, used 1 = 0 remaining
  });

  it("uses separate counters for different identifiers", () => {
    const id1 = uniqueId();
    const id2 = uniqueId();
    const opts = { limit: 1, windowSeconds: 60 };

    rateLimit(id1, opts);
    const r = rateLimit(id2, opts);
    expect(r.success).toBe(true); // id2 has its own counter
  });
});

describe("getRateLimitHeaders", () => {
  it("returns correct header format", () => {
    const result = rateLimit(uniqueId(), { limit: 10, windowSeconds: 60 });
    const headers = getRateLimitHeaders(result);

    expect(headers["X-RateLimit-Limit"]).toBe("10");
    expect(headers["X-RateLimit-Remaining"]).toBe("9");
    expect(headers["X-RateLimit-Reset"]).toBeDefined();
    expect(Number(headers["X-RateLimit-Reset"])).toBeGreaterThan(0);
  });
});
