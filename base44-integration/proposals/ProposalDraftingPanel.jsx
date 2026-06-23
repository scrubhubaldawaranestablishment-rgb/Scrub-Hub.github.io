import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, FileText, Edit3, CheckCircle2, RefreshCw, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import GlassButton from '@/components/shared/GlassButton';
import { sendProposalToClientEmail } from '@/lib/proposalClientEmail';

const SECTIONS = [
  { key: 'executive_summary',   label: 'Executive Summary' },
  { key: 'scope_of_work',       label: 'Scope of Work' },
  { key: 'timeline',            label: 'Timeline' },
  { key: 'cost_breakdown',      label: 'Cost Breakdown' },
  { key: 'terms_and_conditions',label: 'Terms & Conditions' },
];

function parseProposal(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export default function ProposalDraftingPanel({ request, vendor, isAdmin, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [emailNotice, setEmailNotice] = useState(null);
  const [openSections, setOpenSections] = useState({ executive_summary: true });

  const proposal = parseProposal(request.proposal_data);

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const generate = async () => {
    setGenerating(true);
    const vendorContext = vendor
      ? `Vendor: ${vendor.company_name}. Sectors: ${(vendor.sectors || []).join(', ')}. Cities covered: ${vendor.cities_covered || 'N/A'}. Years in operation: ${vendor.years_in_operation || 'N/A'}. Service capacity: ${vendor.service_capacity || 'N/A'}.`
      : 'Vendor details not provided.';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional proposal writer for a facilities management company called NOSSCO.
Generate a formal vendor proposal for the following service request.

Service Request:
- Title: ${request.title}
- Category: ${request.service_category || 'N/A'}
- Priority: ${request.priority}
- Location: ${request.location || 'N/A'}
- Client: ${request.client_name}
- Description: ${request.description || 'N/A'}
- Scope Notes: ${request.scope_notes || 'N/A'}

${vendorContext}

Generate a complete professional proposal with 5 sections. Be specific, professional, and realistic. Use markdown formatting within each section.`,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary:    { type: 'string' },
          scope_of_work:        { type: 'string' },
          timeline:             { type: 'string' },
          cost_breakdown:       { type: 'string' },
          terms_and_conditions: { type: 'string' },
        },
      },
    });

    await base44.entities.ServiceRequest.update(request.id, {
      proposal_data: JSON.stringify(result),
      proposal_generated_at: new Date().toISOString(),
      proposal_submitted: false,
    });
    setGenerating(false);
    setEditing(false);
    onUpdated?.();
  };

  const startEdit = () => {
    setEditData({ ...proposal });
    setEditing(true);
    setOpenSections(Object.fromEntries(SECTIONS.map(s => [s.key, true])));
  };

  const saveEdit = async () => {
    setSaving(true);
    await base44.entities.ServiceRequest.update(request.id, {
      proposal_data: JSON.stringify(editData),
    });
    setSaving(false);
    setEditing(false);
    onUpdated?.();
  };

  const submitProposal = async () => {
    if (!proposal) return;
    setSaving(true);
    setEmailNotice(null);

    const emailResult = await sendProposalToClientEmail({ request, proposal });

    await base44.entities.ServiceRequest.update(request.id, {
      proposal_submitted: true,
      proposal_submitted_at: new Date().toISOString(),
      proposal_email_sent_at: emailResult.sent ? new Date().toISOString() : undefined,
      proposal_email_sent_to: emailResult.sent ? emailResult.email : undefined,
    });

    setSaving(false);
    if (emailResult.sent) {
      setEmailNotice({ type: 'success', email: emailResult.email });
    } else if (emailResult.reason === 'no_client_email') {
      setEmailNotice({ type: 'warning', message: 'Proposal saved but no client email found. Add contact email in Client Management.' });
    } else {
      setEmailNotice({ type: 'error', message: 'Proposal saved but the client email could not be sent. Try again or contact support.' });
    }
    onUpdated?.();
  };

  const displayData = editing ? editData : proposal;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.03)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(168,85,247,0.12)' }}>
        <FileText className="w-4 h-4" style={{ color: '#A855F7' }} />
        <span className="text-xs font-bold" style={{ color: '#A855F7' }}>Proposal Drafting</span>
        {request.proposal_submitted && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </span>
        )}
        {!request.proposal_submitted && proposal && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
            Draft Ready
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Generate / Regenerate button */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: '#64748b' }}>
            {proposal
              ? `Generated ${request.proposal_generated_at ? new Date(request.proposal_generated_at).toLocaleDateString('en-GB') : ''}`
              : 'No proposal drafted yet.'}
          </p>
          <div className="flex items-center gap-2">
            {proposal && !editing && !request.proposal_submitted && (
              <button onClick={startEdit}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.25)' }}>
              {generating
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                : proposal
                  ? <><RefreshCw className="w-3 h-3" /> Regenerate</>
                  : <><Sparkles className="w-3 h-3" /> Draft Proposal</>
              }
            </button>
          </div>
        </div>

        {/* Proposal sections */}
        {displayData && (
          <div className="space-y-2">
            {SECTIONS.map(({ key, label }) => (
              <div key={key} className="rounded-lg overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                >
                  <span className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>{label}</span>
                  {openSections[key]
                    ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#475569' }} />
                    : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#475569' }} />
                  }
                </button>
                {openSections[key] && (
                  <div className="px-3 pb-3">
                    {editing ? (
                      <textarea
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none text-white resize-y"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.25)', lineHeight: '1.6' }}
                        value={editData[key] || ''}
                        onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                      />
                    ) : (
                      <div className="text-xs whitespace-pre-wrap" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                        {displayData[key] || <span className="italic" style={{ color: '#334155' }}>— Not generated —</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit actions */}
        {editing && (
          <div className="flex gap-2 pt-1">
            <GlassButton variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</GlassButton>
            <GlassButton size="sm" disabled={saving} onClick={saveEdit} icon={CheckCircle2}>
              {saving ? 'Saving...' : 'Save Changes'}
            </GlassButton>
          </div>
        )}

        {/* Submit button */}
        {proposal && !editing && !request.proposal_submitted && (
          <div className="pt-1">
            <GlassButton
              onClick={submitProposal}
              disabled={saving}
              icon={CheckCircle2}
              className="w-full justify-center"
            >
              {saving ? 'Submitting...' : 'Submit Proposal to Client'}
            </GlassButton>
            <p className="text-xs mt-2 text-center" style={{ color: '#334155' }}>
              Sends the proposal to the client by email. Review all sections before submitting.
            </p>
          </div>
        )}

        {emailNotice?.type === 'success' && (
          <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6EE7B7' }}>
            <Mail className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Proposal sent to <strong style={{ color: '#10B981' }}>{emailNotice.email}</strong></span>
          </div>
        )}
        {emailNotice?.type === 'warning' && (
          <p className="text-xs text-center p-3 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
            {emailNotice.message}
          </p>
        )}
        {emailNotice?.type === 'error' && (
          <p className="text-xs text-center p-3 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
            {emailNotice.message}
          </p>
        )}

        {request.proposal_submitted && request.proposal_submitted_at && (
          <div className="space-y-1">
            <p className="text-xs text-center" style={{ color: '#475569' }}>
              Submitted on {new Date(request.proposal_submitted_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            {request.proposal_email_sent_to && (
              <p className="text-xs text-center flex items-center justify-center gap-1" style={{ color: '#64748b' }}>
                <Mail className="w-3 h-3" />
                Sent to {request.proposal_email_sent_to}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}