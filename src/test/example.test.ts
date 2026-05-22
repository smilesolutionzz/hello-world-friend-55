import { describe, it, expect } from "vitest";

describe("test infrastructure", () => {
  it("vitest runs", () => {
    expect(1 + 1).toBe(2);
  });

  it("jsdom is available", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });

  it("matchMedia polyfill is installed", () => {
    expect(typeof window.matchMedia).toBe("function");
    expect(window.matchMedia("(min-width: 768px)").matches).toBe(false);
  });

  it("IntersectionObserver polyfill is installed", () => {
    expect(typeof window.IntersectionObserver).toBe("function");
  });
});
