/**
 * Custom Reports panel - date range, group-by, template metrics, export
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsFiltersBar } from './analytics-filters-bar'
import { AnalyticsTemplatesTable } from './analytics-templates-table'
import { AnalyticsClientGauges } from './analytics-client-gauges'
import { AnalyticsExportPanel } from './analytics-export-panel'
import { useCustomReport } from '@/hooks/use-analytics'
import {
  generateCsvFromTemplatePerformance,
  generateCsvFromClientResponsiveness,
  downloadCsv,
  formatFilename,
} from '@/lib/report-export-service'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { AnalyticsFilters } from '@/types/analytics'
import type { TemplateSortField, TemplateSortOrder } from './analytics-templates-table'
import { cn } from '@/lib/utils'

function getDefaultFilters(): AnalyticsFilters {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

export interface CustomReportsPanelProps {
  className?: string
}

export function CustomReportsPanel({ className }: CustomReportsPanelProps) {
  const [filters, setFilters] = useState<AnalyticsFilters>(getDefaultFilters)
  const [templateSort, setTemplateSort] = useState<{
    sortBy: TemplateSortField
    sortOrder: TemplateSortOrder
  }>({ sortBy: 'usageCount', sortOrder: 'desc' })

  const { data, isLoading } = useCustomReport(filters)

  const sortedTemplates = useMemo(() => {
    if (!data?.templatePerformance) return []
    const arr = [...data.templatePerformance]
    const { sortBy, sortOrder } = templateSort
    arr.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const cmp =
        typeof aVal === 'string'
          ? (aVal as string).localeCompare(bVal as string)
          : (aVal as number) - (bVal as number)
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return arr
  }, [data?.templatePerformance, templateSort])

  const handleExportTemplatesCsv = () => {
    const csv = generateCsvFromTemplatePerformance(sortedTemplates, filters)
    downloadCsv(csv, formatFilename('templates', filters.groupBy, filters.from, filters.to))
    toast.success('Template report downloaded')
  }

  const handleExportClientsCsv = () => {
    if (!data?.clientResponsiveness?.length) {
      toast.error('No client data to export')
      return
    }
    const csv = generateCsvFromClientResponsiveness(data.clientResponsiveness, filters)
    downloadCsv(csv, formatFilename('clients', filters.groupBy, filters.from, filters.to))
    toast.success('Client report downloaded')
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Custom reports</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Build reports by date range and group-by criteria. Export to CSV or PDF.
        </p>
      </div>

      <AnalyticsFiltersBar filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <Skeleton className="h-[400px] rounded-2xl" />
      ) : (
        <>
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
            headerActions={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTemplatesCsv}
                className="rounded-lg shrink-0"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
            }
          />

          {data?.clientResponsiveness && data.clientResponsiveness.length > 0 && (
            <Card className="rounded-2xl border border-border shadow-card">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Client responsiveness</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filters.from} to {filters.to}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportClientsCsv}
                    className="rounded-lg"
                  >
                    <FileDown className="h-4 w-4" />
                    Export clients CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnalyticsClientGauges data={data.clientResponsiveness} />
              </CardContent>
            </Card>
          )}

          <AnalyticsExportPanel filters={filters} />
        </>
      )}
    </div>
  )
}
