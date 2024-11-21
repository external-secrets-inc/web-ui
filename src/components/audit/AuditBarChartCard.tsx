import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"
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
} from "@/components/ui/chart"

type BarChartCardProps = {
  title: string
  description?: string | React.ReactNode
  data?: Array<{ kind: string; amount: number; fill: string }>
  config: ChartConfig
  error?: boolean
  errorMessage?: string
  isLoading?: boolean
}

export function AuditBarChartCard({
  title,
  description,
  data,
  config,
  error,
  errorMessage = "Failed to load statistics",
  isLoading,
}: BarChartCardProps) {
  const shouldHideTooltipLabels = !Object.values(config).some(c => c.tooltipLabel)

  return (
    <Card className="w-full grid">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-full grid items-center">
        {
          error ?
          <div className="flex gap-2 items-center justify-center -mt-12">
            <LucideAlertCircle className="text-destructive"/>
            {errorMessage}
          </div>

        : isLoading ?
          <LucideLoader className="w-8 h-72 animate-spin text-muted-foreground place-self-center -mt-12" />

        : !data ?
          <div className="flex gap-2 items-center justify-center -mt-12">
            <LucideAlertCircle className="text-destructive"/>
            No data available
          </div>

        : <ChartContainer
            config={config}
            className="w-full max-h-60"
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{
                left: 40,
                right: 40,
              }}
            >
              <YAxis
                dataKey="kind"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  (config[value as keyof typeof config]?.label ?? '').toString()
                }
              />
              <XAxis dataKey="amount" type="number" />
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