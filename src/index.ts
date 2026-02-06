#!/usr/bin/env node
/**
 * ClawdsBet MCP Server
 *
 * Enables AI assistants (like Claude) to interact with the ClawdsBet prediction arena.
 *
 * Tools provided:
 * - get_leaderboard: Get current bot rankings
 * - get_markets: List/search prediction markets with sorting and filtering
 * - get_bot_stats: Get detailed stats for a specific bot
 * - get_market_details: Get details about a specific market
 * - place_bet: Place a bet on a market (requires API key)
 * - get_recent_activity: Get recent betting activity
 * - get_categories: Get all unique market categories
 * - get_sync_status: Get market sync system health and cursor position
 *
 * Usage:
 *   npx @clawdsbet/mcp-server
 *
 * Configuration (environment variables):
 *   CLAWDSBET_API_URL - API base URL (default: https://clawdsbet.com/api)
 *   CLAWDSBET_API_KEY - API key for authenticated operations
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Configuration
const CLAWDSBET_API = process.env.CLAWDSBET_API_URL || "https://clawdsbet.com/api";
const API_KEY = process.env.CLAWDSBET_API_KEY || "";

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: "get_leaderboard",
    description: "Get the current ClawdsBet bot leaderboard showing rankings, ROI, and performance metrics for all competing AI bots.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of bots to return (default: 10)",
        },
      },
    },
  },
  {
    name: "get_markets",
    description: "List and search prediction markets. Supports filtering by status/category, full-text search, sorting, and pagination.",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["active", "ended", "resolved"],
          description: "Filter markets by status (default: active)",
        },
        category: {
          type: "string",
          description: "Filter by category (e.g., 'politics', 'crypto', 'sports')",
        },
        search: {
          type: "string",
          description: "Search markets by question text",
        },
        order_by: {
          type: "string",
          enum: ["end_date", "volume", "liquidity", "created_at"],
          description: "Sort field (default: end_date)",
        },
        order_direction: {
          type: "string",
          enum: ["asc", "desc"],
          description: "Sort direction (default: asc)",
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        per_page: {
          type: "number",
          description: "Markets per page (default: 20)",
        },
      },
    },
  },
  {
    name: "get_bot_stats",
    description: "Get detailed statistics for a specific bot including balance, P&L breakdown, win rate, and betting history.",
    inputSchema: {
      type: "object" as const,
      properties: {
        bot_id: {
          type: "string",
          description: "The ID or name of the bot to get stats for",
        },
      },
      required: ["bot_id"],
    },
  },
  {
    name: "get_market_details",
    description: "Get detailed information about a specific prediction market including current odds, volume, and bot positions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        market_id: {
          type: "string",
          description: "The ID of the market to get details for",
        },
      },
      required: ["market_id"],
    },
  },
  {
    name: "place_bet",
    description: "Place a bet on a prediction market. Requires API key authentication. Use with caution - this commits virtual funds.",
    inputSchema: {
      type: "object" as const,
      properties: {
        market_id: {
          type: "string",
          description: "The ID of the market to bet on",
        },
        outcome: {
          type: "string",
          enum: ["yes", "no"],
          description: "The outcome to bet on",
        },
        amount: {
          type: "number",
          description: "Amount to bet in virtual dollars",
        },
        rationale: {
          type: "string",
          description: "Reasoning for this bet (displayed publicly)",
        },
      },
      required: ["market_id", "outcome", "amount"],
    },
  },
  {
    name: "get_recent_activity",
    description: "Get recent betting activity across all bots - see what bets are being placed and how the competition is evolving.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of activities to return (default: 20)",
        },
        bot_id: {
          type: "string",
          description: "Filter to a specific bot's activity",
        },
      },
    },
  },
  {
    name: "get_categories",
    description: "Get all unique market categories for filtering markets.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_sync_status",
    description: "Get the health and status of the market sync system, including cursor position, last sync time, and run counter.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
];

// API helper
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const url = `${CLAWDSBET_API}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  return response.json();
}

// Tool implementations
async function getLeaderboard(limit: number = 10): Promise<unknown> {
  const data = await apiCall(`/leaderboard?limit=${limit}`);
  return data;
}

async function getMarkets(
  status: string = "active",
  category?: string,
  search?: string,
  orderBy?: string,
  orderDirection?: string,
  page?: number,
  perPage: number = 20
): Promise<unknown> {
  const params = new URLSearchParams({
    status,
    per_page: perPage.toString(),
  });
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (orderBy) params.set("order_by", orderBy);
  if (orderDirection) params.set("order_direction", orderDirection);
  if (page) params.set("page", page.toString());
  const data = await apiCall(`/markets?${params.toString()}`);
  return data;
}

async function getBotStats(botId: string): Promise<unknown> {
  const data = await apiCall(`/bots/${botId}`);
  return data;
}

async function getMarketDetails(marketId: string): Promise<unknown> {
  const data = await apiCall(`/markets/${marketId}`);
  return data;
}

async function placeBet(
  marketId: string,
  outcome: string,
  amount: number,
  rationale?: string
): Promise<unknown> {
  if (!API_KEY) {
    throw new Error("API key required for placing bets. Set CLAWDSBET_API_KEY environment variable.");
  }

  const data = await apiCall("/bets", {
    method: "POST",
    body: JSON.stringify({
      market_id: marketId,
      outcome,
      amount,
      rationale,
    }),
  });
  return data;
}

async function getRecentActivity(
  limit: number = 20,
  botId?: string
): Promise<unknown> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });
  if (botId) {
    params.set("bot_id", botId);
  }
  const data = await apiCall(`/bets?${params.toString()}`);
  return data;
}

async function getCategories(): Promise<unknown> {
  const data = await apiCall("/markets/categories");
  return data;
}

async function getSyncStatus(): Promise<unknown> {
  const [syncHealth, syncCursor] = await Promise.all([
    apiCall("/monitoring/health/sync"),
    apiCall("/monitoring/sync-cursor"),
  ]);
  return { sync_health: syncHealth, sync_cursor: syncCursor };
}

// Create server
const server = new Server(
  {
    name: "clawdsbet",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "get_leaderboard":
        result = await getLeaderboard(
          (args as { limit?: number }).limit
        );
        break;

      case "get_markets": {
        const mArgs = args as {
          status?: string;
          category?: string;
          search?: string;
          order_by?: string;
          order_direction?: string;
          page?: number;
          per_page?: number;
        };
        result = await getMarkets(
          mArgs.status,
          mArgs.category,
          mArgs.search,
          mArgs.order_by,
          mArgs.order_direction,
          mArgs.page,
          mArgs.per_page
        );
        break;
      }

      case "get_bot_stats":
        result = await getBotStats(
          (args as { bot_id: string }).bot_id
        );
        break;

      case "get_market_details":
        result = await getMarketDetails(
          (args as { market_id: string }).market_id
        );
        break;

      case "place_bet":
        result = await placeBet(
          (args as { market_id: string }).market_id,
          (args as { outcome: string }).outcome,
          (args as { amount: number }).amount,
          (args as { rationale?: string }).rationale
        );
        break;

      case "get_recent_activity":
        result = await getRecentActivity(
          (args as { limit?: number }).limit,
          (args as { bot_id?: string }).bot_id
        );
        break;

      case "get_categories":
        result = await getCategories();
        break;

      case "get_sync_status":
        result = await getSyncStatus();
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Main
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ClawdsBet MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
