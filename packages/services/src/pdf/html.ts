import type { IPDFService, NDAPdfData, TranscriptPdfData, BundlePdfData } from './interface';

/**
 * HTML-to-PDF service using the built-in fetch + a headless rendering approach.
 * For production, swap to @pdfme/generator or Puppeteer.
 * This is a placeholder that generates the HTML structure - actual PDF generation
 * requires a runtime like Puppeteer or a cloud PDF API.
 */
export class HTMLPDFService implements IPDFService {
  async generateNDAPdf(data: NDAPdfData): Promise<Buffer> {
    const html = `
      <html><body>
        <h1>Non-Disclosure Agreement</h1>
        <h2>${data.meetingTitle}</h2>
        <div>${data.templateContent}</div>
        <h3>Signatures</h3>
        ${data.signatures.map(s => `
          <div>
            <p><strong>${s.name}</strong> (${s.email})</p>
            <p>Signed: ${s.signedAt}</p>
            <img src="${s.signatureImage}" width="200" />
          </div>
        `).join('')}
      </body></html>
    `;
    return Buffer.from(html, 'utf-8');
  }

  async generateTranscriptPdf(data: TranscriptPdfData): Promise<Buffer> {
    const html = `
      <html><body>
        <h1>Meeting Transcript</h1>
        <h2>${data.meetingTitle} - ${data.meetingDate}</h2>
        ${data.segments.map(s => `
          <p><strong>[${s.timestamp}] ${s.speaker}:</strong> ${s.text}</p>
        `).join('')}
      </body></html>
    `;
    return Buffer.from(html, 'utf-8');
  }

  async generateBundlePdf(data: BundlePdfData): Promise<Buffer> {
    const ndaPdf = await this.generateNDAPdf(data.nda);
    const transcriptPdf = await this.generateTranscriptPdf(data.transcript);
    // In production, merge PDFs. For now, concatenate HTML.
    return Buffer.concat([ndaPdf, transcriptPdf]);
  }
}
