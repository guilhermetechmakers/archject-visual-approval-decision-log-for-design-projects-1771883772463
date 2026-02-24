/**
 * Privacy Policy static content for Archject
 * Structured for display and PDF export
 */

import type { PrivacyPolicy } from '@/types/legal'

export const privacyPolicyData: PrivacyPolicy = {
  id: 'pp-archject-001',
  version: '1.0',
  lastUpdated: '2025-02-23',
  title: 'Privacy Policy',
  sections: [
    {
      id: 'intro',
      order: 0,
      title: 'Introduction',
      content: `Archject ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, retain, share, and protect your information when you use our visual approval and decision log platform for design projects. By using Archject, you agree to the practices described in this policy.`,
    },
    {
      id: 'data-collected',
      order: 1,
      title: 'Data Collected',
      content: `We collect information you provide when creating an account, using our services, or contacting us. This includes:

• Account information: email address, name, password (hashed)
• Workspace details: workspace name, project names, team member information
• Project data: decision logs, approvals, comments, annotations, and uploaded files
• Usage data: how you interact with our platform, feature usage, and session information
• Communication data: support requests, feedback, and correspondence

We may also automatically collect technical data such as IP address, browser type, device information, and cookies when you access our services.`,
    },
    {
      id: 'how-we-use',
      order: 2,
      title: 'How We Use Data',
      content: `We use your data to:

• Provide and improve our services, including the visual approval workflow and decision logging
• Process approvals, send notifications, and manage client portals
• Authenticate users and maintain account security
• Comply with legal obligations and enforce our terms
• Analyze usage patterns to improve product experience
• Communicate with you about updates, support, and marketing (with your consent where required)`,
    },
    {
      id: 'data-retention',
      order: 3,
      title: 'Data Retention',
      content: `We retain your data for as long as your account is active or as needed to provide services. After account closure, we may retain certain data for:

• Legal compliance and dispute resolution (typically up to 7 years)
• Backup and recovery purposes (for a limited period)
• Aggregated, anonymized analytics (indefinitely, as it no longer identifies you)

You may request deletion of your personal data subject to applicable law and our retention obligations.`,
    },
    {
      id: 'data-sharing',
      order: 4,
      title: 'Data Sharing and Disclosure',
      content: `We do not sell your data. We may share data with:

• Service providers who assist in operating our platform (hosting, analytics, email delivery) under confidentiality agreements
• Legal authorities when required by law or to protect our rights
• Affiliates or in connection with a merger, acquisition, or sale of assets (with notice to you)

We require third parties to protect your data and use it only for the purposes we specify.`,
    },
    {
      id: 'rights-of-users',
      order: 5,
      title: 'Rights of Users',
      content: `Depending on your location, you may have the right to:

• Access: Request a copy of your personal data
• Correction: Request correction of inaccurate data
• Deletion: Request deletion of your personal data
• Data portability: Receive your data in a structured, machine-readable format
• Object or restrict processing: Object to certain processing or request restriction
• Withdraw consent: Where processing is based on consent
• Lodge a complaint: With a supervisory authority in your jurisdiction

To exercise these rights, contact us using the information in the Contact section. We will respond within the timeframe required by applicable law.`,
    },
    {
      id: 'data-security',
      order: 6,
      title: 'Data Security',
      content: `We implement technical and organizational measures to protect your data, including:

• Encryption in transit (TLS) and at rest where applicable
• Access controls and authentication safeguards
• Regular security assessments and monitoring
• Employee training on data protection

While we strive to protect your data, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.`,
    },
    {
      id: 'data-residency',
      order: 7,
      title: 'International Transfers and Data Residency',
      content: `Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including:

• Standard contractual clauses approved by the European Commission
• Adequacy decisions where applicable
• Other lawful transfer mechanisms as required

For EU/EEA users, we provide additional information about data processing and your rights in the region notices below.`,
    },
    {
      id: 'policy-updates',
      order: 8,
      title: 'Policy Updates',
      content: `We may update this Privacy Policy from time to time. We will notify you of material changes by:

• Posting the updated policy on this page
• Updating the "Last updated" date
• Sending an email or in-app notification for significant changes

We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.`,
    },
    {
      id: 'contact',
      order: 9,
      title: 'Contact Information',
      content: `For questions about this Privacy Policy or to exercise your rights, contact us:

Archject
Email: privacy@archject.com
Website: https://archject.com

For EU/EEA users, you may also contact our data protection representative at the address above.`,
    },
  ],
  regionNotices: [
    {
      region: 'EU',
      content: `GDPR Notice (EU/EEA): If you are in the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR). Our legal basis for processing includes: (1) performance of a contract; (2) legitimate interests; (3) consent; and (4) legal obligation. You have the right to access, rectify, erase, restrict processing, data portability, object, and withdraw consent. You may lodge a complaint with your supervisory authority. Our EU data processing is conducted in accordance with applicable data residency requirements.`,
    },
    {
      region: 'US',
      content: `US Notice: For users in the United States, we comply with applicable federal and state privacy laws. We do not sell personal information as defined under the California Consumer Privacy Act (CCPA). California residents may have additional rights regarding their personal information.`,
    },
    {
      region: 'APAC',
      content: `APAC Notice: For users in the Asia-Pacific region, we process data in accordance with applicable local privacy laws. Where required, we obtain consent for data processing and provide mechanisms for you to access and correct your data.`,
    },
  ],
}

export const defaultBranding = {
  companyName: 'Archject',
  logoUrl: undefined,
  contactInfo: 'privacy@archject.com | https://archject.com',
}
