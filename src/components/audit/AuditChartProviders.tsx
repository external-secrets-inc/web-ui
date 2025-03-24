import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import useGetAuditProviderStats from "@/services/audit/queries/useGetAuditProviderStats"
import { mockLastUpdate } from "@/services/audit/mocks/mockData"
import { Skeleton } from "@/components/ui/skeleton"
import { AUDIT_PAGE_QUERY_REFETCH_INTERVAL, AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Secrets",
  },
} satisfies ChartConfig


interface Props {
  listenerID?: string;
}

function AuditChartProviders({ listenerID }: Props) {
  const { data, error, isLoading } = useGetAuditProviderStats(false, listenerID || '', {
    staleTime: AUDIT_QUERY_STALE_TIME,
    refetchInterval: AUDIT_PAGE_QUERY_REFETCH_INTERVAL,
    enabled: !!listenerID,
  })
  const total = data?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title={
        <div className="flex items-center justify-between leading-none">
          Secrets by Provider
          {!isLoading ?
            <span className="text-muted-foreground font-normal text-sm leading-none">
              <span className="text-foreground text-base font-bold leading-none">{total}</span> secrets
            </span>
            : <Skeleton className="w-20 h-4" />
          }
        </div>
      }
      description={<>Last update: {mockLastUpdate}</>}
      data={data}
      baseConfig={BASE_CHART_CONFIG}
      error={!!error}
      isLoading={isLoading || !listenerID}
      sortData={true}
    />
  )
}

export default AuditChartProviders
