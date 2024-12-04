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
  timeRange: Exclude<TimeRange, 'now'>;
  startDate: string;
  endDate: string;
}

function AuditTimelineProblems({ timeRange, startDate, endDate }: Props) {
  const { data, error, isLoading } = useGetAuditProblemTimelineStats(true, {
    startDate,
    endDate
  })

  const description = timeRange
    ? `Last ${timeRange}`
    : `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`

  return (
    <AuditTimelineChartCard
      title="Secret Problems"
      description={description}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditTimelineProblems