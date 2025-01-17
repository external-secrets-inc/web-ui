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
import { formatDate } from "@/utils/dateUtils"

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

const BackgroundGridWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[264px] flex gap-2 items-center justify-center bg-[linear-gradient(hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:calc((100%+1px)/7)_calc(100%/7)] bg-[-1px_top]">
    {children}
  </div>
)

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
    const uniqueKindsMap = new Map<string, { kind: string, label: string; tooltipLabel: string | undefined }>();

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
        date: formatDate(date, { format: 'shortDate' }),
        fullDate: formatDate(date, { format: 'readableDate' }),
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
        {
          error ?
          <BackgroundGridWrapper>
            <LucideAlertCircle className="text-destructive"/>
            {errorMessage}
          </BackgroundGridWrapper>

        : isLoading ?
          <BackgroundGridWrapper>
            <Loader size="lg"/>
          </BackgroundGridWrapper>

        : (!data || data.length === 0) ?
          <BackgroundGridWrapper>
            No data available for this period
          </BackgroundGridWrapper>

        : <ChartContainer
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
        }
      </CardContent>
    </Card>
  )
}