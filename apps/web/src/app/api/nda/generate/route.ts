import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/nda/generate
 * Takes a free-text description and generates a structured NDA document.
 * In mock mode, this uses pattern matching + template assembly.
 * In production, this would call an LLM API.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a description of at least 10 characters.' },
        { status: 400 }
      );
    }

    const text = description.toLowerCase();

    // Detect key elements from the free text
    const parties = extractParties(description);
    const duration = extractDuration(text);
    const jurisdiction = extractJurisdiction(text);
    const purpose = extractPurpose(text);
    const category = detectCategory(text);
    const specialClauses = extractSpecialClauses(text);

    // Build the NDA
    const nda = generateNDA({
      description: description.trim(),
      parties,
      duration,
      jurisdiction,
      purpose,
      category,
      specialClauses,
    });

    return NextResponse.json({
      name: nda.name,
      content: nda.content,
      templateVars: nda.templateVars,
      detectedCategory: category,
      detectedElements: {
        parties,
        duration,
        jurisdiction,
        purpose,
        specialClauses,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

function extractParties(text: string): { partyA: string; partyB: string } {
  // Try patterns like "between X and Y", "X with Y"
  const betweenMatch = text.match(/between\s+([A-Z][\w\s.&,']+?)\s+and\s+([A-Z][\w\s.&,']+?)[\s.,]/i);
  if (betweenMatch) return { partyA: betweenMatch[1].trim(), partyB: betweenMatch[2].trim() };

  const withMatch = text.match(/(?:for|with)\s+([A-Z][\w\s.&,']+?)(?:\s+(?:to|for|regarding|about))/i);
  if (withMatch) return { partyA: '{{party_a}}', partyB: withMatch[1].trim() };

  return { partyA: '{{party_a}}', partyB: '{{party_b}}' };
}

function extractDuration(text: string): string {
  const match = text.match(/(\d+)\s*(year|month|week)s?/i);
  if (match) return `${match[1]} ${match[2]}${parseInt(match[1]) > 1 ? 's' : ''}`;
  return '2 years';
}

function extractJurisdiction(text: string): string {
  const states = ['new york', 'california', 'delaware', 'texas', 'florida', 'illinois', 'massachusetts', 'washington'];
  const countries = ['united states', 'united kingdom', 'israel', 'germany', 'france', 'canada', 'australia'];
  for (const s of states) { if (text.includes(s)) return s.replace(/\b\w/g, c => c.toUpperCase()); }
  for (const c of countries) { if (text.includes(c)) return c.replace(/\b\w/g, c => c.toUpperCase()); }
  return '{{jurisdiction}}';
}

function extractPurpose(text: string): string {
  const purposeMatch = text.match(/(?:for|regarding|about|purpose of)\s+(.+?)(?:\.|,|$)/i);
  if (purposeMatch) return purposeMatch[1].trim();
  return 'exploring a potential business relationship';
}

function detectCategory(text: string): string {
  if (/employ|hire|contractor|freelanc|onboard|staff/i.test(text)) return 'employment';
  if (/invest|funding|fundrais|vc|venture|cap table|valuation/i.test(text)) return 'investment';
  if (/software|tech|api|code|saas|platform|develop|integrat/i.test(text)) return 'technology';
  if (/acqui|merger|m&a|due diligence|buyout|takeover/i.test(text)) return 'mergers';
  if (/vendor|supplier|service provider|consult|outsourc/i.test(text)) return 'vendor';
  return 'general';
}

function extractSpecialClauses(text: string): string[] {
  const clauses: string[] = [];
  if (/non.?compet/i.test(text)) clauses.push('non-compete');
  if (/non.?solicit/i.test(text)) clauses.push('non-solicitation');
  if (/ip|intellectual property|patent/i.test(text)) clauses.push('ip-assignment');
  if (/gdpr|data protect|privacy|ccpa/i.test(text)) clauses.push('data-protection');
  if (/exclusive|exclusivity/i.test(text)) clauses.push('exclusivity');
  if (/liquidated damages|penalt/i.test(text)) clauses.push('liquidated-damages');
  if (/arbitrat/i.test(text)) clauses.push('arbitration');
  if (/indemnif/i.test(text)) clauses.push('indemnification');
  return clauses;
}

interface NDAParams {
  description: string;
  parties: { partyA: string; partyB: string };
  duration: string;
  jurisdiction: string;
  purpose: string;
  category: string;
  specialClauses: string[];
}

function generateNDA(params: NDAParams) {
  const { parties, duration, jurisdiction, purpose, category, specialClauses } = params;
  const today = new Date().toISOString().split('T')[0];

  let title = 'NON-DISCLOSURE AGREEMENT';
  if (category === 'employment') title = 'EMPLOYEE NON-DISCLOSURE AGREEMENT';
  if (category === 'investment') title = 'INVESTOR NON-DISCLOSURE AGREEMENT';
  if (category === 'technology') title = 'TECHNOLOGY NON-DISCLOSURE AGREEMENT';
  if (category === 'mergers') title = 'M&A NON-DISCLOSURE AGREEMENT';
  if (category === 'vendor') title = 'VENDOR NON-DISCLOSURE AGREEMENT';

  const partyALabel = category === 'employment' ? 'Company' : category === 'vendor' ? 'Client' : 'First Party';
  const partyBLabel = category === 'employment' ? 'Employee' : category === 'vendor' ? 'Vendor' : category === 'investment' ? 'Investor' : 'Second Party';

  let sectionNum = 0;
  const sections: string[] = [];

  // HEADER
  sections.push(`${title}\n`);
  sections.push(`This Non-Disclosure Agreement ("Agreement") is entered into as of ${today} by and between:\n`);
  sections.push(`${parties.partyA} ("${partyALabel}") and ${parties.partyB} ("${partyBLabel}"), collectively referred to as the "Parties."\n`);
  sections.push(`RECITALS\nThe Parties wish to engage in discussions regarding ${purpose} ("Purpose") and, in connection therewith, may disclose confidential and proprietary information.\n`);

  // 1. CONFIDENTIAL INFORMATION
  sectionNum++;
  let confInfo = `${sectionNum}. DEFINITION OF CONFIDENTIAL INFORMATION\n"Confidential Information" means any and all non-public information disclosed by either Party, whether orally, in writing, electronically, or by inspection, including but not limited to: `;
  if (category === 'technology') {
    confInfo += 'source code, APIs, algorithms, software architecture, database schemas, system designs, technical specifications, security protocols, deployment configurations, and performance benchmarks.';
  } else if (category === 'investment') {
    confInfo += 'financial statements, projections, cap tables, business plans, pitch decks, customer metrics, revenue data, intellectual property, and market analysis.';
  } else if (category === 'employment') {
    confInfo += 'trade secrets, inventions, product roadmaps, source code, customer data, financial records, marketing strategies, employee information, and vendor contracts.';
  } else if (category === 'mergers') {
    confInfo += 'financial statements, tax records, customer contracts, employee details, intellectual property, litigation matters, regulatory filings, material contracts, and data room materials.';
  } else {
    confInfo += 'business plans, financial data, customer lists, trade secrets, technical data, product designs, strategies, and any other proprietary information.';
  }
  sections.push(confInfo);

  // 2. OBLIGATIONS
  sectionNum++;
  sections.push(`\n${sectionNum}. OBLIGATIONS OF THE RECEIVING PARTY\nEach Party, as Receiving Party, agrees to:\n(a) Hold Confidential Information in strict confidence;\n(b) Not disclose it to any third party without prior written consent;\n(c) Use it solely for the Purpose;\n(d) Limit internal access to those who need to know;\n(e) Protect it with at least the same degree of care used for its own confidential information.`);

  // 3. EXCLUSIONS
  sectionNum++;
  sections.push(`\n${sectionNum}. EXCLUSIONS\nConfidential Information does not include information that:\n(a) Is or becomes publicly available through no fault of the Receiving Party;\n(b) Was known to the Receiving Party prior to disclosure;\n(c) Is independently developed without use of Confidential Information;\n(d) Is lawfully obtained from a third party without restriction.`);

  // SPECIAL CLAUSES
  if (specialClauses.includes('non-compete')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. NON-COMPETITION\nDuring the term of this Agreement and for a period of 12 months following its termination, the Receiving Party shall not engage in any business that directly competes with the Disclosing Party in the same market or territory.`);
  }

  if (specialClauses.includes('non-solicitation')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. NON-SOLICITATION\nFor a period of 12 months following termination of this Agreement, neither Party shall directly or indirectly solicit, recruit, or hire any employee, contractor, or consultant of the other Party.`);
  }

  if (specialClauses.includes('ip-assignment')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. INTELLECTUAL PROPERTY\n(a) All pre-existing IP remains with its original owner;\n(b) Any IP jointly developed during the Purpose shall be subject to a separate written agreement;\n(c) Neither Party acquires any license or rights to the other's IP by virtue of this Agreement.`);
  }

  if (specialClauses.includes('data-protection')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. DATA PROTECTION\nThe Parties shall comply with all applicable data protection regulations including GDPR and CCPA when handling any personal data included in Confidential Information. Each Party shall implement appropriate technical and organizational measures to protect personal data.`);
  }

  if (specialClauses.includes('exclusivity')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. EXCLUSIVITY\nDuring the term of this Agreement, neither Party shall enter into discussions or negotiations with third parties regarding the same subject matter without prior written consent.`);
  }

  if (specialClauses.includes('indemnification')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. INDEMNIFICATION\nEach Party shall indemnify, defend, and hold harmless the other Party from and against any and all losses, damages, liabilities, and expenses arising out of any breach of this Agreement.`);
  }

  if (specialClauses.includes('arbitration')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. DISPUTE RESOLUTION\nAny dispute arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the International Chamber of Commerce (ICC), with the arbitration taking place in ${jurisdiction !== '{{jurisdiction}}' ? jurisdiction : 'the agreed-upon jurisdiction'}.`);
  }

  if (specialClauses.includes('liquidated-damages')) {
    sectionNum++;
    sections.push(`\n${sectionNum}. LIQUIDATED DAMAGES\nIn the event of a breach, the breaching Party shall pay liquidated damages in the amount of $` + '{{liquidated_damages_amount}}' + ` per incident, in addition to any other remedies available at law or in equity.`);
  }

  // TERM
  sectionNum++;
  sections.push(`\n${sectionNum}. TERM AND TERMINATION\nThis Agreement shall remain in effect for ${duration} from the Effective Date. Either Party may terminate this Agreement with 30 days' written notice. Obligations of confidentiality shall survive termination for a period of ${duration === '2 years' ? '3 years' : duration}.`);

  // RETURN OF MATERIALS
  sectionNum++;
  sections.push(`\n${sectionNum}. RETURN OF MATERIALS\nUpon termination or request, each Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.`);

  // REMEDIES
  sectionNum++;
  sections.push(`\n${sectionNum}. REMEDIES\nEach Party acknowledges that a breach may cause irreparable harm, and the non-breaching Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.`);

  // GOVERNING LAW
  sectionNum++;
  const govLaw = jurisdiction !== '{{jurisdiction}}'
    ? `This Agreement shall be governed by and construed in accordance with the laws of ${jurisdiction}.`
    : 'This Agreement shall be governed by and construed in accordance with the laws of {{jurisdiction}}.';
  sections.push(`\n${sectionNum}. GOVERNING LAW\n${govLaw}`);

  // ENTIRE AGREEMENT
  sectionNum++;
  sections.push(`\n${sectionNum}. ENTIRE AGREEMENT\nThis Agreement constitutes the entire agreement between the Parties regarding the subject matter hereof and supersedes all prior negotiations and agreements.`);

  // SIGNATURE
  sections.push(`\nIN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.`);

  const content = sections.join('\n');

  // Build template vars for any remaining placeholders
  const varMatches = content.match(/\{\{(\w+)\}\}/g) || [];
  const uniqueVars = [...new Set(varMatches.map(v => v.replace(/\{\{|\}\}/g, '')))];
  const templateVars = uniqueVars.map(v => ({
    name: v,
    label: v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: v.includes('date') ? 'date' : 'text',
    required: true,
  }));

  const namePrefix = category.charAt(0).toUpperCase() + category.slice(1);
  const name = `${namePrefix} NDA — Generated`;

  return { name, content, templateVars };
}
