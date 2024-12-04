import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderTimelineStats from "@/services/audit/queries/useGetAuditProviderTimelineStats"
import { TimeRange } from "./Audit.interfaces"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig

interface Props {
  timeRange: Exclude<TimeRange, 'now'>;
  startDate: string;
  endDate: string;
}

function AuditTimelineProviders({ timeRange, startDate, endDate }: Props) {
  const { data, error, isLoading } = useGetAuditProviderTimelineStats(true, {
    startDate,
    endDate
  })

  const description = timeRange
    ? `Last ${timeRange}`
    : `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`

  return (
    <AuditTimelineChartCard
      title="Secrets by Provider"
      description={description}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditTimelineProviders