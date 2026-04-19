// In-memory mock data stores for development
// Uses globalThis to survive HMR reloads in Next.js dev mode

const now = new Date();
const dayMs = 24 * 60 * 60 * 1000;

function daysFromNow(days: number) {
  return new Date(now.getTime() + days * dayMs).toISOString();
}

// Singleton pattern: only initialize seed data once
const g = globalThis as any;
if (!g.__mockStoreInitialized) {
  g.__mockStoreInitialized = true;
  g.__mockProjects = undefined;
  g.__mockSubProjects = undefined;
  g.__mockMeetings = undefined;
  g.__mockParticipants = undefined;
  g.__mockSignatures = undefined;
  g.__mockRecordings = undefined;
  g.__mockTranscripts = undefined;
  g.__mockBundles = undefined;
  g.__mockTemplates = undefined;
  g.__mockSummaries = undefined;
  g.__mockAuditLogs = undefined;
  g.__mockGuestTokens = undefined;
  g.__mockCalendarEvents = undefined;
  g.__mockDocumentVersions = undefined;
  g.__mockNotifications = undefined;
  g.__mockNDAAnalyses = undefined;
  g.__mockTags = undefined;
  g.__mockResourceTags = undefined;
  g.__mockSubscriptions = undefined;
  g.__mockAnalytics = undefined;
}

const _seedProjects: any[] = [
  {
    id: 'proj-001',
    ownerId: 'mock-user-001',
    name: 'Acme Corp Partnership',
    description: 'Strategic partnership discussions with Acme Corporation',
    status: 'active',
    metadata: {},
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-2),
  },
  {
    id: 'proj-002',
    ownerId: 'mock-user-001',
    name: 'TechStart Acquisition',
    description: 'Due diligence and acquisition discussions',
    status: 'active',
    metadata: {},
    createdAt: daysFromNow(-14),
    updatedAt: daysFromNow(-1),
  },
  {
    id: 'proj-003',
    ownerId: 'mock-user-001',
    name: 'Global Expansion - APAC',
    description: 'Market entry strategy and partnership discussions for Asia-Pacific expansion. Includes vendor evaluations, local compliance review, and distributor NDAs.',
    status: 'active',
    metadata: {},
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-1),
  },
];

const _seedSubProjects: any[] = [
  {
    id: 'sub-001',
    projectId: 'proj-001',
    parentSubProjectId: null,
    name: 'Initial Discussions',
    description: 'First round of partnership discussions',
    status: 'active',
    createdAt: daysFromNow(-28),
    updatedAt: daysFromNow(-10),
  },
  {
    id: 'sub-002',
    projectId: 'proj-001',
    parentSubProjectId: null,
    name: 'Contract Negotiation',
    description: 'Legal contract negotiations phase',
    status: 'active',
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-3),
  },
  {
    id: 'sub-003',
    projectId: 'proj-001',
    parentSubProjectId: 'sub-002',
    name: 'Term Sheet Review',
    description: 'Reviewing term sheets with legal team',
    status: 'active',
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-3),
  },
  {
    id: 'sub-004',
    projectId: 'proj-002',
    parentSubProjectId: null,
    name: 'Due Diligence',
    description: 'Financial and legal due diligence',
    status: 'active',
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-1),
  },
  {
    id: 'sub-005',
    projectId: 'proj-003',
    parentSubProjectId: null,
    name: 'Japan Market Entry',
    description: 'Partnership with Tokyo-based distributors',
    status: 'active',
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-2),
  },
  {
    id: 'sub-006',
    projectId: 'proj-003',
    parentSubProjectId: null,
    name: 'Singapore Compliance',
    description: 'Regulatory review and local legal framework',
    status: 'active',
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-2),
  },
  {
    id: 'sub-007',
    projectId: 'proj-003',
    parentSubProjectId: 'sub-005',
    name: 'Sakura Corp Partnership',
    description: 'Distribution agreement with Sakura Corporation',
    status: 'active',
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-1),
  },
];

const _seedMeetings: any[] = [
  {
    id: 'meet-001',
    projectId: 'proj-001',
    subProjectId: 'sub-001',
    hostId: 'mock-user-001',
    title: 'Acme Partnership Kickoff',
    description: 'Initial meeting to discuss partnership terms',
    scheduledAt: daysFromNow(-20),
    startedAt: daysFromNow(-20),
    endedAt: daysFromNow(-20),
    durationSeconds: 3600,
    status: 'completed',
    roomName: null,
    roomUrl: null,
    ndaTemplateId: 'template-generic',
    ndaRequired: true,
    ndaCustomizedContent: null,
    hostSignedAt: daysFromNow(-21),
    invitesSentAt: daysFromNow(-21),
    recordingEnabled: true,
    transcriptionEnabled: true,
    metadata: {},
    createdAt: daysFromNow(-22),
    updatedAt: daysFromNow(-20),
  },
  {
    id: 'meet-002',
    projectId: 'proj-001',
    subProjectId: 'sub-002',
    hostId: 'mock-user-001',
    title: 'Contract Review Session',
    description: 'Review initial contract draft with Acme legal team',
    scheduledAt: daysFromNow(2),
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    status: 'awaiting_signatures',
    roomName: null,
    roomUrl: null,
    ndaTemplateId: 'template-mergers',
    ndaRequired: true,
    ndaCustomizedContent: 'CUSTOM MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Mutual Non-Disclosure Agreement is made effective as of today.\n\nBETWEEN:\nLegalMeet Inc. ("First Party") AND Acme Corporation ("Second Party")\n\n1. PURPOSE\nThe Parties wish to explore a potential business relationship and may need to disclose Confidential Information.\n\n2. CONFIDENTIAL INFORMATION\nIncludes all information disclosed by either Party, whether oral, written, or electronic.\n\n3. TERM\nEffective for 2 years.',
    hostSignedAt: daysFromNow(-1),
    invitesSentAt: daysFromNow(-1),
    recordingEnabled: true,
    transcriptionEnabled: true,
    metadata: {},
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-1),
  },
  {
    id: 'meet-004',
    projectId: 'proj-003',
    subProjectId: 'sub-007',
    hostId: 'mock-user-001',
    title: 'Tokyo Distributor Intro Call',
    description: 'Initial meeting with Sakura Corp to discuss distribution partnership',
    scheduledAt: daysFromNow(7),
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    status: 'scheduled',
    roomName: null,
    roomUrl: null,
    ndaTemplateId: 'template-vendor',
    ndaRequired: true,
    ndaCustomizedContent: null,
    hostSignedAt: null,
    invitesSentAt: null,
    recordingEnabled: true,
    transcriptionEnabled: true,
    metadata: {},
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-3),
  },
  {
    id: 'meet-005',
    projectId: 'proj-003',
    subProjectId: 'sub-006',
    hostId: 'mock-user-001',
    title: 'Singapore Regulatory Briefing',
    description: 'Compliance review with local legal counsel',
    scheduledAt: daysFromNow(10),
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    status: 'awaiting_signatures',
    roomName: null,
    roomUrl: null,
    ndaTemplateId: 'template-generic',
    ndaRequired: true,
    ndaCustomizedContent: 'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis NDA is between LegalMeet Inc. and Chen & Associates LLP for the purpose of discussing regulatory compliance in Singapore.\n\n1. CONFIDENTIAL INFORMATION\nAll regulatory filings, compliance reports, and legal opinions shared during discussions.\n\n2. TERM\nEffective for 2 years from the date of execution.\n\n3. GOVERNING LAW\nGoverned by the laws of Singapore.',
    hostSignedAt: daysFromNow(-2),
    invitesSentAt: daysFromNow(-2),
    recordingEnabled: false,
    transcriptionEnabled: true,
    metadata: {},
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-2),
  },
  {
    id: 'meet-003',
    projectId: 'proj-002',
    subProjectId: 'sub-004',
    hostId: 'mock-user-001',
    title: 'TechStart Financial Review',
    description: 'Review financials with TechStart CFO',
    scheduledAt: daysFromNow(5),
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    status: 'scheduled',
    roomName: null,
    roomUrl: null,
    ndaTemplateId: 'template-generic',
    ndaRequired: true,
    ndaCustomizedContent: null,
    hostSignedAt: null,
    invitesSentAt: null,
    recordingEnabled: true,
    transcriptionEnabled: true,
    metadata: {},
    createdAt: daysFromNow(-2),
    updatedAt: daysFromNow(-2),
  },
];

const _seedParticipants: any[] = [
  // meet-001 participants (completed meeting)
  {
    id: 'part-001', meetingId: 'meet-001', userId: 'mock-user-001',
    email: 'demo@legalmeet.com', displayName: 'Demo User', role: 'host',
    joinedAt: daysFromNow(-20), leftAt: daysFromNow(-20), ndaSignedAt: daysFromNow(-21),
    status: 'left', createdAt: daysFromNow(-22),
  },
  {
    id: 'part-002', meetingId: 'meet-001', userId: null,
    email: 'john@acme.com', displayName: 'John Smith', role: 'participant',
    joinedAt: daysFromNow(-20), leftAt: daysFromNow(-20), ndaSignedAt: daysFromNow(-20),
    status: 'left', createdAt: daysFromNow(-22),
  },
  // meet-002 participants (awaiting signatures - host signed, participant pending)
  {
    id: 'part-003', meetingId: 'meet-002', userId: 'mock-user-001',
    email: 'demo@legalmeet.com', displayName: 'Demo User', role: 'host',
    joinedAt: null, leftAt: null, ndaSignedAt: daysFromNow(-1),
    status: 'invited', createdAt: daysFromNow(-3),
  },
  {
    id: 'part-004', meetingId: 'meet-002', userId: null,
    email: 'sarah@acme.com', displayName: 'Sarah Johnson', role: 'participant',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-3),
  },
  // meet-003 participants (scheduled - no one signed yet)
  {
    id: 'part-005', meetingId: 'meet-003', userId: 'mock-user-001',
    email: 'demo@legalmeet.com', displayName: 'Demo User', role: 'host',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-2),
  },
  {
    id: 'part-006', meetingId: 'meet-003', userId: null,
    email: 'mike@techstart.io', displayName: 'Mike Chen', role: 'participant',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-2),
  },
  // meet-004 participants (Tokyo Distributor - scheduled, no signatures)
  {
    id: 'part-007', meetingId: 'meet-004', userId: 'mock-user-001',
    email: 'demo@legalmeet.com', displayName: 'Demo User', role: 'host',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-3),
  },
  {
    id: 'part-008', meetingId: 'meet-004', userId: null,
    email: 'tanaka@sakura.co.jp', displayName: 'Yuki Tanaka', role: 'participant',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-3),
  },
  {
    id: 'part-009', meetingId: 'meet-004', userId: null,
    email: 'sato@sakura.co.jp', displayName: 'Kenji Sato', role: 'participant',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-3),
  },
  // meet-005 participants (Singapore Regulatory - awaiting signatures, host signed, participant pending)
  {
    id: 'part-010', meetingId: 'meet-005', userId: 'mock-user-001',
    email: 'demo@legalmeet.com', displayName: 'Demo User', role: 'host',
    joinedAt: null, leftAt: null, ndaSignedAt: daysFromNow(-2),
    status: 'invited', createdAt: daysFromNow(-4),
  },
  {
    id: 'part-011', meetingId: 'meet-005', userId: null,
    email: 'li.wei@chenlaw.sg', displayName: 'Li Wei Chen', role: 'participant',
    joinedAt: null, leftAt: null, ndaSignedAt: null,
    status: 'invited', createdAt: daysFromNow(-4),
  },
];

const _seedSignatures: any[] = [
  {
    id: 'sig-001', meetingId: 'meet-001', participantId: 'part-001',
    templateId: 'template-basic', ndaContentSnapshot: 'Basic NDA content...',
    signatureData: 'data:image/png;base64,mock-signature-host',
    signatureHash: '00000000abcdef01', signerEmail: 'demo@legalmeet.com',
    signerName: 'Demo User', signerIp: '127.0.0.1', userAgent: 'mock',
    signedAt: daysFromNow(-21), verificationToken: 'verify-001', verified: true,
    createdAt: daysFromNow(-21),
  },
  {
    id: 'sig-002', meetingId: 'meet-001', participantId: 'part-002',
    templateId: 'template-basic', ndaContentSnapshot: 'Basic NDA content...',
    signatureData: 'data:image/png;base64,mock-signature-john',
    signatureHash: '00000000abcdef02', signerEmail: 'john@acme.com',
    signerName: 'John Smith', signerIp: '127.0.0.1', userAgent: 'mock',
    signedAt: daysFromNow(-20), verificationToken: 'verify-002', verified: true,
    createdAt: daysFromNow(-20),
  },
  {
    id: 'sig-003', meetingId: 'meet-002', participantId: 'part-003',
    templateId: 'template-custom', ndaContentSnapshot: 'Custom NDA content...',
    signatureData: 'data:image/png;base64,mock-signature-host-2',
    signatureHash: '00000000abcdef03', signerEmail: 'demo@legalmeet.com',
    signerName: 'Demo User', signerIp: '127.0.0.1', userAgent: 'mock',
    signedAt: daysFromNow(-1), verificationToken: 'verify-003', verified: true,
    createdAt: daysFromNow(-1),
  },
];

const _seedRecordings: any[] = [
  {
    id: 'rec-001', meetingId: 'meet-001', providerId: 'daily-rec-001',
    storagePath: '/recordings/meet-001/recording.webm',
    storageUrl: '/mock/recordings/meet-001.webm',
    durationSeconds: 3600, fileSizeBytes: 52428800, mimeType: 'video/webm',
    status: 'ready', encryptionKeyId: null,
    startedAt: daysFromNow(-20), endedAt: daysFromNow(-20),
    createdAt: daysFromNow(-20), updatedAt: daysFromNow(-20),
  },
];

const _seedTranscripts: any[] = [
  {
    id: 'trans-001', meetingId: 'meet-001', recordingId: 'rec-001',
    content: [
      { speaker: 'Demo User', text: 'Welcome to the partnership kickoff meeting.', timestamp: '00:00:05', confidence: 0.98 },
      { speaker: 'John Smith', text: 'Thank you for having us. We are excited about this opportunity.', timestamp: '00:00:15', confidence: 0.96 },
      { speaker: 'Demo User', text: 'Let us go through the key terms of our partnership agreement.', timestamp: '00:00:30', confidence: 0.97 },
    ],
    fullText: 'Welcome to the partnership kickoff meeting. Thank you for having us. We are excited about this opportunity. Let us go through the key terms of our partnership agreement.',
    language: 'en', provider: 'deepgram', model: 'nova-2',
    status: 'completed', wordCount: 32,
    createdAt: daysFromNow(-20), updatedAt: daysFromNow(-20),
  },
];

const _seedBundles: any[] = [
  {
    id: 'bundle-001', meetingId: 'meet-001',
    pdfStoragePath: '/bundles/meet-001/bundle.pdf',
    pdfUrl: '/mock/bundles/meet-001.pdf',
    includesNda: true, includesRecording: true, includesTranscript: true,
    status: 'ready', generatedAt: daysFromNow(-19),
    createdAt: daysFromNow(-19),
  },
];

const _seedTemplates: any[] = [
  // 1. Generic / Standard Mutual NDA (default)
  {
    id: 'template-generic',
    ownerId: 'mock-user-001',
    name: 'Standard Mutual NDA',
    description: 'A general-purpose mutual non-disclosure agreement suitable for most business discussions.',
    category: 'general',
    content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{party_a}} ("First Party") and {{party_b}} ("Second Party"), collectively referred to as the "Parties."

RECITALS
The Parties wish to explore a potential business relationship ("Purpose") and, in connection with the Purpose, may disclose to each other certain confidential and proprietary information.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any and all non-public information disclosed by either Party, whether orally, in writing, electronically, or by inspection, including but not limited to: business plans, financial data, customer lists, trade secrets, technical data, product designs, strategies, and any other proprietary information.

2. OBLIGATIONS OF THE RECEIVING PARTY
Each Party, as Receiving Party, agrees to:
(a) Hold Confidential Information in strict confidence;
(b) Not disclose it to any third party without prior written consent;
(c) Use it solely for the Purpose;
(d) Limit internal access to employees and advisors who need to know;
(e) Protect it with at least the same degree of care used for its own confidential information, but no less than reasonable care.

3. EXCLUSIONS
Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of the Receiving Party;
(b) Was known to the Receiving Party prior to disclosure;
(c) Is independently developed without use of Confidential Information;
(d) Is lawfully obtained from a third party without restriction.

4. TERM AND TERMINATION
This Agreement shall remain in effect for {{term_duration}} from the Effective Date. Obligations of confidentiality shall survive termination for a period of {{survival_period}}.

5. RETURN OF MATERIALS
Upon termination or request, each Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.

6. REMEDIES
Each Party acknowledges that breach may cause irreparable harm, and the non-breaching Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.

7. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of {{jurisdiction}}.

8. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the Parties regarding the subject matter hereof and supersedes all prior negotiations and agreements.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.`,
    templateVars: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'party_a', label: 'First Party (Full Legal Name)', type: 'text', required: true },
      { name: 'party_b', label: 'Second Party (Full Legal Name)', type: 'text', required: true },
      { name: 'term_duration', label: 'Term Duration (e.g., 2 years)', type: 'text', required: true },
      { name: 'survival_period', label: 'Survival Period (e.g., 3 years)', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
    ],
    isDefault: true, version: 1, status: 'active',
    createdAt: daysFromNow(-60), updatedAt: daysFromNow(-60),
  },

  // 2. Employment / Hiring NDA
  {
    id: 'template-employment',
    ownerId: 'mock-user-001',
    name: 'Employment / Hiring NDA',
    description: 'For new hires, contractors, or candidates with access to company-internal information.',
    category: 'employment',
    content: `EMPLOYEE NON-DISCLOSURE AGREEMENT

This Employee Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{company_name}}, a company organized under the laws of {{jurisdiction}} ("Company"), and {{employee_name}} ("Employee").

RECITALS
The Employee will have access to the Company's confidential and proprietary information in connection with their role as {{employee_role}}.

1. CONFIDENTIAL INFORMATION
"Confidential Information" includes, without limitation: trade secrets, inventions, product roadmaps, source code, algorithms, customer data, financial records, marketing strategies, employee information, vendor contracts, and any other proprietary data of the Company.

2. EMPLOYEE OBLIGATIONS
The Employee agrees to:
(a) Not disclose Confidential Information to any person or entity outside the Company;
(b) Not use Confidential Information for personal gain or for the benefit of any third party;
(c) Take all reasonable precautions to prevent unauthorized disclosure;
(d) Not copy, reproduce, or remove Confidential Information from Company premises without authorization;
(e) Immediately notify the Company of any suspected breach or unauthorized access.

3. INTELLECTUAL PROPERTY
Any inventions, designs, works, or improvements created by the Employee during the course of employment using Company resources or Confidential Information shall be the exclusive property of the Company.

4. NON-SOLICITATION
For a period of {{non_solicit_period}} following termination, the Employee shall not solicit Company clients, customers, or employees.

5. TERM
This Agreement shall remain in effect during the Employee's engagement with the Company and for {{survival_period}} thereafter.

6. RETURN OF MATERIALS
Upon termination of employment, the Employee shall immediately return all documents, files, equipment, and materials containing Confidential Information.

7. REMEDIES
The Employee acknowledges that breach of this Agreement may cause irreparable harm. The Company shall be entitled to injunctive relief and recovery of damages.

8. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.`,
    templateVars: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'employee_name', label: 'Employee / Contractor Name', type: 'text', required: true },
      { name: 'employee_role', label: 'Role / Position', type: 'text', required: true },
      { name: 'non_solicit_period', label: 'Non-Solicitation Period (e.g., 12 months)', type: 'text', required: true },
      { name: 'survival_period', label: 'Post-Employment Confidentiality Period', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
    ],
    isDefault: false, version: 1, status: 'active',
    createdAt: daysFromNow(-55), updatedAt: daysFromNow(-55),
  },

  // 3. Investor / Fundraising NDA
  {
    id: 'template-investor',
    ownerId: 'mock-user-001',
    name: 'Investor / Fundraising NDA',
    description: 'For sharing financials, cap tables, and business plans with potential investors or VCs.',
    category: 'investment',
    content: `INVESTOR NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{company_name}} ("Company") and {{investor_name}} ("Potential Investor").

RECITALS
The Company intends to share certain confidential business, financial, and strategic information with the Potential Investor for the sole purpose of evaluating a potential investment in the Company ("Purpose").

1. CONFIDENTIAL INFORMATION
"Confidential Information" includes, but is not limited to: financial statements, projections, cap tables, business plans, pitch decks, customer metrics, revenue data, intellectual property, product roadmaps, market analysis, and any information marked as confidential or that a reasonable person would consider confidential.

2. OBLIGATIONS
The Potential Investor agrees to:
(a) Use Confidential Information solely for the Purpose;
(b) Not disclose it to any third party except to advisors, partners, or associates who are bound by similar obligations;
(c) Not use it for competitive purposes or to make trades based on material non-public information;
(d) Not contact the Company's customers, suppliers, or employees without prior written consent.

3. EXCLUSIONS
Standard exclusions apply for publicly available information, prior knowledge, independent development, and lawful third-party sources.

4. SECURITIES LAW COMPLIANCE
The Potential Investor acknowledges that Confidential Information may constitute material non-public information under securities laws and agrees to comply with all applicable insider trading regulations.

5. NO OBLIGATION TO PROCEED
Nothing in this Agreement obligates either party to proceed with any investment, transaction, or business relationship.

6. TERM
This Agreement shall remain in effect for {{term_duration}}. Confidentiality obligations shall survive for {{survival_period}} after expiration or termination.

7. RETURN OF INFORMATION
Upon request or upon deciding not to pursue the investment, the Potential Investor shall promptly return or destroy all Confidential Information.

8. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.`,
    templateVars: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'investor_name', label: 'Investor / VC Name', type: 'text', required: true },
      { name: 'term_duration', label: 'Agreement Duration (e.g., 2 years)', type: 'text', required: true },
      { name: 'survival_period', label: 'Survival Period (e.g., 5 years)', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
    ],
    isDefault: false, version: 1, status: 'active',
    createdAt: daysFromNow(-50), updatedAt: daysFromNow(-50),
  },

  // 4. Technology / Software Development NDA
  {
    id: 'template-technology',
    ownerId: 'mock-user-001',
    name: 'Technology & Software NDA',
    description: 'For software projects, API integrations, SaaS partnerships, and tech collaborations.',
    category: 'technology',
    content: `TECHNOLOGY NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{party_a}} ("Disclosing Party") and {{party_b}} ("Receiving Party").

RECITALS
The Parties wish to explore a technology collaboration, software integration, or development partnership ("Purpose") and may exchange proprietary technical information.

1. CONFIDENTIAL INFORMATION
"Confidential Information" includes, without limitation: source code, object code, APIs, algorithms, software architecture, database schemas, system designs, technical specifications, security protocols, encryption keys, user data structures, cloud infrastructure details, deployment configurations, and performance benchmarks.

2. SPECIAL PROTECTIONS FOR TECHNICAL DATA
The Receiving Party shall:
(a) Store all digital Confidential Information in encrypted form;
(b) Not reverse-engineer, decompile, or disassemble any software or technical materials;
(c) Not integrate Confidential Information into its own products without written consent;
(d) Maintain access logs for all systems containing Confidential Information;
(e) Implement industry-standard security measures (e.g., SOC 2, ISO 27001 controls).

3. INTELLECTUAL PROPERTY
(a) All pre-existing IP remains with its original owner;
(b) Any jointly developed IP during the Purpose shall be subject to a separate agreement;
(c) Neither Party acquires any license or rights to the other's IP by virtue of this Agreement.

4. DATA PROTECTION
The Parties shall comply with applicable data protection regulations (GDPR, CCPA, etc.) when handling any personal data included in Confidential Information.

5. SECURITY INCIDENT NOTIFICATION
Each Party shall notify the other within {{breach_notification_hours}} hours of discovering any security breach affecting Confidential Information.

6. TERM
This Agreement shall remain in effect for {{term_duration}}. Technical confidentiality obligations survive for {{survival_period}}.

7. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the Parties have executed this Agreement.`,
    templateVars: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'party_a', label: 'Disclosing Party', type: 'text', required: true },
      { name: 'party_b', label: 'Receiving Party', type: 'text', required: true },
      { name: 'breach_notification_hours', label: 'Breach Notification Window (hours)', type: 'text', required: true },
      { name: 'term_duration', label: 'Agreement Duration', type: 'text', required: true },
      { name: 'survival_period', label: 'Survival Period', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
    ],
    isDefault: false, version: 1, status: 'active',
    createdAt: daysFromNow(-45), updatedAt: daysFromNow(-45),
  },

  // 5. M&A / Due Diligence NDA
  {
    id: 'template-mergers',
    ownerId: 'mock-user-001',
    name: 'M&A / Due Diligence NDA',
    description: 'For mergers, acquisitions, and due diligence processes requiring strict confidentiality.',
    category: 'mergers',
    content: `MERGERS & ACQUISITIONS NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{target_company}} ("Target") and {{acquiring_company}} ("Acquirer").

RECITALS
The Target is willing to share certain confidential information with the Acquirer for the sole purpose of evaluating a potential acquisition, merger, or strategic transaction ("Transaction").

1. CONFIDENTIAL INFORMATION
"Confidential Information" includes all information relating to the Target's business, operations, and affairs, including but not limited to: financial statements, tax records, customer contracts, employee details, intellectual property, litigation matters, regulatory filings, real estate holdings, insurance policies, material contracts, and any data room materials.

2. STANDSTILL PROVISION
For a period of {{standstill_period}} from the date of this Agreement, the Acquirer agrees not to:
(a) Acquire or seek to acquire any securities of the Target without consent;
(b) Solicit proxies or participate in any group seeking to control the Target;
(c) Make any public announcement regarding the Transaction without prior written consent.

3. NON-SOLICITATION OF EMPLOYEES
The Acquirer shall not, for {{employee_non_solicit_period}} following termination or completion of discussions, directly or indirectly solicit or hire any employee of the Target whom the Acquirer became aware of through the due diligence process.

4. USE AND DISCLOSURE
The Acquirer shall:
(a) Use Confidential Information solely for evaluating the Transaction;
(b) Limit disclosure to its directors, officers, and professional advisors who need to know;
(c) Ensure all recipients are bound by confidentiality obligations no less restrictive than this Agreement.

5. EXCLUSIVITY (OPTIONAL)
During the period of {{exclusivity_period}}, the Target agrees not to solicit, entertain, or negotiate with other potential acquirers.

6. NO OBLIGATION
Nothing herein obligates either Party to consummate any Transaction.

7. TERM
This Agreement remains in effect for {{term_duration}}.

8. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by the laws of {{jurisdiction}}. Any disputes shall be resolved through binding arbitration.

IN WITNESS WHEREOF, the Parties have executed this Agreement.`,
    templateVars: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'target_company', label: 'Target Company', type: 'text', required: true },
      { name: 'acquiring_company', label: 'Acquiring / Evaluating Party', type: 'text', required: true },
      { name: 'standstill_period', label: 'Standstill Period (e.g., 12 months)', type: 'text', required: true },
      { name: 'employee_non_solicit_period', label: 'Employee Non-Solicitation Period', type: 'text', required: true },
      { name: 'exclusivity_period', label: 'Exclusivity Period (if applicable)', type: 'text', required: false },
      { name: 'term_duration', label: 'Agreement Duration', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
    ],
    isDefault: false, version: 1, status: 'active',
    createdAt: daysFromNow(-40), updatedAt: daysFromNow(-40),
  },

  // 6. Vendor / Third-Party Service Provider NDA
  {
    id: 'template-vendor',
    ownerId: 'mock-user-001',
    name: 'Vendor / Service Provider NDA',
    description: 'For engaging third-party vendors, consultants, freelancers, and service providers.',
    category: 'vendor',
    content: `VENDOR NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

{{client_company}} ("Client") and {{vendor_name}} ("Vendor").

RECITALS
The Client engages the Vendor to provide {{service_description}} ("Services"). In performing the Services, the Vendor may receive access to confidential and proprietary information of the Client.

1. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by the Client, including: business processes, client lists, pricing models, internal communications, system access credentials, personal data of the Client's customers or employees, and any materials provided for the purpose of performing the Services.

2. VENDOR OBLIGATIONS
The Vendor agrees to:
(a) Use Confidential Information exclusively for performing the Services;
(b) Not disclose it to any third party, subcontractor, or affiliate without prior written consent;
(c) Ensure all personnel with access sign binding confidentiality agreements;
(d) Implement appropriate technical and organizational security measures;
(e) Not retain copies of Confidential Information beyond the term of engagement.

3. SUBCONTRACTORS
The Vendor shall not engage subcontractors who will have access to Confidential Information without the Client's prior written approval. Any approved subcontractor must be bound by obligations at least as restrictive as this Agreement.

4. DATA HANDLING AND COMPLIANCE
The Vendor shall:
(a) Process personal data only as instructed by the Client;
(b) Comply with all applicable data protection laws (GDPR, CCPA, etc.);
(c) Maintain a record of processing activities;
(d) Assist the Client in responding to data subject requests.

5. AUDIT RIGHTS
The Client reserves the right to audit the Vendor's compliance with this Agreement upon {{audit_notice_period}} written notice.

6. INDEMNIFICATION
The Vendor shall indemnify and hold harmless the Client from any losses arising from the Vendor's breach of this Agreement.

7. TERM
This Agreement shall be effective during the term of the Services engagement and for {{survival_period}} thereafter.

8. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.`,
    templateVars: [
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'client_company', label: 'Client Company', type: 'text', required: true },
      { name: 'vendor_name', label: 'Vendor / Service Provider Name', type: 'text', required: true },
      { name: 'service_description', label: 'Description of Services', type: 'text', required: true },
      { name: 'audit_notice_period', label: 'Audit Notice Period (e.g., 10 business days)', type: 'text', required: true },
      { name: 'survival_period', label: 'Post-Engagement Confidentiality Period', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', required: true },
    ],
    isDefault: false, version: 1, status: 'active',
    createdAt: daysFromNow(-35), updatedAt: daysFromNow(-35),
  },
];

// ── Meeting Summaries (Feature 1) ──
const _seedSummaries: any[] = [
  {
    id: 'summary-001', meetingId: 'meet-001',
    summary: 'The partnership kickoff meeting covered key terms, deliverables, and timelines for the Acme Corp collaboration. Both parties expressed strong alignment on objectives. Payment terms and IP ownership were discussed with minor adjustments needed.',
    keyDecisions: [
      'Proceed with proposed partnership framework',
      'Legal team to finalize NDA amendments by end of week',
      'Quarterly review cadence agreed upon',
    ],
    actionItems: [
      { id: 'ai-001', description: 'Draft revised partnership agreement with updated payment terms', assignee: 'Demo User', dueDate: daysFromNow(7).split('T')[0], completed: false },
      { id: 'ai-002', description: 'Schedule follow-up call to review final contract', assignee: 'John Smith', dueDate: daysFromNow(14).split('T')[0], completed: false },
      { id: 'ai-003', description: 'Share compliance documentation with Acme legal team', assignee: 'Demo User', dueDate: daysFromNow(5).split('T')[0], completed: true },
    ],
    keyTopics: ['Partnership Terms', 'Payment Schedule', 'Confidentiality', 'Quarterly Reviews'],
    sentiment: 'positive',
    generatedBy: 'claude', model: 'claude-sonnet-4-6',
    status: 'completed',
    createdAt: daysFromNow(-19), updatedAt: daysFromNow(-19),
  },
];

// ── Audit Logs (Feature 4) ──
const _seedAuditLogs: any[] = [
  { id: 'audit-001', userId: 'mock-user-001', action: 'nda_signed', resourceType: 'meeting', resourceId: 'meet-001', details: { participantId: 'part-001', signerEmail: 'demo@legalmeet.com' }, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-21) },
  { id: 'audit-002', userId: null, action: 'nda_signed', resourceType: 'meeting', resourceId: 'meet-001', details: { participantId: 'part-002', signerEmail: 'john@acme.com' }, ipAddress: '192.168.1.50', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-20) },
  { id: 'audit-003', userId: 'mock-user-001', action: 'meeting_started', resourceType: 'meeting', resourceId: 'meet-001', details: {}, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-20) },
  { id: 'audit-004', userId: 'mock-user-001', action: 'meeting_ended', resourceType: 'meeting', resourceId: 'meet-001', details: { durationSeconds: 3600 }, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-20) },
  { id: 'audit-005', userId: 'mock-user-001', action: 'summary_generated', resourceType: 'meeting', resourceId: 'meet-001', details: { model: 'claude-sonnet-4-6' }, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-19) },
  { id: 'audit-006', userId: 'mock-user-001', action: 'nda_signed', resourceType: 'meeting', resourceId: 'meet-002', details: { participantId: 'part-003', signerEmail: 'demo@legalmeet.com' }, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-1) },
  { id: 'audit-007', userId: 'mock-user-001', action: 'nda_viewed', resourceType: 'meeting', resourceId: 'meet-002', details: { viewerEmail: 'sarah@acme.com' }, ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0', createdAt: daysFromNow(-1) },
];

// ── Guest Tokens (Feature 5) ──
const _seedGuestTokens: any[] = [
  { id: 'gt-001', meetingId: 'meet-002', participantId: 'part-004', token: 'guest-token-sarah-001', email: 'sarah@acme.com', expiresAt: daysFromNow(3), usedAt: null, createdAt: daysFromNow(-1) },
  { id: 'gt-002', meetingId: 'meet-004', participantId: 'part-008', token: 'guest-token-tanaka-001', email: 'tanaka@sakura.co.jp', expiresAt: daysFromNow(8), usedAt: null, createdAt: daysFromNow(-3) },
  { id: 'gt-003', meetingId: 'meet-004', participantId: 'part-009', token: 'guest-token-sato-001', email: 'sato@sakura.co.jp', expiresAt: daysFromNow(8), usedAt: null, createdAt: daysFromNow(-3) },
  { id: 'gt-004', meetingId: 'meet-005', participantId: 'part-011', token: 'guest-token-liwei-001', email: 'li.wei@chenlaw.sg', expiresAt: daysFromNow(11), usedAt: null, createdAt: daysFromNow(-2) },
];

// ── Calendar Events (Feature 6) ──
const _seedCalendarEvents: any[] = [
  { id: 'cal-001', meetingId: 'meet-001', provider: 'google', providerEventId: 'gcal-evt-001', calendarId: 'primary', syncStatus: 'synced', lastSyncedAt: daysFromNow(-20), createdAt: daysFromNow(-22), updatedAt: daysFromNow(-20) },
];

// ── Document Versions (Feature 7) ──
const _seedDocumentVersions: any[] = [
  { id: 'dv-001', documentType: 'nda_template', documentId: 'template-generic', versionNumber: 1, content: 'Original template content...', changeSummary: 'Initial version', createdBy: 'mock-user-001', createdAt: daysFromNow(-60) },
];

// ── Notifications (Feature 8) ──
const _seedNotifications: any[] = [
  { id: 'notif-001', userId: 'mock-user-001', type: 'nda_signed', title: 'NDA Signed', body: 'John Smith signed the NDA for "Acme Partnership Kickoff"', resourceType: 'meeting', resourceId: 'meet-001', read: true, emailSent: true, createdAt: daysFromNow(-20) },
  { id: 'notif-002', userId: 'mock-user-001', type: 'all_signed', title: 'All NDAs Signed', body: 'All participants have signed the NDA for "Acme Partnership Kickoff"', resourceType: 'meeting', resourceId: 'meet-001', read: true, emailSent: true, createdAt: daysFromNow(-20) },
  { id: 'notif-003', userId: 'mock-user-001', type: 'summary_ready', title: 'Meeting Summary Ready', body: 'AI summary generated for "Acme Partnership Kickoff"', resourceType: 'meeting', resourceId: 'meet-001', read: false, emailSent: true, createdAt: daysFromNow(-19) },
  { id: 'notif-004', userId: 'mock-user-001', type: 'nda_signed', title: 'NDA Signed', body: 'You signed the NDA for "Contract Review Session"', resourceType: 'meeting', resourceId: 'meet-002', read: false, emailSent: true, createdAt: daysFromNow(-1) },
  { id: 'notif-005', userId: 'mock-user-001', type: 'meeting_reminder', title: 'Meeting Tomorrow', body: '"Contract Review Session" is scheduled for tomorrow', resourceType: 'meeting', resourceId: 'meet-002', read: false, emailSent: false, createdAt: daysFromNow(0) },
];

// ── NDA Analyses (Feature 10) ──
const _seedNDAAnalyses: any[] = [
  {
    id: 'analysis-001', meetingId: 'meet-002', templateId: 'template-mergers',
    ndaContent: 'Custom M&A NDA content...',
    overallRisk: 'medium',
    risks: [
      { id: 'risk-001', clauseText: 'Non-solicitation of employees clause', riskLevel: 'medium', category: 'Restrictive Covenant', explanation: 'The non-solicitation period may be difficult to enforce in certain states.', suggestion: 'Consider limiting to 12 months.' },
      { id: 'risk-002', clauseText: 'Broad definition of Confidential Information', riskLevel: 'low', category: 'Scope', explanation: 'Standard but broadly inclusive definition.', suggestion: null },
    ],
    missingClauses: ['Force majeure clause', 'Data protection compliance clause'],
    summary: 'M&A NDA analysis: 2 risks identified, 2 potentially missing clauses. Overall risk: medium.',
    generatedBy: 'claude', model: 'claude-sonnet-4-6', status: 'completed',
    createdAt: daysFromNow(-1),
  },
];

// ── Tags (Feature 11) ──
const _seedTags: any[] = [
  { id: 'tag-001', name: 'Urgent', color: '#ef4444', ownerId: 'mock-user-001', createdAt: daysFromNow(-30) },
  { id: 'tag-002', name: 'APAC', color: '#3b82f6', ownerId: 'mock-user-001', createdAt: daysFromNow(-30) },
  { id: 'tag-003', name: 'M&A', color: '#8b5cf6', ownerId: 'mock-user-001', createdAt: daysFromNow(-30) },
  { id: 'tag-004', name: 'Partnership', color: '#10b981', ownerId: 'mock-user-001', createdAt: daysFromNow(-30) },
  { id: 'tag-005', name: 'Compliance', color: '#f59e0b', ownerId: 'mock-user-001', createdAt: daysFromNow(-30) },
];

const _seedResourceTags: any[] = [
  { id: 'rt-001', tagId: 'tag-004', resourceType: 'project', resourceId: 'proj-001', createdAt: daysFromNow(-30) },
  { id: 'rt-002', tagId: 'tag-003', resourceType: 'project', resourceId: 'proj-002', createdAt: daysFromNow(-14) },
  { id: 'rt-003', tagId: 'tag-002', resourceType: 'project', resourceId: 'proj-003', createdAt: daysFromNow(-5) },
  { id: 'rt-004', tagId: 'tag-005', resourceType: 'project', resourceId: 'proj-003', createdAt: daysFromNow(-5) },
  { id: 'rt-005', tagId: 'tag-001', resourceType: 'meeting', resourceId: 'meet-002', createdAt: daysFromNow(-3) },
];

// ── Subscription (Feature 14) ──
const _seedSubscriptions: any[] = [
  {
    id: 'sub-001', userId: 'mock-user-001',
    stripeCustomerId: 'cus_mock_001', stripeSubscriptionId: 'sub_mock_001',
    plan: 'team', status: 'active',
    currentPeriodStart: daysFromNow(-15), currentPeriodEnd: daysFromNow(15),
    meetingsUsed: 3, meetingsLimit: null,
    createdAt: daysFromNow(-30), updatedAt: daysFromNow(-15),
  },
];

// ── Analytics (Feature 13) ──
const _seedAnalytics: any[] = [
  {
    id: 'analytics-001', userId: 'mock-user-001', period: '2026-03',
    meetingsTotal: 5, meetingsCompleted: 1, ndasGenerated: 4, ndasSigned: 3,
    avgNdaTurnaroundMinutes: 45, avgMeetingDurationMinutes: 60,
    recordingsCount: 1, transcriptsCount: 1,
    topTemplates: [
      { templateId: 'template-generic', name: 'Standard Mutual NDA', count: 3 },
      { templateId: 'template-mergers', name: 'M&A / Due Diligence NDA', count: 1 },
    ],
    createdAt: daysFromNow(0),
  },
];

// Export globalThis-backed arrays that survive HMR
function getOrInit<T>(key: string, seed: T[]): T[] {
  if (!g[key]) g[key] = [...seed];
  return g[key];
}

export const mockProjects = getOrInit('__mockProjects', _seedProjects);
export const mockSubProjects = getOrInit('__mockSubProjects', _seedSubProjects);
export const mockMeetings = getOrInit('__mockMeetings', _seedMeetings);
export const mockParticipants = getOrInit('__mockParticipants', _seedParticipants);
export const mockSignatures = getOrInit('__mockSignatures', _seedSignatures);
export const mockRecordings = getOrInit('__mockRecordings', _seedRecordings);
export const mockTranscripts = getOrInit('__mockTranscripts', _seedTranscripts);
export const mockBundles = getOrInit('__mockBundles', _seedBundles);
export const mockTemplates = getOrInit('__mockTemplates', _seedTemplates);
export const mockSummaries = getOrInit('__mockSummaries', _seedSummaries);
export const mockAuditLogs = getOrInit('__mockAuditLogs', _seedAuditLogs);
export const mockGuestTokens = getOrInit('__mockGuestTokens', _seedGuestTokens);
export const mockCalendarEvents = getOrInit('__mockCalendarEvents', _seedCalendarEvents);
export const mockDocumentVersions = getOrInit('__mockDocumentVersions', _seedDocumentVersions);
export const mockNotifications = getOrInit('__mockNotifications', _seedNotifications);
export const mockNDAAnalyses = getOrInit('__mockNDAAnalyses', _seedNDAAnalyses);
export const mockTags = getOrInit('__mockTags', _seedTags);
export const mockResourceTags = getOrInit('__mockResourceTags', _seedResourceTags);
export const mockSubscriptions = getOrInit('__mockSubscriptions', _seedSubscriptions);
export const mockAnalytics = getOrInit('__mockAnalytics', _seedAnalytics);
