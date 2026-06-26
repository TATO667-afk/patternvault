"use client";
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { PriceHistoryPoint, PriceHistoryPeriod } from "@/types";
import { formatPrice } from "@/lib/utils";

const PERIODS: { label: string; value: PriceHistoryPeriod }[] = [
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
];

interface PriceChartProps {
  data: PriceHistoryPoint[];
  period: PriceHistoryPeriod;
  onPeriodChange: (period: PriceHistoryPeriod) => void;
  currentAvg?: number;
  changePercent?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const date = label ? format(parseISO(label), "MMM d, HH:mm") : "";
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{date}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="text-sm font-mono font-medium text-foreground">
            {formatPrice(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function PriceChart({
  data,
  period,
  onPeriodChange,
  currentAvg,
  changePercent,
}: PriceChartProps) {
  const isPositive = (changePercent ?? 0) >= 0;
  const formatDate = (tick: string) => {
    try {
      if (period === "24h") return format(parseISO(tick), "HH:mm");
      if (period === "7d") return format(parseISO(tick), "EEE");
      return format(parseISO(tick), "MMM d");
    } catch {
      return tick;
    }
  };

  const minPrice = Math.min(...data.map((d) => d.minPrice)) * 0.98;
  const maxPrice = Math.max(...data.map((d) => d.maxPrice)) * 1.02;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {currentAvg !== undefined && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(currentAvg)}
              </span>
              {changePercent !== undefined && (
                <span className={`text-sm font-medium ${isPositive ? "text-success" : "text-danger"}`}>
                  {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Average price</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No price history available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="maxPrice"
                name="max"
                stroke="#EF4444"
                strokeWidth={1}
                fill="none"
                dot={false}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="avgPrice"
                name="avg"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#avgGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="minPrice"
                name="min"
                stroke="#22C55E"
                strokeWidth={1.5}
                fill="url(#minGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
