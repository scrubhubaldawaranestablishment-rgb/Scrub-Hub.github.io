import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import GlassButton from '@/components/shared/GlassButton';
import RFPSuccessModal from '@/components/workflow/RFPSuccessModal';
import { generateRfpRef, sendRfpConfirmationEmail } from '@/lib/clientRfpEmail';
import { X, Upload, FileText } from 'lucide-react';

const EMPTY = { title: '', description: '', priority: 'medium', category: 'general' };

const sel = { background: 'rgba(15,20,32,0.95)', border: '1px solid rgba(6,182,212,0.2)' };
const inp = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };

export default function NewRequestModal({ user, client, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [rfpFile, setRfpFile] = useState(null);
  const [tab, setTab] = useState('ticket'); // 'ticket' | 'rfp'
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rfpSuccess, setRfpSuccess] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const clientName = client?.company_name || user?.full_name || 'Client';
  const recipientName = user?.full_name || clientName;
  const recipientEmail = user?.email || client?.contact_email || '';

  const handleSubmitTicket = async () => {
    setSaving(true);
    await base44.entities.Ticket.create({
      ...form,
      client_name: clientName,
      client_id: client?.id || '',
      status: 'open',
    });
    setSaving(false);
    onCreated();
    onClose();
  };

  const handleSubmitRFP = async () => {
    if (!rfpFile || !form.title) return;
    setSaving(true);
    setUploading(true);

    const refNumber = generateRfpRef();
    const { file_url } = await base44.integrations.Core.UploadFile({ file: rfpFile });
    setUploading(false);

    await base44.entities.WorkOrder.create({
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: 'created',
      client_name: clientName,
      client_id: client?.id || '',
      notes: `RFP Submitted. Ref: ${refNumber}. File: ${file_url}`,
    });

    const emailResult = await sendRfpConfirmationEmail({
      toEmail: recipientEmail,
      toName: recipientName,
      clientName,
      rfpTitle: form.title,
      refNumber,
      fileName: rfpFile.name,
      priority: form.priority,
    });

    setSaving(false);
    setRfpSuccess({ refCode: refNumber, emailSent: emailResult.clientSent, email: recipientEmail });
    onCreated();
  };

  if (rfpSuccess) {
    return (
      <RFPSuccessModal
        refCode={rfpSuccess.refCode}
        emailSent={rfpSuccess.emailSent}
        email={rfpSuccess.email}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg glass-card p-6" style={{ border: '1px solid rgba(6,182,212,0.25)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white">New Service Request</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.1)' }}>
          {[{ key: 'ticket', label: 'Support Ticket' }, { key: 'rfp', label: 'Upload RFP' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === t.key ? 'rgba(6,182,212,0.15)' : 'transparent',
                color: tab === t.key ? '#06B6D4' : '#64748b',
                border: tab === t.key ? '1px solid rgba(6,182,212,0.25)' : '1px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Title *</label>
            <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
              placeholder={tab === 'rfp' ? 'Project name / RFP title' : 'Briefly describe the issue'}
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Description</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white resize-none" style={inp}
              placeholder="Provide additional context..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Priority</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['low','medium','high','critical'].map(o => <option key={o} value={o} style={{ background: '#1e293b' }}>{o}</option>)}
              </select>
            </div>
            {tab === 'ticket' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Category</label>
                <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                  value={form.category} onChange={e => set('category', e.target.value)}>
                  {['technical','maintenance','billing','compliance','general'].map(o => <option key={o} value={o} style={{ background: '#1e293b' }}>{o}</option>)}
                </select>
              </div>
            )}
          </div>

          {tab === 'rfp' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>RFP File *</label>
              <label className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all"
                style={{ background: rfpFile ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', border: rfpFile ? '2px solid rgba(16,185,129,0.3)' : '2px dashed rgba(6,182,212,0.2)' }}>
                {rfpFile ? (
                  <>
                    <FileText className="w-6 h-6 mb-1 text-green-400" />
                    <span className="text-xs font-medium text-green-400">{rfpFile.name}</span>
                    <span className="text-xs mt-0.5" style={{ color: '#475569' }}>Click to replace</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-1" style={{ color: '#06B6D4' }} />
                    <span className="text-xs" style={{ color: '#64748b' }}>Click to upload PDF, DOCX, or XLS</span>
                  </>
                )}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={e => setRfpFile(e.target.files[0] || null)} />
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <GlassButton variant="ghost" onClick={onClose}>Cancel</GlassButton>
          <GlassButton
            disabled={saving || !form.title || (tab === 'rfp' && !rfpFile)}
            onClick={tab === 'ticket' ? handleSubmitTicket : handleSubmitRFP}>
            {saving ? (uploading ? 'Uploading...' : 'Submitting...') : tab === 'ticket' ? 'Submit Ticket' : 'Submit RFP'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
