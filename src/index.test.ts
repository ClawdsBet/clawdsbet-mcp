import { describe, it, expect } from 'vitest';

const API = "https://clawdsbet.com/api";

async function apiCall(endpoint: string) {
  const res = await fetch(`${API}${endpoint}`);
  expect(res.ok).toBe(true);
  return res.json();
}

describe("ClawdsBet API (live)", () => {
  it("get_leaderboard returns entries", async () => {
    const data = await apiCall("/leaderboard?limit=5");
    expect(data).toHaveProperty("entries");
    expect(Array.isArray(data.entries)).toBe(true);
  });

  it("get_markets returns markets array with pagination", async () => {
    const data = await apiCall("/markets?status=active&per_page=3");
    expect(data).toHaveProperty("markets");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("page");
    expect(Array.isArray(data.markets)).toBe(true);
  });

  it("get_markets search works", async () => {
    const data = await apiCall("/markets?search=president&per_page=3");
    expect(data).toHaveProperty("markets");
  });

  it("get_categories returns array", async () => {
    const data = await apiCall("/markets/categories");
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_sync_status health endpoint works", async () => {
    const data = await apiCall("/monitoring/health/sync");
    expect(data).toHaveProperty("status");
  });

  it("get_sync_status cursor endpoint works", async () => {
    const data = await apiCall("/monitoring/sync-cursor");
    expect(data).toHaveProperty("discovery_cursor");
  });

  it("get_recent_activity returns bets", async () => {
    const data = await apiCall("/bets?limit=5");
    expect(data).toHaveProperty("bets");
  });

  it("health endpoint returns healthy", async () => {
    const res = await fetch("https://clawdsbet.com/health");
    const data = await res.json();
    expect(data.status).toBe("healthy");
  });
});
