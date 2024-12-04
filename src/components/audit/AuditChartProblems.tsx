import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import { mockLastUpdate } from "@/services/audit/mocks/mockData"
import useGetAuditProblemStats from "@/services/audit/queries/useGetAuditProblemStats"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Problems",
  },
} satisfies ChartConfig

function AuditChartProblems() {
  const { data, error, isLoading } = useGetAuditProblemStats(true)
  const total = data?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title="Secret Problems"
      description={<>
        Total problems: <span className="text-foreground">{isLoading ? null : total}</span>
        <br />
        <span className="text-xs text-muted-foreground">Last update: {mockLastUpdate}</span>
      </>}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
    />
  )
}

export default AuditChartProblems
