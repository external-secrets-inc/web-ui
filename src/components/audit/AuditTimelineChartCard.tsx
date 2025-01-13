import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { LucideAlertCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useMemo } from "react"
import { Loader } from "@/components/ui/Loader"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
]

type TimelineData = {
  date: string
  stats: {
    kind: string
    amount: number
    label: string
    tooltipLabel?: string
    providerType?: string
  }[]
}

type TimelineChartCardProps = {
  title: string
  description?: string | React.ReactNode
  data?: TimelineData[]
  baseConfig: ChartConfig
  error?: boolean
  errorMessage?: string
  isLoading?: boolean
}

export function AuditTimelineChartCard({
  title,
  description,
  data: rawData,
  baseConfig,
  error,
  errorMessage = "Failed to load statistics",
  isLoading,
}: TimelineChartCardProps) {
  const { data, config } = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return { data: undefined, config: baseConfig }
    const uniqueKindsMap = new Map<string, {kind: string, label: string; tooltipLabel: string | undefined }>();

    for (const item of rawData) {
      for (const stat of item.stats) {
        if (!uniqueKindsMap.has(stat.kind)) {
          uniqueKindsMap.set(stat.kind, {
            kind: stat.kind,
            label: stat.label,
            tooltipLabel: stat.tooltipLabel ? stat.tooltipLabel.concat(stat.providerType ? ` (${stat.providerType})` : '') : ''
          });
        }
      }
    }
    const chartConfig = {
      ...baseConfig,
      ...Object.fromEntries(
        Array.from(uniqueKindsMap.values()).map((kind, index) => {
          return [
            kind.kind,
            {
              label: kind.label,
              tooltipLabel: kind.tooltipLabel,
              color: CHART_COLORS[index % CHART_COLORS.length],
            }
          ]
        })
      )
    } satisfies ChartConfig

    const chartData = rawData.map(item => {
      const date = new Date(item.date)
      return {
        date: date.toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
        }),
        fullDate: date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        ...Object.fromEntries(
          item.stats.map(stat => [stat.kind, stat.amount])
        )
      }
    })
    return { data: chartData, config: chartConfig }
  }, [rawData, baseConfig])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="flex gap-2 items-center justify-center -mt-14">
            <LucideAlertCircle className="text-destructive" />
            {errorMessage}
          </div>
        ) : isLoading ? (
          <Loader size="lg" className="h-80 place-self-center -mt-14"/>
        ) : !data ? (
          <div className="flex gap-2 items-center justify-center -mt-14">
            <LucideAlertCircle className="text-destructive" />
            No data available
          </div>
        ) : (
          <ChartContainer
            config={config}
            className="w-full max-h-[264px]"
          >
            <AreaChart
              data={data}
              margin={{ top: 0, right: 0, bottom: 20, left: 0 }}
            >
              <defs>
                {Object.keys(config)
                  .filter(k => k !== 'amount')
                  .map((kind, index) => (
                    <linearGradient
                      key={kind}
                      id={`gradient-${kind}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS[index % CHART_COLORS.length]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS[index % CHART_COLORS.length]}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={16}
                className="text-xs"
                interval="preserveStartEnd"
                padding={{ left: 0, right: 0 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => {
                      const item = data?.find((d) => d.date === label)
                      return item?.fullDate || label
                    }}
                    sortByConfigOrder
                  />
                }
              />
              {Object.keys(config)
                .filter((k) => k !== 'amount')
                .map((kind, index) => (
                  <Area
                    key={kind}
                    type="monotone"
                    dataKey={kind}
                    stackId="1"
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    fill={`url(#gradient-${kind})`}
                    fillOpacity={0.4}
                  />
                ))}
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                mirror={true}
                tickMargin={8}
                className="text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/50"
              />
              <ChartLegend
                content={<ChartLegendContent sortByConfigOrder />}
                verticalAlign="top"
                className="pb-10"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}