/**
 * Privacy Policy content and region notices.
 * Structured for display and PDF export.
 */

import type { PrivacyPolicy, RegionNotice } from '@/types/legal'

const LAST_UPDATED = '2025-02-23'
const VERSION = '1.0'

const sections = [
  {
    id: 'intro',
    order: 0,
    title: 'Introduction',
    content: `Archject ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, retain, share, and protect your personal data when you use our visual approval and decision log platform for design projects. By using Archject, you agree to the practices described in this policy.`,
  },
  {
    id: 'data-collected',
    order: 1,
    title: 'Data Collected',
    content: `We collect information you provide directly and data generated through your use of our services:

**Account and Profile Data:** Email address, name, password (hashed), and profile information you provide when creating an account.

**Workspace and Project Data:** Workspace names, project titles, descriptions, team member information, and client details you add to Archject.

**Decision and Approval Data:** Decisions, approvals, comments, timestamps, and metadata associated with design decisions and approval workflows.

**Usage Data:** Logs of how you interact with our platform, including pages visited, features used, and session duration.

**Technical Data:** IP address, browser type, device information, and similar technical identifiers.`,
  },
  {
    id: 'how-we-use',
    order: 2,
    title: 'How We Use Data',
    content: `We use your data to:

- Provide, maintain, and improve our services
- Process approvals and manage decision workflows
- Send notifications, updates, and support communications
- Authenticate users and enforce security
- Analyze usage to improve product experience
- Comply with legal obligations and enforce our terms`,
  },
  {
    id: 'data-retention',
    order: 3,
    title: 'Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for:

- Legal and regulatory compliance (e.g., tax, audit)
- Resolving disputes and enforcing agreements
- Legitimate business purposes (e.g., anonymized analytics)

Aggregated or anonymized data may be retained indefinitely.`,
  },
  {
    id: 'data-sharing',
    order: 4,
    title: 'Data Sharing and Disclosure',
    content: `We do not sell your personal data. We may share data with:

**Service Providers:** Providers who assist in operating our platform (hosting, analytics, email, support) under strict confidentiality agreements.

**Legal Requirements:** When required by law, court order, or regulatory authority.

**Business Transfers:** In connection with a merger, acquisition, or sale of assets, with appropriate safeguards.

**With Your Consent:** When you explicitly authorize us to share data with third parties.`,
  },
  {
    id: 'rights-of-users',
    order: 5,
    title: 'Rights of Users',
    content: `Depending on your location, you may have the following rights:

- **Access:** Request a copy of your personal data
- **Correction:** Request correction of inaccurate data
- **Deletion:** Request deletion of your data (subject to legal exceptions)
- **Data Portability:** Receive your data in a structured, machine-readable format
- **Object:** Object to processing based on legitimate interests
- **Restrict:** Request restriction of processing in certain circumstances
- **Withdraw Consent:** Withdraw consent where processing is consent-based

To exercise these rights, contact us using the contact information below.`,
  },
  {
    id: 'data-security',
    order: 6,
    title: 'Data Security',
    content: `We implement appropriate technical and organizational measures to protect your data, including:

- Encryption in transit (TLS) and at rest (AES)
- Access controls and authentication
- Regular security assessments and monitoring
- Employee training on data protection

While we strive to protect your data, no method of transmission is 100% secure.`,
  },
  {
    id: 'data-residency',
    order: 7,
    title: 'International Transfers and Data Residency',
    content: `Your data may be processed in countries outside your residence. When we transfer data internationally, we ensure appropriate safeguards are in place, such as:

- Standard contractual clauses (SCCs)
- Adequacy decisions where applicable
- Privacy Shield or equivalent frameworks where recognized

For EU/EEA users, we ensure data residency and transfer mechanisms comply with applicable regulations.`,
  },
  {
    id: 'policy-updates',
    order: 8,
    title: 'Policy Updates',
    content: `We may update this Privacy Policy from time to time. We will notify you of material changes by:

- Posting the updated policy on this page
- Updating the "Last updated" date
- Sending an email or in-app notification for significant changes

We encourage you to review this policy periodically. Continued use after changes constitutes acceptance.`,
  },
  {
    id: 'contact',
    order: 9,
    title: 'How to Contact Us',
    content: `For questions about this Privacy Policy or to exercise your rights, contact us:

**Email:** privacy@archject.com
**Address:** Archject, Privacy Team, [Company Address]
**Data Protection Officer:** dpo@archject.com (for EU residents)`,
  },
]

const regionNotices: RegionNotice[] = [
  {
    region: 'EU',
    content: `**GDPR Notice for EU/EEA Users:** If you are in the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority. Our legal basis for processing includes contract performance, legitimate interests, and consent where applicable. Data residency for EU users is maintained within the EU where possible.`,
  },
  {
    region: 'US',
    content: `**US Privacy Notice:** For residents of California, Virginia, Colorado, and other states with privacy laws, you may have additional rights regarding disclosure, access, and deletion.`,
  },
  {
    region: 'APAC',
    content: `**APAC Privacy Notice:** For users in Australia, Japan, and other APAC regions, we comply with applicable local privacy laws and data protection requirements.`,
  },
]

export const privacyPolicy: PrivacyPolicy = {
  id: 'privacy-policy-v1',
  version: VERSION,
  lastUpdated: LAST_UPDATED,
  title: 'Privacy Policy',
  sections,
  regionNotices,
}

export const defaultBranding = {
  companyName: 'Archject',
  logoUrl: undefined,
  contactInfo: 'privacy@archject.com',
}
