"use client";

import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ProgressChartProps {
  data: { week: string; progress: number; target: number }[];
  className?: string;
}

export function ProgressChart({ data, className }: ProgressChartProps) {
  // Calculate current vs target comparison
  const latestProgress = data[data.length - 1]?.progress || 0;
  const latestTarget = data[data.length - 1]?.target || 0;
  const difference = latestProgress - latestTarget;

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Quarterly Progress Trend
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-3 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-3 border-t border-dashed border-muted-foreground" />
            <span className="text-muted-foreground">Target</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-popover-foreground)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 4"
                fill="transparent"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="progress"
                stroke="var(--color-primary)"
                fill="url(#progressGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="text-muted-foreground">Current Progress</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{latestProgress}%</span>
            <span className={cn(
              "font-medium",
              difference >= 0 ? "text-success" : "text-destructive"
            )}>
              {difference >= 0 ? "+" : ""}{difference}% vs target
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusPieChartProps {
  data: { status: string; count: number; fill: string }[];
  className?: string;
}

export function StatusPieChart({ data, className }: StatusPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Status Distribution
        </h3>
      </div>
      <div className="p-4">
        <div className="h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-popover-foreground)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{item.count}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {Math.round((item.count / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DepartmentBarChartProps {
  data: { name: string; progress: number; objectives: number }[];
  className?: string;
}

export function DepartmentBarChart({ data, className }: DepartmentBarChartProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Department Performance
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              domain={[0, 100]}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-popover-foreground)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="progress"
              name="Progress %"
              fill="var(--color-primary)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
