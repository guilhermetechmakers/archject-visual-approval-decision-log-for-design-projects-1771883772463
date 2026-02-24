/**
 * Analytics & Reports - studio-facing analytics hub
 */

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AnalyticsFiltersBar,
  AnalyticsKpiCards,
  AnalyticsTrendChart,
  AnalyticsBottleneckView,
  AnalyticsBottleneckHeatmap,
  AnalyticsTemplatesTable,
  AnalyticsClientGauges,
  AnalyticsClientMatrix,
  AnalyticsExportPanel,
  CustomReportsPanel,
} from '@/components/analytics'
import { useStudioAnalytics } from '@/hooks/use-analytics'
import { useSegmentTrack } from '@/hooks/use-segment-track'
import type { AnalyticsFilters } from '@/types/analytics'
import type { TemplateSortField, TemplateSortOrder } from '@/components/analytics'
import type { ApiError } from '@/lib/api'

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
  const { track } = useSegmentTrack()
  const [filters, setFilters] = useState<AnalyticsFilters>(getDefaultFilters)

  useEffect(() => {
    track({ event: 'analytics_viewed', properties: {} })
  }, [track])
  const [templateSort, setTemplateSort] = useState<{
    sortBy: TemplateSortField
    sortOrder: TemplateSortOrder
  }>({ sortBy: 'usageCount', sortOrder: 'desc' })
  const [clientSort, setClientSort] = useState<{
    sortBy: 'avgResponseTimeHours' | 'responseRate'
    sortOrder: 'asc' | 'desc'
  }>({ sortBy: 'responseRate', sortOrder: 'desc' })

  const { data, isLoading, error, refetch, isFetching } = useStudioAnalytics(filters)

  const sortedClients = useMemo(() => {
    const list = data?.clientResponsiveness
    if (!list) return []
    const arr = [...list]
    const { sortBy, sortOrder } = clientSort
    arr.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : 0
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return arr
  }, [data, clientSort])

  const sortedTemplates = useMemo(() => {
    const list = data?.templatePerformance
    if (!list) return []
    const arr = [...list]
    const { sortBy, sortOrder } = templateSort
    arr.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return arr
  }, [data, templateSort])

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
    const apiError = error as ApiError & Error
    const errorMessage =
      apiError?.message ?? (error instanceof Error ? error.message : 'Failed to load analytics')
    const statusHint = apiError?.status
      ? apiError.status === 401
        ? 'You may need to sign in again.'
        : apiError.status >= 500
          ? 'The server may be temporarily unavailable.'
          : 'Please check your connection and try again.'
      : 'Please check your connection and try again.'

    return (
      <Card className="rounded-2xl border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
          <AlertCircle
            className="h-12 w-12 text-destructive mb-4"
            aria-hidden
          />
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Unable to load analytics
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-2">
            {errorMessage}
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            {statusHint}
          </p>
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label={isFetching ? 'Retrying to load analytics' : 'Retry loading analytics'}
          >
            {isFetching ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            <span className="ml-2">{isFetching ? 'Retrying…' : 'Retry'}</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" aria-label="Analytics sections">
        <TabsList className="rounded-xl bg-secondary p-1" role="tablist">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Overview tab - view analytics overview"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Custom reports tab - create custom reports"
          >
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
          {(() => {
            const hasTimeSeries = (data.timeSeries?.length ?? 0) > 0
            const hasBottlenecks = (data.bottleneckStages?.length ?? 0) > 0
            const hasTemplates = (data.templatePerformance?.length ?? 0) > 0
            const hasClients = (data.clientResponsiveness?.length ?? 0) > 0
            const isFullyEmpty = !hasTimeSeries && !hasBottlenecks && !hasTemplates && !hasClients

            if (isFullyEmpty) {
              return (
                <Card className="rounded-2xl border-border shadow-card">
                  <CardContent className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <p className="text-lg font-medium text-foreground mb-1">
                      No analytics data yet
                    </p>
                    <p className="text-muted-foreground max-w-md mb-6">
                      There is no activity in the selected date range. Try adjusting your filters or
                      wait for decisions to be created and approved.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Selected range: {filters.from} – {filters.to}
                    </p>
                  </CardContent>
                </Card>
              )
            }

            return (
              <>
                <AnalyticsKpiCards kpis={data.kpis} onKpiClick={handleKpiClick} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsTrendChart data={data.timeSeries} />
            <AnalyticsBottleneckView
              stages={data.bottleneckStages}
              onStageClick={handleStageClick}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsBottleneckHeatmap
              stages={data.bottleneckStages}
              onStageClick={handleStageClick}
            />
            <AnalyticsClientMatrix
              data={sortedClients}
              sortBy={clientSort.sortBy}
              sortOrder={clientSort.sortOrder}
              onSort={(field) =>
                setClientSort((s) => ({
                  sortBy: field,
                  sortOrder: s.sortBy === field && s.sortOrder === 'desc' ? 'asc' : 'desc',
                }))
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsTemplatesTable
                data={sortedTemplates}
                sortBy={templateSort.sortBy}
                sortOrder={templateSort.sortOrder}
                onSort={(field: TemplateSortField) =>
                  setTemplateSort((s) => ({
                    sortBy: field,
                    sortOrder:
                      s.sortBy === field && s.sortOrder === 'desc' ? 'asc' : 'desc',
                  }))
                }
              />
            <AnalyticsClientGauges data={data.clientResponsiveness} />
          </div>

          <AnalyticsExportPanel filters={filters} />
              </>
            )
          })()}
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
