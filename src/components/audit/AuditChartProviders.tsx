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
      title={
        <div className="flex items-center justify-between leading-none">
          Secret by Provider
          {!isLoading &&
            <span className="text-muted-foreground font-normal text-sm leading-none">
              <span className="text-foreground text-base font-bold leading-none">{total}</span> secrets
            </span>
          }
        </div>
      }
      description={<>Last update: {mockLastUpdate}</>}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading}
      sortData={true}
    />
  )
}

export default AuditChartProviders
