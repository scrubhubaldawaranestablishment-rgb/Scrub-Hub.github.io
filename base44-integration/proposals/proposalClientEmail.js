import { base44 } from '@/api/base44Client';

const SECTIONS = [
  { key: 'executive_summary', label: 'Executive Summary' },
  { key: 'scope_of_work', label: 'Scope of Work' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'cost_breakdown', label: 'Cost Breakdown' },
  { key: 'terms_and_conditions', label: 'Terms & Conditions' },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function formatSubmissionDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function buildProposalEmailHtml({
  recipientName,
  clientName,
  refCode,
  title,
  proposal,
  submissionDate,
}) {
  const safeName = recipientName || clientName || 'Valued Client';
  const safeClient = clientName || 'N/A';
  const safeRef = refCode || 'N/A';
  const safeTitle = title || 'Service Proposal';
  const safeDate = submissionDate || formatSubmissionDate();

  const sectionBlocks = SECTIONS.map(({ key, label }) => {
    const content = proposal?.[key];
    if (!content?.trim()) return '';
    return `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 10px; border-bottom: 2px solid #1a1a2e; padding-bottom: 6px;">${label}</h3>
        <div style="color: #333; font-size: 14px; line-height: 1.7;">${textToHtml(content)}</div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 640px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="color: #ffffff; margin: 0;">NOSSCO Operational Core</h2>
    <p style="color: #aaaaaa; margin: 5px 0 0;">Client Services</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
    <p>Dear <strong>${escapeHtml(safeName)}</strong>,</p>
    <p>Assalamu Alaikum,</p>
    <p>Thank you for your continued partnership with <strong>NOSSCO Operational Core</strong>. Please find below our formal service proposal prepared for your review.</p>
    <div style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 8px; margin-top: 0;">Proposal Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; color: #666; width: 38%;"><strong>Proposal Title</strong></td>
          <td style="padding: 8px;">${escapeHtml(safeTitle)}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Reference Number</strong></td>
          <td style="padding: 8px; font-family: monospace;">${escapeHtml(safeRef)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;"><strong>Client</strong></td>
          <td style="padding: 8px;">${escapeHtml(safeClient)}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Date</strong></td>
          <td style="padding: 8px;">${escapeHtml(safeDate)}</td>
        </tr>
      </table>
      ${sectionBlocks}
    </div>
    <p>Our team is available to discuss any aspect of this proposal. Please quote reference <strong>${escapeHtml(safeRef)}</strong> in all correspondence.</p>
    <p>We look forward to your feedback.</p>
    <p>Warm regards,<br><strong>NOSSCO Client Success Team</strong><br>NOSSCO Operational Core<br>Kingdom of Saudi Arabia</p>
  </div>
  <div style="background-color: #eeeeee; padding: 12px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
    This message was sent by NOSSCO Operational Core on behalf of your account manager.
  </div>
</body>
</html>`;
}

export async function resolveClientContact(request) {
  if (!request) return { email: null, name: null };

  if (request.client_id) {
    const rows = await base44.entities.Client.filter({ id: request.client_id });
    const client = rows?.[0];
    if (client?.contact_email) {
      return {
        email: client.contact_email,
        name: client.contact_name || request.client_name,
      };
    }
  }

  if (request.client_name) {
    const clients = await base44.entities.Client.list('-created_date', 200);
    const match = clients.find(
      (c) => c.company_name?.trim().toLowerCase() === request.client_name.trim().toLowerCase()
    );
    if (match?.contact_email) {
      return {
        email: match.contact_email,
        name: match.contact_name || request.client_name,
      };
    }
  }

  return { email: null, name: request.client_name || null };
}

export async function sendProposalToClientEmail({ request, proposal }) {
  const contact = await resolveClientContact(request);
  if (!contact.email) {
    return { sent: false, reason: 'no_client_email', email: null };
  }

  const submissionDate = formatSubmissionDate();
  const htmlBody = buildProposalEmailHtml({
    recipientName: contact.name,
    clientName: request.client_name,
    refCode: request.ref_code,
    title: request.title,
    proposal,
    submissionDate,
  });

  try {
    await base44.integrations.Core.SendEmail({
      to: contact.email,
      from_name: 'NOSSCO Client Services',
      subject: `Service Proposal: ${request.title || 'Your Request'} | Ref: ${request.ref_code || 'N/A'}`,
      body: htmlBody,
    });
    return { sent: true, email: contact.email, name: contact.name };
  } catch (err) {
    console.error('Proposal client email failed:', err);
    return { sent: false, reason: err.message || 'send_failed', email: contact.email };
  }
}
