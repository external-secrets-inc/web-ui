import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProblemTimelineStats from "@/services/audit/queries/useGetAuditProblemTimelineStats"
import { TimeRange } from "./Audit.interfaces"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Problems",
  },
} satisfies ChartConfig

interface Props {
  listenerID?: string;
  timeRange: Exclude<TimeRange, 'now'>;
  startDate: string;
  endDate: string;
}

// TODO: Find a good date library to handle date formatting overall. Turn this into a util only if this process takes too long #151
function formatUSDateFromISODate(isoDate: string) {
  // Create date as UTC since YYYY-MM-DD is UTC by default
  const date = new Date(isoDate + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC' // Ensure we stay in UTC to avoid showing the wrong date
  });
}

function AuditTimelineProblems({listenerID, timeRange, startDate, endDate }: Props) {
  const { data, error, isLoading } = useGetAuditProblemTimelineStats(false, listenerID || '', {
    startDate,
    endDate
  }, {
    enabled: !!listenerID,
  })

  const description = timeRange
    ? `Last ${timeRange}`
    : `From ${formatUSDateFromISODate(startDate)} to ${formatUSDateFromISODate(endDate)}`

  return (
    <AuditTimelineChartCard
      title="Secret Problems"
      description={description}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading || !listenerID}
    />
  )
}

export default AuditTimelineProblems