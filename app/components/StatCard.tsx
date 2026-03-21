type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "#16a34a"
      : trend === "down"
        ? "#dc2626"
        : "var(--text-muted)";
  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-2 shadow-sm"
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--cream-dark)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
          {title}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color: "var(--burgundy)", fontFamily: "Georgia, serif" }}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
          {subtitle}
        </p>
      )}
      {trendLabel && (
        <p className="text-xs font-medium" style={{ color: trendColor, fontFamily: "sans-serif" }}>
          {trendSymbol} {trendLabel}
        </p>
      )}
    </div>
  );
}
