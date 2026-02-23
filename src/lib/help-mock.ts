import type { Article, FAQ, Guide, ChangelogEntry } from '@/types/help'

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Getting started with Archject',
    excerpt: 'Learn how to set up your first project and invite your team.',
    content: `
# Getting started with Archject

Archject helps you centralize design decisions and approvals. Follow these steps to get started.

## Create your first project

1. Go to **Projects** in the sidebar
2. Click **New Project**
3. Enter a name and optional description
4. Click **Create**

## Invite your team

1. Open your project
2. Go to **Team** settings
3. Add members by email
4. Assign roles (Viewer, Reviewer, Admin)

## Create a decision

1. In your project, go to **Decisions**
2. Click **New Decision**
3. Add design context and options
4. Share the link with stakeholders for approval
    `,
    category: 'General',
    tags: ['onboarding', 'basics'],
    publishedAt: '2025-01-15T10:00:00Z',
    readTime: '4 min',
  },
  {
    id: '2',
    title: 'Sharing decisions with clients',
    excerpt: 'How to share decision links and manage client access.',
    content: `
# Sharing decisions with clients

Share design decisions securely with clients using share links.

## Generate a share link

1. Open a decision
2. Click **Share** in the header
3. Copy the link or send via email
4. Set expiration if needed

## Client portal access

Clients can view decisions without an account. The link opens a read-only portal where they can:
- View design options
- Add comments
- Submit approvals
    `,
    category: 'Sharing',
    tags: ['sharing', 'clients', 'links'],
    publishedAt: '2025-01-20T10:00:00Z',
    readTime: '3 min',
  },
  {
    id: '3',
    title: 'Exporting decisions and reports',
    excerpt: 'Export your decisions to PDF, CSV, or integrate with your tools.',
    content: `
# Exporting decisions and reports

Export decision logs and reports for documentation or integration.

## PDF export

1. Open a decision or project
2. Click **Export** > **PDF**
3. Choose layout and include options
4. Download the file

## CSV export

Export decision metadata for spreadsheets or analytics.
    `,
    category: 'Exports',
    tags: ['export', 'pdf', 'reports'],
    publishedAt: '2025-01-22T10:00:00Z',
    readTime: '2 min',
  },
  {
    id: '4',
    title: 'Billing and subscription management',
    excerpt: 'Understand your plan, invoices, and how to upgrade.',
    content: `
# Billing and subscription management

Manage your Archject subscription and billing.

## Viewing invoices

1. Go to **Settings** > **Billing**
2. View past invoices
3. Download receipts

## Upgrading your plan

1. Go to **Settings** > **Billing**
2. Click **Upgrade**
3. Select your plan
4. Complete payment
    `,
    category: 'Billing',
    tags: ['billing', 'subscription', 'invoices'],
    publishedAt: '2025-01-25T10:00:00Z',
    readTime: '3 min',
  },
  {
    id: '5',
    title: 'Integrations overview',
    excerpt: 'Connect Archject with Figma, Slack, and other tools.',
    content: `
# Integrations overview

Archject integrates with popular design and collaboration tools.

## Available integrations

- **Figma** – Sync design files
- **Slack** – Notifications and approvals
- **Calendar** – Schedule review meetings
- **Zapier** – Custom workflows
    `,
    category: 'Integrations',
    tags: ['integrations', 'figma', 'slack'],
    publishedAt: '2025-01-28T10:00:00Z',
    readTime: '5 min',
  },
]

export const MOCK_FAQS: FAQ[] = [
  {
    id: '1',
    category: 'Sharing',
    question: 'How do I share a decision with a client?',
    answer:
      'Open the decision and click Share in the header. You can copy the link, send it via email, or set an expiration date. Clients can view and approve without creating an account.',
  },
  {
    id: '2',
    category: 'Sharing',
    question: 'Can I revoke a share link?',
    answer:
      'Yes. Go to the decision, open Share settings, and click Revoke link. A new link can be generated at any time.',
  },
  {
    id: '3',
    category: 'Exports',
    question: 'What formats can I export to?',
    answer:
      'You can export decisions to PDF for documentation and CSV for data analysis. PDF exports include design options, comments, and approval status.',
  },
  {
    id: '4',
    category: 'Exports',
    question: 'How do I export a full project report?',
    answer:
      'Go to your project, click Export, and choose Project Report. Select the date range and format (PDF or CSV).',
  },
  {
    id: '5',
    category: 'Billing',
    question: 'When am I charged?',
    answer:
      'You are charged at the start of each billing cycle (monthly or annually). You can view and download invoices from Settings > Billing.',
  },
  {
    id: '6',
    category: 'Billing',
    question: 'How do I cancel my subscription?',
    answer:
      'Go to Settings > Billing and click Manage subscription. You can cancel at any time; access continues until the end of the current billing period.',
  },
  {
    id: '7',
    category: 'General',
    question: 'What is the difference between a Reviewer and Admin?',
    answer:
      'Reviewers can view decisions, add comments, and submit approvals. Admins can also create and edit decisions, manage team members, and change project settings.',
  },
]

export const MOCK_GETTING_STARTED_STEPS = [
  { id: '1', label: 'Create your first project', completed: false },
  { id: '2', label: 'Invite team members', completed: false },
  { id: '3', label: 'Create a decision and add options', completed: false },
  { id: '4', label: 'Share with a client for approval', completed: false },
  { id: '5', label: 'Export your first report', completed: false },
]

export const MOCK_GUIDES: Guide[] = [
  {
    id: '1',
    title: 'Quick start for designers',
    summary: 'Get your first decision approved in under 10 minutes.',
    steps: [
      { id: '1', label: 'Create a project', completed: true },
      { id: '2', label: 'Add a decision with design options', completed: true },
      { id: '3', label: 'Share the link', completed: false },
      { id: '4', label: 'Collect approval', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Client portal setup',
    summary: 'Configure branding and client-facing settings.',
    steps: [
      { id: '1', label: 'Upload your logo', completed: false },
      { id: '2', label: 'Set brand colors', completed: false },
      { id: '3', label: 'Configure email templates', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Team collaboration',
    summary: 'Invite your team and assign roles.',
    steps: [
      { id: '1', label: 'Add team members', completed: false },
      { id: '2', label: 'Assign roles', completed: false },
      { id: '3', label: 'Set up notifications', completed: false },
    ],
  },
]

export const MOCK_CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.4.0',
    date: '2025-02-20',
    notes: `
## New features
- **Bulk export** – Export multiple decisions at once
- **Improved search** – Faster search across projects and decisions
- **Dark mode** – Full dark theme support

## Improvements
- Faster loading for large decision lists
- Better mobile experience for client portal
- Updated PDF export layout
    `,
  },
  {
    version: '2.3.1',
    date: '2025-02-10',
    notes: `
## Bug fixes
- Fixed share link expiration in some timezones
- Resolved PDF export for decisions with many options
- Corrected notification delivery for team invites
    `,
  },
  {
    version: '2.3.0',
    date: '2025-02-01',
    notes: `
## New features
- **Analytics dashboard** – Track approval times and bottlenecks
- **Custom fields** – Add metadata to decisions
- **Slack integration** – Get notified in Slack when clients approve

## Improvements
- Simplified onboarding flow
- Better error messages for failed exports
    `,
  },
]
