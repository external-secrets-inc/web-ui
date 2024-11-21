"use client"

import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProblemStats from "@/services/audit/queries/useGetAuditProblemStats"

const chartConfig = {
  amount: {
    label: "Problems",
  },
  duplicated: {
    label: "Duplicated",
    color: "hsl(var(--chart-1))",
  },
  non_compliant: {
    label: "Non-compliant",
    color: "hsl(var(--chart-2))",
  },
  never_accessed: {
    label: "Never Accessed",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

function AuditChartProblems() {
  const { data, error, isLoading } = useGetAuditProblemStats(true)

  const chartData = data?.map(item => ({
    ...item,
    fill: chartConfig[item.kind as keyof typeof chartConfig]?.color || "hsl(var(--chart-1))"
  }))

  const total = chartData?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title="Secret Problems Overview"
      description={<>Total problems: <span className="text-foreground">{isLoading ? null : total}</span></>}
      data={chartData}
      config={chartConfig}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditChartProblems
