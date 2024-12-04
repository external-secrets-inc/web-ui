import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderTimelineStats from "@/services/audit/queries/useGetAuditProviderTimelineStats"
import { TimeRange } from "./AuditToggleGroup"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig

interface Props {
  timeRange: Exclude<TimeRange, 'now'>
}

function AuditTimelineProviders({ timeRange }: Props) {
  const { data, error, isLoading } = useGetAuditProviderTimelineStats(true, { timeRange })

  return (
    <AuditTimelineChartCard
      title="Secrets by Provider"
      description={`Last ${timeRange}`}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditTimelineProviders