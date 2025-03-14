import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProblemTimelineStats from "@/services/audit/queries/useGetAuditProblemTimelineStats"
import { TimeRange } from "./Audit.interfaces"
import { formatDate } from "@/utils/dateUtils"
import { AUDIT_PAGE_QUERY_REFETCH_INTERVAL, AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants"

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
  timeUnit: string;
}

function AuditTimelineProblems({ listenerID, timeRange, startDate, endDate, timeUnit }: Props) {
  const { data, error, isLoading } = useGetAuditProblemTimelineStats(false, listenerID || '', {
    startDate,
    endDate,
    timeUnit
  }, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    refetchInterval: AUDIT_PAGE_QUERY_REFETCH_INTERVAL,
    enabled: !!listenerID,
  })

  const description = timeRange
    ? `Last ${timeRange}`
    : `From ${formatDate(startDate, { format: 'americanDate' })} to ${formatDate(endDate, { format: 'americanDate' })}`

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