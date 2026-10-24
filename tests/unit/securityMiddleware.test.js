/**
 * Tests unitaires des middlewares de securite :
 * en-tetes HTTP (OWASP A06) et limitation de debit (OWASP A02).
 */
const { securityHeaders, rateLimit } = require("../../backend/middleware/securityMiddleware");

describe("En-tetes de securite HTTP", () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      setHeader: jest.fn(),
      getHeader: jest.fn()
    };
    next = jest.fn();
  });

  test("pose la Content-Security-Policy limitant l'execution de scripts", () => {
    securityHeaders({ headers: {} }, res, next);

    const csp = res.setHeader.mock.calls.find(
      (call) => call[0] === "Content-Security-Policy"
    );

    expect(csp).toBeDefined();
    expect(csp[1]).toContain("default-src 'self'");
    expect(csp[1]).toContain("script-src 'self'");
    expect(csp[1]).toContain("frame-ancestors 'none'");
  });

  test("pose les en-tetes anti-sniffing, anti-clickjacking et anti-referer", () => {
    securityHeaders({ headers: {} }, res, next);

    const headers = res.setHeader.mock.calls.reduce((acc, call) => {
      acc[call[0]] = call[1];
      return acc;
    }, {});

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(next).toHaveBeenCalled();
  });

  test("n'active HSTS qu'en production", () => {
    const originalEnv = process.env.NODE_ENV;

    delete process.env.NODE_ENV;
    res.setHeader.mockClear();
    securityHeaders({ headers: {} }, res, next);
    let headers = res.setHeader.mock.calls.reduce((acc, call) => {
      acc[call[0]] = call[1];
      return acc;
    }, {});
    expect(headers["Strict-Transport-Security"]).toBeUndefined();

    process.env.NODE_ENV = "production";
    res.setHeader.mockClear();
    securityHeaders({ headers: {} }, res, next);
    headers = res.setHeader.mock.calls.reduce((acc, call) => {
      acc[call[0]] = call[1];
      return acc;
    }, {});
    expect(headers["Strict-Transport-Security"]).toContain("max-age=");

    process.env.NODE_ENV = originalEnv;
  });
});

describe("Limitation de debit (rate limiting)", () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
    next = jest.fn();
  });

  test("laisse passer les requetes sous la limite", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 3 });

    for (let i = 0; i < 3; i += 1) {
      limiter({ ip: "10.0.0.1", headers: {} }, res, next);
    }

    expect(next).toHaveBeenCalledTimes(3);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("bloque avec un code 429 au-dela de la limite", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 2 });

    limiter({ ip: "10.0.0.2", headers: {} }, res, next);
    limiter({ ip: "10.0.0.2", headers: {} }, res, next);
    limiter({ ip: "10.0.0.2", headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("compte les requetes par adresse IP (une IP ne penalise pas les autres)", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 1 });

    limiter({ ip: "10.0.0.3", headers: {} }, res, next);
    limiter({ ip: "10.0.0.4", headers: {} }, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
  });

  test("expose les en-tetes de quota au client", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 5 });

    limiter({ ip: "10.0.0.5", headers: {} }, res, next);

    const headers = res.setHeader.mock.calls.reduce((acc, call) => {
      acc[call[0]] = call[1];
      return acc;
    }, {});

    expect(headers["X-RateLimit-Limit"]).toBe("5");
    expect(headers["X-RateLimit-Remaining"]).toBe("4");
  });
});
