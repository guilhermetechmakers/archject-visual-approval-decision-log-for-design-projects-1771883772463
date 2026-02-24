# Legal Content Editing Guide

This guide explains how to update legal documents (Terms of Service, Privacy Policy) and the versioning workflow for the Archject platform.

## Document Structure

### Terms of Service

- **Data file:** `src/lib/terms-of-service-data.ts`
- **Structure:** `LegalDocument` with `sections` array
- **Each section:** `id`, `title`, `contentBlocks[]`
- **Content block types:** `paragraph`, `list`, `subheading`, `blockquote`, `link`

### Privacy Policy

- **Data file:** `src/lib/legal-data.ts`
- **Structure:** `PrivacyPolicy` with `sections` array
- **Each section:** `id`, `order`, `title`, `content` (markdown-style with `**bold**`)

## Updating Terms of Service

1. Open `src/lib/terms-of-service-data.ts`
2. Update `EFFECTIVE_DATE` and `LAST_UPDATED` (format: `YYYY-MM-DD`)
3. Increment `VERSION` (integer)
4. Edit sections:
   - **Add section:** Add new object to `sections` array with `id`, `title`, `contentBlocks`
   - **Edit section:** Modify `contentBlocks` within the section
   - **Content block examples:**
     - Paragraph: `{ type: 'paragraph', content: 'Your text...' }`
     - List: `{ type: 'list', bulletPoints: ['Item 1', 'Item 2'] }`
     - Subheading: `{ type: 'subheading', content: 'Subheading text' }`

## Updating Privacy Policy

1. Open `src/lib/legal-data.ts`
2. Update `LAST_UPDATED` and `VERSION`
3. Edit section `content` (supports `**bold**` for emphasis)
4. Ensure `order` values are sequential (0, 1, 2, ...)

## Versioning Workflow

1. **Create new version:** Edit the data file, increment version, update dates
2. **Publish:** Save the file; the frontend fetches the latest on load
3. **Metadata:** `effectiveDate` and `lastUpdated` are displayed automatically

## PDF Export

- Terms and Privacy both support "Export to PDF" and "Print"
- PDF uses the same content from the data files
- Header/footer and page breaks are applied automatically during export

## Placeholders (Templates)

Legal document templates support:

- `{{companyName}}` – Company name (default: Archject)
- `{{effectiveDate}}` – Document effective date
- `{{lastUpdated}}` – Last updated date
- `{{version}}` – Version number

Templates are in `src/lib/legal-templates.ts` for PDF generation.

## Contact

For technical questions about content updates, contact the development team.
