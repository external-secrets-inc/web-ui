import { Bar, BarChart, XAxis, YAxis, LabelList, CartesianGrid } from "recharts"
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

type ChartData = {
  kind: string
  amount: number
  label: string
  providerType?: string
  tooltipLabel?: string
}

type BarChartCardProps = {
  title: string | React.ReactNode
  description?: string | React.ReactNode
  data?: ChartData[]
  baseConfig: ChartConfig
  error?: boolean
  errorMessage?: string
  isLoading?: boolean
  sortData?: boolean
}

const BackgroundGridWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[264px] flex gap-2 items-center justify-center bg-[linear-gradient(hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:calc((100%+1px)/7)_calc(100%/7)] bg-[-1px_top]">
    {children}
  </div>
)

export function AuditBarChartCard({
  title,
  description,
  data: rawData,
  baseConfig,
  error,
  errorMessage = "Failed to load statistics",
  isLoading,
  sortData = false,
}: BarChartCardProps) {
  const { data, config } = useMemo(() => {
    if (!rawData) return { data: undefined, config: baseConfig }

    const processedData = sortData
      ? [...rawData].sort((a, b) => b.amount - a.amount)
      : rawData

    const chartConfig = {
      ...baseConfig,
      ...Object.fromEntries(
        processedData.map((item, index) => [
          item.kind,
          {
            label: item.label,
            tooltipLabel: item.tooltipLabel ? item.tooltipLabel.concat(item.providerType ? ` (${item.providerType})` : '') : '',
            color: CHART_COLORS[index % CHART_COLORS.length],
          }
        ])
      )
    } satisfies ChartConfig

    // Cycle fill colors for the bars of each individual item
    const chartData = processedData.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))

    return { data: chartData, config: chartConfig }
  }, [rawData, baseConfig, sortData])

  // When not a single tooltipLabel is provided, hide them instead of repeating the chart label
  const shouldHideTooltipLabels = !Object.values(config).some(c => c.tooltipLabel)

  return (
    <Card className="w-full grid">
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
            No data available
          </BackgroundGridWrapper>
        : <ChartContainer
            config={config}
            className="w-full max-h-[264px]"
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 48, bottom: 6, left: 32 }}
            >
              <YAxis
                dataKey="kind"
                type="category"
                tickLine={false}

                axisLine={false}
                tickFormatter={(value) =>
                  (config[value as keyof typeof config]?.label ?? '').toString()
                }
              />
              <CartesianGrid horizontal={false} />
              <XAxis
                dataKey="amount"
                type="number"
                axisLine={false}
                tickLine={false}

              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent hideLabel={shouldHideTooltipLabels} />
                }
              />
              <Bar dataKey="amount" layout="vertical" radius={5}>
                <LabelList
                  dataKey="amount"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        }
      </CardContent>
    </Card>
  )
}