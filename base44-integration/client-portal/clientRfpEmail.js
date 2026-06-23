import { base44 } from '@/api/base44Client';

export function generateRfpRef() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NSC-RFP-${year}-${rand}`;
}

function formatSubmissionDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function buildRfpConfirmationEmailHtml({
  recipientName,
  clientName,
  rfpTitle,
  refNumber,
  submissionDate,
  fileName,
  priority,
}) {
  const safeName = recipientName || clientName || 'Valued Client';
  const safeClient = clientName || 'N/A';
  const safeTitle = rfpTitle || 'Request for Proposal';
  const safeRef = refNumber || 'N/A';
  const safeDate = submissionDate || formatSubmissionDate();
  const safeFile = fileName || 'Attached';
  const safePriority = priority ? String(priority).charAt(0).toUpperCase() + String(priority).slice(1) : 'Medium';

  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="color: #ffffff; margin: 0;">NOSSCO Operational Core</h2>
    <p style="color: #aaaaaa; margin: 5px 0 0;">Client Services Portal</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
    <p>Dear <strong>${safeName}</strong>,</p>
    <p>Assalamu Alaikum,</p>
    <p>We are pleased to confirm that <strong>NOSSCO Operational Core</strong> has successfully received your Request for Proposal (RFP).</p>
    <div style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 8px;">📄 RFP Submission Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; color: #666; width: 40%;"><strong>RFP Title</strong></td>
          <td style="padding: 8px;">${safeTitle}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Reference Number</strong></td>
          <td style="padding: 8px; font-family: monospace;">${safeRef}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;"><strong>Status</strong></td>
          <td style="padding: 8px;"><span style="background-color: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 12px;">Pending Review</span></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Submission Date</strong></td>
          <td style="padding: 8px;">${safeDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;"><strong>Client Name</strong></td>
          <td style="padding: 8px;">${safeClient}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Priority</strong></td>
          <td style="padding: 8px;">${safePriority}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;"><strong>Document</strong></td>
          <td style="padding: 8px;">${safeFile}</td>
        </tr>
      </table>
    </div>
    <p>Our Client Success Team will review your RFP within <strong>1–3 business days</strong> and notify you of the outcome.</p>
    <p>If you have any questions, please do not hesitate to contact us. Please quote reference <strong>${safeRef}</strong> in all correspondence.</p>
    <p>Thank you for choosing NOSSCO as your operational partner.</p>
    <p>Warm regards,<br><strong>NOSSCO Client Success Team</strong><br>NOSSCO Operational Core<br>Kingdom of Saudi Arabia</p>
  </div>
  <div style="background-color: #eeeeee; padding: 12px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
    This is an automated message. Please do not reply to this email.
  </div>
</body>
</html>`;
}

/**
 * Send RFP submission confirmation to the client (and optional admin alert).
 */
export async function sendRfpConfirmationEmail({
  toEmail,
  toName,
  clientName,
  rfpTitle,
  refNumber,
  fileName,
  priority,
}) {
  if (!toEmail) return { clientSent: false, adminSent: false };

  const submissionDate = formatSubmissionDate();
  const htmlBody = buildRfpConfirmationEmailHtml({
    recipientName: toName,
    clientName,
    rfpTitle,
    refNumber,
    submissionDate,
    fileName,
    priority,
  });

  let clientSent = false;
  let adminSent = false;

  try {
    await base44.integrations.Core.SendEmail({
      to: toEmail,
      from_name: 'NOSSCO Client Services',
      subject: `RFP Received: ${rfpTitle || 'Request for Proposal'} – Pending Review | Ref: ${refNumber}`,
      body: htmlBody,
    });
    clientSent = true;
  } catch (err) {
    console.error('RFP client confirmation email failed:', err);
  }

  try {
    await base44.integrations.Core.SendEmail({
      to: 'admin@nossco.com',
      from_name: 'NOSSCO System',
      subject: `New Client RFP Submission | ${clientName || 'Client'} | Ref: ${refNumber}`,
      body: `A client has submitted an RFP via the Client Portal.\n\nClient: ${clientName || 'N/A'}\nContact: ${toName || 'N/A'} <${toEmail}>\nRFP Title: ${rfpTitle || 'N/A'}\nReference: ${refNumber}\nDate: ${submissionDate}\nPriority: ${priority || 'medium'}\n\nPlease log in to NOSSCO to review the submission.`,
    });
    adminSent = true;
  } catch (err) {
    console.error('RFP admin notification email failed:', err);
  }

  return { clientSent, adminSent };
}
