import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderTimelineStats from "@/services/audit/queries/useGetAuditProviderTimelineStats"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig

function AuditTimelineProviders() {
  const { data, error, isLoading } = useGetAuditProviderTimelineStats(true)

  return (
    <AuditTimelineChartCard
      title="Secrets by Provider Timeline"
      description="Last 7 days of secret provider statistics"
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditTimelineProviders