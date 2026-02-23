# Analytics & Reports API

API contracts and data models for the Archject Analytics & Reports module.

## Endpoints

### GET /api/analytics/studio

Returns studio-level analytics: KPIs, time-series, bottleneck stages, template performance, and client responsiveness.

**Query parameters:**
- `from` (required): Start date (ISO 8601, e.g. `2025-02-01`)
- `to` (required): End date (ISO 8601)
- `groupBy` (optional): Comma-separated `PROJECT`, `CLIENT`, or `TEMPLATE`

**Response:**
```json
{
  "kpis": {
    "averageTimeToApprove": 32,
    "pendingDecisions": 12,
    "clientApprovalRate": 78,
    "deltaTimeToApprove": -8,
    "deltaPending": 2,
    "deltaApprovalRate": 5
  },
  "timeSeries": [{ "date": "2025-02-01", "approvals": 4, "pending": 2, "avgTimeHours": 28 }],
  "bottleneckStages": [{ "stage": "Pending client review", "count": 8, "percentage": 42 }],
  "templatePerformance": [{ "id": "t1", "name": "Finishes selection", "usageCount": 24, "avgApprovalTimeHours": 28, "successRate": 85 }],
  "clientResponsiveness": [{ "clientId": "c1", "clientName": "Acme Corp", "avgResponseTimeHours": 24, "responseRate": 88 }]
}
```

### GET /api/analytics/studio/drilldown

Returns filtered decisions for drill-down views.

**Query parameters:**
- `type` (required): `bottleneck` | `pending` | `approved` | `overdue`
- `from`, `to` (required): Date range
- `stage` (optional): Bottleneck stage name when `type=bottleneck`
- `projectIds`, `clientIds`, `templateIds` (optional): Filter by IDs
- `page`, `pageSize` (optional): Pagination

**Response:**
```json
{
  "decisions": [{ "id": "d1", "project_id": "p1", "project_name": "...", "title": "...", "status": "pending", "stage": "...", "created_at": "...", "updated_at": "...", "response_time_hours": 52 }],
  "total": 5,
  "page": 1,
  "pageSize": 25
}
```

### GET /api/reports/custom

Same response shape as `/api/analytics/studio`. Used for custom report generation with filters.

### POST /api/reports/export

**Body:**
```json
{
  "type": "csv" | "pdf",
  "from": "2025-02-01",
  "to": "2025-02-28",
  "groupBy": ["PROJECT", "CLIENT"],
  "filters": {}
}
```

**Response:**
```json
{
  "url": "https://...",
  "expiresAt": "2025-02-24T12:00:00Z"
}
```

### POST /api/reports/schedule

**Body:**
```json
{
  "format": "csv" | "pdf",
  "cadence": "daily" | "weekly" | "monthly",
  "recipients": ["email@example.com"],
  "from": "2025-02-01",
  "to": "2025-02-28",
  "groupBy": ["TEMPLATE"],
  "filters": {}
}
```

**Response:**
```json
{
  "id": "schedule-123"
}
```

## Data Models

- **decisions**: id, project_id, template_id, client_id, stage, created_at, updated_at, approved_at, due_at, response_time_ms
- **templates**: id, name, usage_count, last_used_at
- **projects**: id, name, studio_id, status, created_at
- **clients**: id, name, avg_response_time_ms, last_response_at, approval_rate
- **analytics_snapshots**: id, studio_id, period_start, period_end, avg_time_to_approve, pending_count, approval_rate, bottleneck_count

## Mock Data

When `VITE_API_URL` is not set, the frontend uses mock data from `src/lib/analytics-mock.ts`. To connect to a real backend, set `VITE_API_URL` in `.env` and implement the endpoints above.
