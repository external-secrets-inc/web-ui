import { Line, LineChart, XAxis, YAxis } from "recharts"
import { LucideAlertCircle, LucideLoader } from "lucide-react"
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

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

type TimelineData = {
  date: string
  stats: {
    kind: string
    amount: number
    label: string
    tooltipLabel?: string
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
    if (!rawData) return { data: undefined, config: baseConfig }

    const allKinds = Array.from(
      new Set(rawData.flatMap(d => d.stats.map(s => s.kind)))
    )

    const chartConfig = {
      ...baseConfig,
      ...Object.fromEntries(
        allKinds.map((kind, index) => {
          const statItem = rawData[0].stats.find(s => s.kind === kind)
          return [
            kind,
            {
              label: statItem?.label,
              tooltipLabel: statItem?.tooltipLabel,
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
          weekday: 'short',
          day: '2-digit',
        }),
        fullDate: date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
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
      <CardContent>
        {error ? (
          <div className="flex gap-2 items-center justify-center h-[300px]">
            <LucideAlertCircle className="text-destructive" />
            {errorMessage}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <LucideLoader className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="flex gap-2 items-center justify-center h-[300px]">
            <LucideAlertCircle className="text-destructive" />
            No data available
          </div>
        ) : (
          <ChartContainer config={config} className="h-[300px]">
            <LineChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(label) => {
                  const item = data?.find(d => d.date === label)
                  return item?.fullDate || label
                }} />}
              />
              {Object.keys(config).filter(k => k !== 'amount').map((kind, index) => (
                <Line
                  key={kind}
                  type="linear"
                  dataKey={kind}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign="top"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}