/**
 * Terms of Service content - structured for display and PDF export.
 * Supports Usage, Prohibited Actions, IP, Liability, Service Levels,
 * Indemnification, Governing Law, Dispute Resolution, Modifications,
 * Termination, and Contact sections.
 */

import type { LegalDocument } from '@/types/legal'

const EFFECTIVE_DATE = '2025-02-24'
const LAST_UPDATED = '2025-02-24'
const VERSION = 1

export const termsOfServiceDocument: LegalDocument = {
  id: 'terms-of-service-v1',
  name: 'Terms of Service',
  version: VERSION,
  effectiveDate: EFFECTIVE_DATE,
  lastUpdated: LAST_UPDATED,
  brandingMeta: {
    companyName: 'Archject',
    logoUrl: undefined,
  },
  sections: [
    {
      id: 'usage',
      title: 'Usage',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'By accessing or using Archject ("the Platform"), you agree to be bound by these Terms of Service. Archject provides a visual approval and decision log platform for design projects, enabling teams to track decisions, approvals, and feedback in a structured manner.',
        },
        {
          type: 'paragraph',
          content:
            'You may use the Platform only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the Platform complies with all applicable laws and regulations.',
        },
        {
          type: 'subheading',
          content: 'Permitted Actions',
        },
        {
          type: 'list',
          content: '',
          bulletPoints: [
            'Create and manage workspaces, projects, and decision logs',
            'Invite team members and collaborate on design decisions',
            'Upload and share design assets and feedback',
            'Export decision logs and reports for your records',
            'Use the Platform in accordance with your subscription plan',
          ],
        },
      ],
    },
    {
      id: 'prohibited-actions',
      title: 'Prohibited Actions',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'You agree not to use the Platform in any way that violates these Terms or applicable law. The following actions are expressly prohibited:',
        },
        {
          type: 'list',
          content: '',
          bulletPoints: [
            'Sharing account credentials or allowing unauthorized access',
            'Using the Platform to distribute malware, spam, or harmful content',
            'Reverse engineering, decompiling, or attempting to extract source code',
            'Circumventing security measures or access controls',
            'Using automated systems (bots, scrapers) without prior written consent',
            'Reselling or sublicensing the Platform without authorization',
            'Using the Platform to infringe on third-party intellectual property rights',
          ],
        },
        {
          type: 'paragraph',
          content:
            'We reserve the right to suspend or terminate accounts that violate these prohibitions.',
        },
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'Archject and its licensors retain all rights, title, and interest in the Platform, including but not limited to software, design, trademarks, and documentation. You do not acquire any ownership rights by using the Platform.',
        },
        {
          type: 'paragraph',
          content:
            'You retain ownership of content you upload or create ("User Content"). By using the Platform, you grant Archject a limited, non-exclusive, royalty-free license to host, store, and display your User Content solely to provide the service.',
        },
        {
          type: 'subheading',
          content: 'License Limitations',
        },
        {
          type: 'paragraph',
          content:
            'You may not copy, modify, distribute, or create derivative works of the Platform without our prior written consent. Any feedback you provide may be used by Archject without obligation to you.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'To the maximum extent permitted by law, Archject and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.',
        },
        {
          type: 'paragraph',
          content:
            'Our total liability for any claims arising from or related to these Terms or the Platform shall not exceed the amount you paid to Archject in the twelve (12) months preceding the claim.',
        },
        {
          type: 'subheading',
          content: 'Disclaimers',
        },
        {
          type: 'paragraph',
          content:
            'The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or secure.',
        },
      ],
    },
    {
      id: 'service-levels',
      title: 'Service Levels',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'We strive to maintain high availability for the Platform. Our target uptime is 99.5% measured monthly, excluding scheduled maintenance.',
        },
        {
          type: 'subheading',
          content: 'Maintenance Windows',
        },
        {
          type: 'paragraph',
          content:
            'We may perform scheduled maintenance with at least 48 hours notice. Emergency maintenance may be performed without prior notice when necessary to protect the security or stability of the service.',
        },
        {
          type: 'subheading',
          content: 'Support',
        },
        {
          type: 'paragraph',
          content:
            'Support is available via email and in-app chat. Response times vary by plan tier. Enterprise customers receive dedicated support as specified in their agreement.',
        },
      ],
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'You agree to indemnify, defend, and hold harmless Archject and its affiliates from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys\' fees) arising from:',
        },
        {
          type: 'list',
          content: '',
          bulletPoints: [
            'Your use of the Platform',
            'Your violation of these Terms',
            'Your User Content or any infringement of third-party rights',
            'Your violation of applicable law',
          ],
        },
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Archject is incorporated, without regard to its conflict of law provisions.',
        },
        {
          type: 'paragraph',
          content:
            'You agree that any legal action or proceeding relating to these Terms shall be brought exclusively in the courts of that jurisdiction.',
        },
      ],
    },
    {
      id: 'dispute-resolution',
      title: 'Dispute Resolution',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'Before initiating any formal dispute, you agree to contact us at legal@archject.com to attempt to resolve the matter informally. We will make good faith efforts to resolve disputes within 30 days.',
        },
        {
          type: 'paragraph',
          content:
            'If informal resolution fails, disputes may be resolved through binding arbitration in accordance with the rules of the applicable arbitration body, except where prohibited by law.',
        },
      ],
    },
    {
      id: 'modifications',
      title: 'Modifications',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'We may modify these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date.',
        },
        {
          type: 'paragraph',
          content:
            'For significant changes, we may also send an email or in-app notification. Your continued use of the Platform after the effective date of changes constitutes acceptance of the modified Terms.',
        },
        {
          type: 'paragraph',
          content:
            'If you do not agree to the modified Terms, you must stop using the Platform and may terminate your account.',
        },
      ],
    },
    {
      id: 'termination',
      title: 'Termination',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'You may terminate your account at any time through your account settings. We may suspend or terminate your access to the Platform for violation of these Terms or for any other reason at our discretion.',
        },
        {
          type: 'paragraph',
          content:
            'Upon termination, your right to use the Platform ceases immediately. We may retain your data for a reasonable period as required by law or for legitimate business purposes.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      contentBlocks: [
        {
          type: 'paragraph',
          content:
            'For questions about these Terms of Service, please contact us:',
        },
        {
          type: 'list',
          content: '',
          bulletPoints: [
            'Email: legal@archject.com',
            'General inquiries: support@archject.com',
            'Privacy matters: privacy@archject.com',
          ],
        },
        {
          type: 'paragraph',
          content:
            'We aim to respond to legal inquiries within 5 business days.',
        },
      ],
    },
  ],
}
