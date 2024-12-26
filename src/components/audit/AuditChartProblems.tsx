import { AuditBarChartCard } from "@/components/audit/AuditBarChartCard"
import { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { mockLastUpdate } from "@/services/audit/mocks/mockData"
import useGetAuditProblemStats from "@/services/audit/queries/useGetAuditProblemStats"

const BASE_CHART_CONFIG = {
  amount: {
    label: "Problems",
  },
} satisfies ChartConfig


interface Props {
  listenerID?: string;
}


function AuditChartProblems({ listenerID } : Props) {
  const { data, error, isLoading } = useGetAuditProblemStats(false, listenerID || '', {enabled: !!listenerID})
  const total = data?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

  return (
    <AuditBarChartCard
      title={
        <div className="flex items-center justify-between leading-none">
          Secret Problems
          {!isLoading ?
            <span className="text-muted-foreground font-normal text-sm leading-none">
              <span className="text-foreground text-base font-bold leading-none">{total}</span> problems
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
    />
  )
}

export default AuditChartProblems
