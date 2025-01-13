
import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderTimelineStats from "@/services/audit/queries/useGetAuditProviderTimelineStats"
import { TimeRange } from "./Audit.interfaces"
import { formatDate } from "@/utils/dateUtils"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig

interface Props {
  listenerID?: string;
  timeRange: Exclude<TimeRange, 'now'>;
  startDate: string;
  endDate: string;
  timeUnit: string;
}

function AuditTimelineProviders({ listenerID, timeRange, startDate, endDate, timeUnit }: Props) {
  const { data, error, isLoading } = useGetAuditProviderTimelineStats(false, listenerID || '', {
    startDate,
    endDate,
    timeUnit
  }, {
    enabled: !!listenerID
  })

  const description = timeRange
    ? `Last ${timeRange}`
    : `From ${formatDate(startDate, { format: 'americanDate' })} to ${formatDate(endDate, { format: 'americanDate' })}`

  return (
    <AuditTimelineChartCard
      title="Secrets by Provider"
      description={description}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading || !listenerID}
    />
  )
}

export default AuditTimelineProviders