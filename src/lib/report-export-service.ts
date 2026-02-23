/**
 * ReportExportService - client-side CSV generation and export orchestration
 * PDF generation would typically be done server-side; this provides CSV and
 * coordinates with API for PDF/scheduled delivery
 */

import type { AnalyticsFilters, GroupByOption } from '@/types/analytics'
import type { TemplatePerformance, ClientResponsiveness } from '@/types/analytics'
import type { DrilldownDecision } from '@/types/analytics'

export function generateCsvFromTemplatePerformance(
  data: TemplatePerformance[],
  filters: AnalyticsFilters
): string {
  const headers = ['Template Name', 'Usage Count', 'Avg Approval Time (hrs)', 'Success Rate (%)']
  const rows = data.map((t) => [
    t.name,
    String(t.usageCount),
    t.avgApprovalTimeHours.toFixed(1),
    t.successRate.toFixed(1),
  ])
  return buildCsv(headers, rows, `Template Performance (${filters.from} to ${filters.to})`)
}

export function generateCsvFromClientResponsiveness(
  data: ClientResponsiveness[],
  filters: AnalyticsFilters
): string {
  const headers = ['Client Name', 'Avg Response Time (hrs)', 'Response Rate (%)']
  const rows = data.map((c) => [
    c.clientName,
    c.avgResponseTimeHours.toFixed(1),
    c.responseRate.toFixed(1),
  ])
  return buildCsv(headers, rows, `Client Responsiveness (${filters.from} to ${filters.to})`)
}

export function generateCsvFromDecisions(
  decisions: DrilldownDecision[],
  title: string
): string {
  const headers = [
    'Decision ID',
    'Title',
    'Project',
    'Status',
    'Stage',
    'Template',
    'Client',
    'Created',
    'Updated',
    'Response Time (hrs)',
  ]
  const rows = decisions.map((d) => [
    d.id,
    d.title,
    d.project_name,
    d.status,
    d.stage ?? '',
    d.template_name ?? '',
    d.client_name ?? '',
    d.created_at,
    d.updated_at,
    d.response_time_hours != null ? d.response_time_hours.toFixed(1) : '',
  ])
  return buildCsv(headers, rows, title)
}

function buildCsv(headers: string[], rows: string[][], title: string): string {
  const escape = (s: string) => {
    const str = String(s)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const headerLine = headers.map(escape).join(',')
  const dataLines = rows.map((r) => r.map(escape).join(','))
  const lines = [title, '', headerLine, ...dataLines]
  return lines.join('\n')
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function formatFilename(
  prefix: string,
  groupBy?: GroupByOption[],
  from?: string,
  to?: string
): string {
  const parts = [prefix]
  if (from) parts.push(from)
  if (to) parts.push(to)
  if (groupBy?.length) parts.push(groupBy.join('-'))
  return parts.join('_').replace(/-/g, '') + '.csv'
}
