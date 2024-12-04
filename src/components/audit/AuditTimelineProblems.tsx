import { AuditTimelineChartCard } from "@/components/audit/AuditTimelineChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProblemTimelineStats from "@/services/audit/queries/useGetAuditProblemTimelineStats"
import { TimeRange } from "./AuditToggleGroup"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Problems",
  },
} satisfies ChartConfig

interface Props {
  timeRange: Exclude<TimeRange, 'now'>
}

function AuditTimelineProblems({ timeRange }: Props) {
  const { data, error, isLoading } = useGetAuditProblemTimelineStats(true, { timeRange })

  return (
    <AuditTimelineChartCard
      title="Secret Problems"
      description={`Last ${timeRange}`}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditTimelineProblems