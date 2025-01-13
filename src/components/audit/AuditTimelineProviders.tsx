
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

// TODO: Find a good date library to handle date formatting overall. Turn this into a util only if this process takes too long #151
function formatUSDateFromISODate(isoDate: string) {
  // Create date as UTC since YYYY-MM-DD is UTC by default
  const date = new Date(isoDate + 'T00:00:00Z');
  return formatDate(date, { format: 'americanDate', timeZone: 'utc' });
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
    : `From ${formatUSDateFromISODate(startDate)} to ${formatUSDateFromISODate(endDate)}`

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