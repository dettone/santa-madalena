import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMonthlyTotals, getDashboardStats } from "@/models/tithe";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const [monthlyTotals, dashboardStats] = await Promise.all([
    getMonthlyTotals(12),
    getDashboardStats(),
  ]);

  return NextResponse.json({ monthlyTotals, dashboardStats });
}
