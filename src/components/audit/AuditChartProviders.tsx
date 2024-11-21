"use client"

import { useMemo } from "react"
import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderStats from "@/services/audit/queries/useGetAuditProviderStats"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

function AuditChartProviders() {
  const { data, error, isLoading } = useGetAuditProviderStats(true)

  const chartConfig = useMemo(() => {
    if (!data) return BASE_CHART_CONFIG

    const sortedData = [...data].sort((a, b) => b.amount - a.amount)

    return {
      ...BASE_CHART_CONFIG,
      ...Object.fromEntries(
        sortedData.map((provider, index) => [
          provider.kind,
          {
            label: provider.label,
            tooltipLabel: provider.tooltipLabel,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }
        ])
      )
    } satisfies ChartConfig
  }, [data])

  const chartData = useMemo(() => {
    if (!data) return undefined

    return [...data]
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({
        ...item,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
  }, [data])

  const total = chartData?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title="Secrets by Provider"
      description={<>Total secrets: <span className="text-foreground">{isLoading ? null : total}</span></>}
      data={chartData}
      config={chartConfig}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditChartProviders
