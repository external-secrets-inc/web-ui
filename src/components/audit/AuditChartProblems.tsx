import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProblemStats from "@/services/audit/queries/useGetAuditProblemStats"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Problems",
  },
} satisfies ChartConfig

function AuditChartProblems() {
  const { data, error, isLoading } = useGetAuditProblemStats(true)
  const total = data?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title="Secret Problems Overview"
      description={<>Total problems: <span className="text-foreground">{isLoading ? null : total}</span></>}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditChartProblems
