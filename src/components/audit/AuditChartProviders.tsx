import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderStats from "@/services/audit/queries/useGetAuditProviderStats"
import { mockLastUpdate } from "@/services/audit/mocks/mockData"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig

function AuditChartProviders() {
  const { data, error, isLoading } = useGetAuditProviderStats(true)
  const total = data?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title="Secrets by Provider"
      description={<>
        Total secrets: <span className="text-foreground">{isLoading ? null : total}</span>
        <br />
        <span className="text-xs text-muted-foreground">Last update: {mockLastUpdate}</span>
      </>}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
      sortData={true}
    />
  )
}

export default AuditChartProviders
