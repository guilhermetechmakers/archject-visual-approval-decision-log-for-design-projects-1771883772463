# Legal Documents API Specification

This document describes the data models, API endpoints (when backend is wired), and integration points for the Privacy Policy and legal document system.

## Data Models

### PrivacyPolicy

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| version | string | Policy version (e.g., "1.0") |
| lastUpdated | string | ISO date or formatted date |
| title | string | Document title (e.g., "Privacy Policy") |
| sections | PolicySection[] | Ordered content sections |
| regionNotices | RegionNotice[] | Region-specific notices (EU, US, APAC, etc.) |

### PolicySection

| Field | Type | Description |
|-------|------|-------------|
| id | string | Anchor ID for navigation |
| order | number | Display order |
| title | string | Section heading |
| content | string | Rich text (supports **bold** markdown) |

### RegionNotice

| Field | Type | Description |
|-------|------|-------------|
| region | string | Region code (EU, US, APAC, OTHER) |
| content | string | Notice text |

### Template

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Template identifier |
| name | string | PrivacyPolicy, TermsOfService, DecisionLogCover |
| version | string | Template version |
| contentTemplate | string | HTML/Markdown template |
| branding | TemplateBranding | Company branding |

### TemplateBranding

| Field | Type | Description |
|-------|------|-------------|
| companyName | string | Company name |
| logoUrl | string? | Logo URL for PDF |
| contactInfo | string | Contact email/address |

## API Endpoints (Future Backend)

When a backend is implemented, these endpoints should be exposed:

### GET /api/privacy-policy

Returns the current privacy policy.

**Response:**
```json
{
  "id": "uuid",
  "version": "1.0",
  "lastUpdated": "2025-02-23",
  "title": "Privacy Policy",
  "sections": [
    {
      "id": "intro",
      "order": 0,
      "title": "Introduction",
      "content": "..."
    }
  ],
  "regionNotices": [
    {
      "region": "EU",
      "content": "..."
    }
  ]
}
```

### GET /api/privacy-policy/export

Exports the privacy policy as PDF.

**Query Parameters:**
- `format` (optional): `pdf` (default)
- `region` (optional): EU, US, APAC, OTHER
- `includeNotices` (optional): boolean, default true

**Response:** `application/pdf` or signed download URL

### GET /api/regions

Returns available regions for notices.

**Response:**
```json
{
  "regions": ["EU", "US", "APAC", "OTHER"]
}
```

## Current Implementation

- **Data source:** Static data in `src/lib/legal-data.ts`
- **API layer:** `src/api/legal.ts` (returns mock data via `getPrivacyPolicy`, `getRegions`)
- **PDF export:** Client-side via `html2pdf.js` in `src/lib/pdf-export-service.ts`
- **Templates:** `src/lib/legal-templates.ts` (buildPrivacyPolicyHtml, buildTermsOfServiceHtml, buildDecisionLogCoverHtml)

## Routes

| Path | Component |
|------|-----------|
| /privacy | PrivacyPage |
| /privacy-policy | PrivacyPage |
| /legal/privacy | PrivacyPage |

## Security Notes

- Policy content is public (no auth required)
- PDF export can be gated by auth if required
- Sanitize policy text to prevent injection in templates (escapeHtml used in templates)
