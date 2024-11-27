import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProblemTimelineStats from "@/services/audit/queries/useGetAuditProblemTimelineStats"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Problems",
  },
} satisfies ChartConfig

function AuditTimelineProblems() {
  const { data, error, isLoading } = useGetAuditProblemTimelineStats(true)

  return (
    <AuditTimelineChartCard
      title="Secret Problems Timeline"
      description="Last 7 days of secret problems statistics"
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditTimelineProblems