/**
 * Analytics & Reports - studio-facing analytics hub
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AnalyticsFiltersBar,
  AnalyticsKpiCards,
  AnalyticsTrendChart,
  AnalyticsBottleneckView,
  AnalyticsTemplatesTable,
  AnalyticsClientGauges,
  AnalyticsExportPanel,
  CustomReportsPanel,
} from '@/components/analytics'
import { useStudioAnalytics } from '@/hooks/use-analytics'
import type { AnalyticsFilters } from '@/types/analytics'
import type { TemplateSortField, TemplateSortOrder } from '@/components/analytics'

function getDefaultFilters(): AnalyticsFilters {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

export function AnalyticsDashboardPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<AnalyticsFilters>(getDefaultFilters)
  const [templateSort, setTemplateSort] = useState<{
    sortBy: TemplateSortField
    sortOrder: TemplateSortOrder
  }>({ sortBy: 'usageCount', sortOrder: 'desc' })

  const { data, isLoading, error } = useStudioAnalytics(filters)

  const sortedTemplates = useMemo(() => {
    if (!data?.templatePerformance) return []
    const arr = [...data.templatePerformance]
    const { sortBy, sortOrder } = templateSort
    arr.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return arr
  }, [data?.templatePerformance, templateSort])

  const handleKpiClick = (type: 'time' | 'pending' | 'approval') => {
    const typeMap = { time: 'approved', pending: 'bottleneck', approval: 'approved' } as const
    navigate('/dashboard/analytics/drilldown', {
      state: {
        type: typeMap[type],
        from: filters.from,
        to: filters.to,
      },
    })
  }

  const handleStageClick = (stage: string) => {
    navigate('/dashboard/analytics/drilldown', {
      state: {
        type: 'bottleneck',
        stage,
        from: filters.from,
        to: filters.to,
      },
    })
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load analytics</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="rounded-xl bg-secondary p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Custom reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0">
      <AnalyticsFiltersBar filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      ) : data ? (
        <>
          <AnalyticsKpiCards kpis={data.kpis} onKpiClick={handleKpiClick} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsTrendChart data={data.timeSeries} />
            <AnalyticsBottleneckView
              stages={data.bottleneckStages}
              onStageClick={handleStageClick}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsTemplatesTable
                data={sortedTemplates}
                sortBy={templateSort.sortBy}
                sortOrder={templateSort.sortOrder}
                onSort={(field) =>
                  setTemplateSort((s) => ({
                    sortBy: field,
                    sortOrder:
                      s.sortBy === field && s.sortOrder === 'desc' ? 'asc' : 'desc',
                  }))
                }
              />
            </div>
            <AnalyticsClientGauges data={data.clientResponsiveness} />
          </div>

          <AnalyticsExportPanel filters={filters} />
        </>
      ) : null}
        </TabsContent>

        <TabsContent value="custom" className="mt-0">
          <CustomReportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
