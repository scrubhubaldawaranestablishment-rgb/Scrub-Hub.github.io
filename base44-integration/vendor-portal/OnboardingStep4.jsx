import { useState, useEffect } from 'react';
import { Upload, FileText, X, Check, ExternalLink, CheckCircle2, ClipboardList, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/lib/useTranslation';

const REQUIRED_DOCS = [
  { key: 'commercial_registration', labelKey: 'doc_commercial_registration', required: true },
  { key: 'vat_certificate', labelKey: 'doc_vat_certificate', required: true },
  { key: 'national_address', labelKey: 'doc_national_address', required: true },
  { key: 'chamber_certificate', labelKey: 'doc_chamber_certificate', required: true },
  { key: 'balady_license', labelKey: 'doc_balady_license', required: false },
  { key: 'civil_defense_permit', labelKey: 'doc_civil_defense_permit', required: false },
  { key: 'insurance_certificate', labelKey: 'doc_insurance_certificate', required: true },
  { key: 'gosi', labelKey: 'doc_gosi', required: true },
  { key: 'qiwa', labelKey: 'doc_qiwa', required: true },
  { key: 'worker_health_certificates', labelKey: 'doc_worker_health', required: false },
  { key: 'transport_licenses', labelKey: 'doc_transport_licenses', required: false },
  { key: 'signed_nda', labelKey: 'doc_signed_nda', required: true },
  { key: 'signed_msa', labelKey: 'doc_signed_msa', required: true },
];

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.15)' };

// ── Confirmation screen shown after submit ────────────────────────────────────
function ConfirmationScreen({ vendor, vendorId, docs, submittedAt, onReturnToPortal }) {
  const companyName = vendor?.company_name || 'Your Company';
  const uploadedCount = docs.filter(d => !!d.file_url).length;
  const totalDocs = REQUIRED_DOCS.length;

  const dateStr = submittedAt
    ? submittedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = submittedAt
    ? submittedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.35)', boxShadow: '0 0 32px rgba(16,185,129,0.15)' }}>
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Documents Successfully Submitted</h2>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Your application is now under review</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs" style={{ color: '#94a3b8' }}>Reference Number: <span className="font-mono font-semibold text-cyan-400">{vendorId || 'N/A'}</span></p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Submission Date: <span className="font-medium text-white">{dateStr}</span></p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Status: <span className="font-semibold" style={{ color: '#F59E0B' }}>Under Review</span></p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-xl p-5 space-y-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.18)' }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <ClipboardList className="w-4 h-4" style={{ color: '#06B6D4' }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#06B6D4' }}>Submission Summary</p>
        </div>

        <div className="space-y-2.5">
          <Row label="Company" value={companyName} />
          <Row label="Submitted" value={`${dateStr} at ${timeStr}`} />
          <Row label="Documents" value={`${uploadedCount} of ${totalDocs} uploaded`} />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#64748b' }}>Status</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
              🟡 Under Review
            </span>
          </div>
          <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xs" style={{ color: '#64748b' }}>Expected Review</span>
            <span className="text-xs font-medium text-white">3–5 Business Days</span>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="rounded-xl p-4"
        style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
          Your compliance documents have been submitted to the{' '}
          <span className="text-white font-medium">NOSSCO Vendor Management Team</span> for review.
          You will be notified via email once the review process is complete.
        </p>
        {vendor?.contact_email && (
          <p className="text-xs mt-2" style={{ color: '#64748b' }}>
            Confirmation sent to: <span style={{ color: '#06B6D4' }}>{vendor.contact_email}</span>
          </p>
        )}
      </div>

      {/* Return button */}
      <button
        type="button"
        onClick={onReturnToPortal}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
        <Home className="w-4 h-4" />
        Return to Vendor Portal
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}

// ── Main Step 4 component ─────────────────────────────────────────────────────
export default function OnboardingStep4({ docs: initialDocs, setDocs, vendorId, vendorName, vendor, onSubmitSuccess }) {
  const { t, isRTL } = useTranslation();
  const docLabel = (item) => t(item.labelKey);
  const [docs, setLocalDocs] = useState(initialDocs || []);
  const [uploading, setUploading] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [emailNotice, setEmailNotice] = useState(false);
  const [generatedRefNumber, setGeneratedRefNumber] = useState(null);
  const [localUploaded, setLocalUploaded] = useState(() => {
    const set = new Set();
    (initialDocs || []).forEach(d => { if (d.file_url || d.is_applicable === false) set.add(d.document_type); });
    return set;
  });

  // Refresh docs from DB whenever vendorId becomes available
  useEffect(() => {
    if (!vendorId) return;
    base44.entities.ComplianceDocument.filter({ vendor_id: vendorId }).then(fresh => {
      setLocalDocs(fresh);
      const set = new Set();
      fresh.forEach(d => { if (d.file_url || d.is_applicable === false) set.add(d.document_type); });
      setLocalUploaded(set);
    });
  }, [vendorId]);

  const refreshDocs = async () => {
    if (!vendorId) return [];
    const fresh = await base44.entities.ComplianceDocument.filter({ vendor_id: vendorId });
    setLocalDocs(fresh);
    setDocs(fresh);
    return fresh;
  };

  const getDoc = (key) => docs.find(d => d.document_type === key);

  const startEdit = (key) => {
    const existing = getDoc(key);
    setEditDoc({
      key,
      form: {
        issue_date: existing?.issue_date || '',
        expiry_date: existing?.expiry_date || '',
        is_applicable: existing?.is_applicable !== false,
      }
    });
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    // Guard: must have a vendor_id before uploading
    if (!vendorId) {
      alert('Please save your company information first before uploading documents.');
      e.target.value = '';
      return;
    }

    setUploading(key);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const label = docLabel(REQUIRED_DOCS.find(d => d.key === key) || { labelKey: key });
    const form = editDoc?.key === key ? editDoc.form : {};
    const existing = getDoc(key);

    const payload = {
      title: label,
      document_type: key,
      vendor_id: vendorId,
      vendor_name: vendorName || '',
      vendor_email: vendor?.contact_email || '',
      file_url,
      status: 'pending_review',
      issue_date: form.issue_date || '',
      expiry_date: form.expiry_date || '',
      is_applicable: form.is_applicable !== false,
    };

    if (existing?.id) {
      await base44.entities.ComplianceDocument.update(existing.id, payload);
    } else {
      await base44.entities.ComplianceDocument.create(payload);
    }

    try {
      const currentUser = await base44.auth.me();
      const toEmail = currentUser?.email || vendor?.contact_email || '';
      const docLabelText = docLabel(REQUIRED_DOCS.find(d => d.key === key) || { labelKey: key });
      const recipientName = currentUser?.full_name || vendorName || vendor?.company_name || toEmail;
      const companyName = vendor?.company_name || vendorName || 'N/A';
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      if (toEmail) {
        const htmlBody = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="color: #ffffff; margin: 0;">NOSSCO Operational Core</h2>
    <p style="color: #aaaaaa; margin: 5px 0 0;">Vendor Management System</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>Assalamu Alaikum,</p>
    <p>We are pleased to confirm that <strong>NOSSCO Operational Core</strong> has successfully received your compliance document.</p>
    <div style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 8px;">📄 Document Submission Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; color: #666; width: 40%;"><strong>Document Type</strong></td>
          <td style="padding: 8px;">${docLabelText}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Status</strong></td>
          <td style="padding: 8px;"><span style="background-color: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 12px;">Pending Review</span></td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;"><strong>Submission Date</strong></td>
          <td style="padding: 8px;">${dateStr}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 8px; color: #666;"><strong>Vendor Name</strong></td>
          <td style="padding: 8px;">${companyName}</td>
        </tr>
      </table>
    </div>
    <p>Our compliance team will review your document within <strong>3–5 business days</strong> and notify you of the outcome.</p>
    <p>If you have any questions, please do not hesitate to contact us.</p>
    <p>Thank you for your continued partnership with NOSSCO.</p>
    <p>Warm regards,<br><strong>NOSSCO Vendor Management Team</strong><br>NOSSCO Operational Core<br>Kingdom of Saudi Arabia</p>
  </div>
  <div style="background-color: #eeeeee; padding: 12px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
    This is an automated message. Please do not reply to this email.
  </div>
</body>
</html>`;
        await base44.integrations.Core.SendEmail({
          to: toEmail,
          from_name: 'NOSSCO Vendor Management',
          subject: `Document Received: ${docLabelText} – Pending Review`,
          body: htmlBody,
        });
      }
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    // Upsert the corresponding _url field on VendorApplication
    const urlFieldMap = {
      commercial_registration: 'commercial_registration_url',
      vat_certificate: 'vat_certificate_url',
      national_address: 'national_address_url',
      chamber_certificate: 'chamber_certificate_url',
      balady_license: 'balady_license_url',
      civil_defense_permit: 'civil_defense_permit_url',
      insurance_certificate: 'insurance_certificate_url',
      gosi: 'gosi_certificate_url',
      qiwa: 'qiwa_certificate_url',
      worker_health_certificates: 'worker_health_url',
      transport_licenses: 'transport_licenses_url',
      signed_nda: 'signed_nda_url',
      signed_msa: 'signed_msa_url',
    };
    const urlField = urlFieldMap[key];
    if (urlField) {
      const existing_apps = await base44.entities.VendorApplication.filter({ vendor_id: vendorId });
      if (existing_apps.length > 0) {
        await base44.entities.VendorApplication.update(existing_apps[0].id, { [urlField]: file_url });
      } else {
        await base44.entities.VendorApplication.create({
          vendor_id: vendorId,
          vendor_email: vendor?.contact_email || '',
          company_name: vendorName || '',
          application_status: 'draft',
          [urlField]: file_url,
        });
      }
    }

    await refreshDocs();
    setLocalUploaded(prev => new Set([...prev, key]));
    setUploading(null);
    setEditDoc(null);
  };

  const handleSubmitAllDocs = async () => {
    setSubmitting(true);

    const now = new Date();
    const nowISO = now.toISOString();
    const refNumber = 'NOSSCO-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    try {
      // Step 1: Update Vendor record
      if (vendorId) {
        await base44.entities.Vendor.update(vendorId, {
          review_status: 'pending_review',
          onboarding_complete: true,
          onboarding_step: 5,
          submission_date: nowISO,
          documents_submitted: true,
        });
      }

      // Step 2: Upsert VendorApplication snapshot
      if (vendorId) {
        const existing_apps = await base44.entities.VendorApplication.filter({ vendor_id: vendorId });
        if (existing_apps.length > 0) {
          await base44.entities.VendorApplication.update(existing_apps[0].id, {
            application_status: 'documents_submitted',
            documents_submitted: true,
            submission_date: nowISO,
            reference_number: refNumber,
            company_name: vendorName || vendor?.company_name || '',
            contact_person: vendor?.contact_person || vendor?.contact_name || '',
          });
        } else {
          await base44.entities.VendorApplication.create({
            vendor_id: vendorId,
            vendor_email: vendor?.contact_email || '',
            company_name: vendorName || vendor?.company_name || '',
            contact_person: vendor?.contact_person || vendor?.contact_name || '',
            application_status: 'documents_submitted',
            documents_submitted: true,
            submission_date: nowISO,
            reference_number: refNumber,
          });
        }
      }

      // Step 3: Bulk-update ComplianceDocuments with submission_batch
      if (vendorId) {
        const allDocs = docs.length > 0 ? docs : await base44.entities.ComplianceDocument.filter({ vendor_id: vendorId });
        await Promise.all(
          allDocs.map(d => base44.entities.ComplianceDocument.update(d.id, { submission_batch: refNumber }))
        );
      }

    } catch (err) {
      console.error('Submission error (non-blocking):', err);
    }

    // Step 4: Send confirmation emails via built-in SendEmail
    try {
      const authUser = await base44.auth.me();
      const toEmail = authUser?.email || vendor?.contact_email || '';
      const toName = authUser?.full_name || vendorName || vendor?.company_name || toEmail;
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

      const emailBody = `Dear ${toName},\n\nAssalamu Alaikum,\n\nWe are pleased to formally confirm that NOSSCO Operational Core has successfully received your compliance documentation submission.\n\nReference Number : ${refNumber}\nSubmission Date  : ${dateStr}\nStatus           : Pending Review\n\nOur Vendor Management Team will review your documents within 3 to 5 business days. You will be notified of the outcome.\n\nThank you for submitting your documents to NOSSCO.\n\nYours sincerely,\n\nVendor Management & Procurement Team\nNOSSCO Operational Core\nKingdom of Saudi Arabia\n\nAutomated notification – Do not reply.`;

      // Email to vendor/uploader
      if (toEmail) {
        await base44.integrations.Core.SendEmail({
          to: toEmail,
          from_name: 'NOSSCO Vendor Management',
          subject: `Compliance Documents Received – Pending Review | Ref: ${refNumber}`,
          body: emailBody,
        });
        setEmailNotice(toEmail);
      }

      // Email to NOSSCO admin
      await base44.integrations.Core.SendEmail({
        to: 'admin@nossco.com',
        from_name: 'NOSSCO System',
        subject: `New Vendor Document Submission | ${vendorName || vendor?.company_name || 'Vendor'} | Ref: ${refNumber}`,
        body: `A vendor has submitted compliance documents for review.\n\nVendor: ${vendorName || vendor?.company_name || 'N/A'}\nEmail: ${toEmail}\nReference: ${refNumber}\nDate: ${dateStr}\n\nPlease log in to NOSSCO to review the submission.`,
      });

    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    setSubmitting(false);
    setSubmittedAt(now);
    setSubmitted(true);
    setGeneratedRefNumber(refNumber);
  };

  const markNA = async (key) => {
    if (!vendorId) {
      alert('Please save your company information first.');
      return;
    }
    const existing = getDoc(key);
    const label = docLabel(REQUIRED_DOCS.find(d => d.key === key) || { labelKey: key });
    if (existing?.id) {
      await base44.entities.ComplianceDocument.update(existing.id, { is_applicable: false, status: 'approved' });
    } else {
      await base44.entities.ComplianceDocument.create({
        title: label, document_type: key,
        vendor_id: vendorId, vendor_name: vendorName || '',
        vendor_email: vendor?.contact_email || '',
        is_applicable: false, status: 'approved',
      });
    }
    await refreshDocs();
    setLocalUploaded(prev => new Set([...prev, key]));
  };

  const requiredDocs = REQUIRED_DOCS.filter(d => d.required);
  const requiredCount = requiredDocs.length;
  const doneCount = requiredDocs.filter(d => localUploaded.has(d.key)).length;
  const requiredUploaded = doneCount === requiredCount;

  // ── Show confirmation screen after submit ─────────────────────────────────
  if (submitted) {
    return (
      <ConfirmationScreen
        vendor={vendor}
        vendorId={generatedRefNumber || vendorId}
        docs={docs}
        submittedAt={submittedAt}
        onReturnToPortal={onSubmitSuccess}
      />
    );
  }

  // ── Document upload form ──────────────────────────────────────────────────
  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isRTL ? 'text-right' : ''}`} style={{ color: '#06B6D4' }}>{t('Document Upload')}</p>
      <p className={`text-xs mb-4 ${isRTL ? 'text-right' : ''}`} style={{ color: '#64748b' }}>
        {t('ob_doc_upload_hint')}
      </p>

      {REQUIRED_DOCS.map(({ key, labelKey, required }) => {
        const label = t(labelKey);
        const doc = getDoc(key);
        const isUploading = uploading === key;
        const uploaded = !!doc?.file_url;
        const notApplicable = doc?.is_applicable === false;
        const isEditing = editDoc?.key === key;

        return (
          <div key={key} className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${uploaded ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.07)'}`, background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: uploaded ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: uploaded ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
                {uploaded ? <Check className="w-4 h-4 text-green-400" /> : <FileText className="w-4 h-4" style={{ color: '#475569' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {label}
                  {required && <span className="ml-1 text-xs text-red-400">*</span>}
                  {notApplicable && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,116,139,0.2)', color: '#64748b' }}>N/A</span>}
                </p>
                {doc?.expiry_date && <p className="text-xs" style={{ color: '#64748b' }}>Expires: {doc.expiry_date}</p>}
                {doc?.status && !notApplicable && (
                  <p className="text-xs mt-0.5" style={{ color: doc.status === 'approved' ? '#10B981' : doc.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                    {doc.status.replace('_', ' ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc?.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/5">
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: '#06B6D4' }} />
                  </a>
                )}
                {!notApplicable && (
                  <button type="button" onClick={() => startEdit(key)}
                    className="text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(6,182,212,0.08)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.15)' }}>
                    {isUploading ? t('Uploading...') : uploaded ? t('Replace') : t('Upload')}
                  </button>
                )}
                {!required && !notApplicable && !uploaded && (
                  <button type="button" onClick={() => markNA(key)}
                    className="text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(100,116,139,0.08)', color: '#64748b', border: '1px solid rgba(100,116,139,0.15)' }}>
                    N/A
                  </button>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${isRTL ? 'text-right' : ''}`} style={{ color: '#64748b' }}>{t('Issue Date')}</label>
                    <input type="date" className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      value={editDoc.form.issue_date}
                      onChange={e => setEditDoc(d => ({ ...d, form: { ...d.form, issue_date: e.target.value } }))} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isRTL ? 'text-right' : ''}`} style={{ color: '#64748b' }}>{t('Expiry Date')}</label>
                    <input type="date" className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      value={editDoc.form.expiry_date}
                      onChange={e => setEditDoc(d => ({ ...d, form: { ...d.form, expiry_date: e.target.value } }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer"
                    style={{ background: 'rgba(6,182,212,0.06)', border: '2px dashed rgba(6,182,212,0.2)' }}>
                    <Upload className="w-4 h-4 mb-1" style={{ color: '#06B6D4' }} />
                    <span className="text-xs" style={{ color: '#64748b' }}>
                      {isUploading ? t('Uploading...') : t('Select file')}
                    </span>
                    <input type="file" className="hidden" disabled={isUploading}
                      onChange={e => handleFileUpload(e, key)} />
                  </label>
                  <button type="button" onClick={() => setEditDoc(null)}
                    className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Progress */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs" style={{ color: requiredUploaded ? '#10B981' : '#64748b' }}>
          {doneCount} of {requiredCount} required documents uploaded
        </p>
        {requiredUploaded && <span className="text-xs font-semibold" style={{ color: '#10B981' }}>✓ Ready to submit</span>}
      </div>

      {/* In-app confirmation notice */}
      {emailNotice && (
        <div className="rounded-xl px-4 py-4 space-y-1.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <p className="text-sm font-semibold" style={{ color: '#10B981' }}>✅ Documents Submitted Successfully!</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Your compliance documents have been submitted to NOSSCO Vendor Management Team.</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>A confirmation email has been sent to: <span style={{ color: '#06B6D4' }}>{typeof emailNotice === 'string' ? emailNotice : (vendor?.contact_email || '')}</span></p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Reference: <span className="font-mono font-semibold text-white">{generatedRefNumber || vendorId || 'N/A'}</span></p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Expected Review: <span className="font-medium text-white">3–5 business days</span></p>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          type="button"
          disabled={!requiredUploaded || submitting}
          onClick={handleSubmitAllDocs}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: requiredUploaded ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'rgba(255,255,255,0.05)',
            color: requiredUploaded ? 'white' : '#475569',
            border: requiredUploaded ? 'none' : '1px solid rgba(255,255,255,0.08)',
            cursor: requiredUploaded && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.75 : 1,
          }}>
          {            submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('Submitting...')}
            </>
          ) : (
            t('Submit All Documents for Review')
          )}
        </button>

      </div>
    </div>
  );
}