#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const server = new McpServer({
  name: "pocketwatch-plus",
  version: "1.0.0",
});

// ── Tool: Get today's check-in ──────────────────────────────
server.tool(
  "get_todays_checkin",
  "Get today's daily check-in data (Bible reading, gym, meals, sleep, coding, mood)",
  {},
  async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    if (!data) return { content: [{ type: "text" as const, text: "No check-in submitted today yet." }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get streaks ───────────────────────────────────────
server.tool(
  "get_streaks",
  "Get current habit streaks (Bible reading, gym, packed lunch, sleep, coding, etc.)",
  {},
  async () => {
    const { data, error } = await supabase
      .from("streaks")
      .select("*")
      .order("habit");

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get budget status ─────────────────────────────────
server.tool(
  "get_budget_status",
  "Get current month's budget status: spending vs limits per category, with percent used",
  {},
  async () => {
    const { data, error } = await supabase
      .from("budget_status")
      .select("*");

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get recent transactions ───────────────────────────
server.tool(
  "get_recent_transactions",
  "Get recent bank transactions with merchant, amount, category, and date",
  { limit: z.number().optional().describe("Number of transactions to return (default 20, max 100)") },
  async ({ limit }) => {
    const n = Math.min(limit || 20, 100);
    const { data, error } = await supabase
      .from("transactions")
      .select("date, merchant_name, amount, category, pending")
      .order("date", { ascending: false })
      .limit(n);

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get goals ─────────────────────────────────────────
server.tool(
  "get_goals",
  "Get active goals across all life domains with current progress",
  {},
  async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("status", "active")
      .order("domain");

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get ministry hours ────────────────────────────────
server.tool(
  "get_ministry_hours",
  "Get ministry service hours for the current month",
  {},
  async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("ministry_log")
      .select("*")
      .gte("date", monthStartStr)
      .order("date", { ascending: false });

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };

    const totalHours = (data || []).reduce((sum: number, e: { hours: number }) => sum + Number(e.hours), 0);
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ total_hours: totalHours, entries: data }, null, 2),
      }],
    };
  }
);

// ── Tool: Get recent alerts ─────────────────────────────────
server.tool(
  "get_recent_alerts",
  "Get recent alerts across all life domains (financial, spiritual, health, etc.)",
  { limit: z.number().optional().describe("Number of alerts to return (default 10)") },
  async ({ limit }) => {
    const n = Math.min(limit || 10, 50);
    const { data, error } = await supabase
      .from("alerts")
      .select("severity, domain, message, created_at, acknowledged")
      .order("created_at", { ascending: false })
      .limit(n);

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get weekly stats ──────────────────────────────────
server.tool(
  "get_weekly_stats",
  "Get aggregated weekly check-in stats (Bible days, gym sessions, meals cooked, coding hours, etc.)",
  { weeks: z.number().optional().describe("Number of weeks to return (default 4)") },
  async ({ weeks }) => {
    const n = Math.min(weeks || 4, 12);
    const { data, error } = await supabase
      .from("weekly_stats")
      .select("*")
      .limit(n);

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Get checkin history ───────────────────────────────
server.tool(
  "get_checkin_history",
  "Get daily check-in history for the past N days",
  { days: z.number().optional().describe("Number of days to look back (default 7)") },
  async ({ days }) => {
    const n = Math.min(days || 7, 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - n);
    const startStr = startDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .gte("date", startStr)
      .order("date", { ascending: false });

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Tool: Submit check-in ───────────────────────────────────
server.tool(
  "submit_checkin",
  "Submit or update today's daily check-in. Pass only the fields you want to set.",
  {
    bible_reading: z.boolean().optional().describe("Did Bible reading today"),
    gym_completed: z.boolean().optional().describe("Went to the gym today"),
    gym_workout: z.string().optional().describe("Workout type: push, pull, or legs"),
    packed_lunch: z.boolean().optional().describe("Packed lunch today"),
    meals_cooked: z.number().optional().describe("Number of meals cooked (0-3)"),
    meals_eaten_out: z.number().optional().describe("Number of meals eaten out"),
    phone_away_by_930: z.boolean().optional().describe("Phone away by 9:30 PM"),
    coding_minutes: z.number().optional().describe("Minutes spent coding"),
    coding_project: z.string().optional().describe("What project worked on"),
    mood: z.number().optional().describe("Mood rating 1-5"),
    daily_win: z.string().optional().describe("One good thing today"),
  },
  async (params) => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_checkins")
      .upsert(
        { ...params, date: today, updated_at: new Date().toISOString() },
        { onConflict: "date" }
      )
      .select()
      .single();

    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: `Check-in saved:\n${JSON.stringify(data, null, 2)}` }] };
  }
);

// ── Start server ────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
