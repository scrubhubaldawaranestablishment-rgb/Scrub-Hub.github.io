import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import GlassButton from '@/components/shared/GlassButton';
import RFPSuccessModal from './RFPSuccessModal';
import { X, Upload, FileText, Info } from 'lucide-react';
import { VALID_SOURCES } from '@/lib/nosscoRules';

const inp = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };
const sel = { background: 'rgba(15,20,32,0.95)', border: '1px solid rgba(6,182,212,0.2)' };

const EMPTY = {
  title: '', description: '', service_category: 'maintenance',
  client_name: '', location: '', priority: 'medium',
  vendor_name: '', assigned_controller: '', source: 'internal',
  sla_deadline: '', scope_notes: '',
};

function generateRef() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NSC-${year}-${rand}`;
}

export default function NewRequestForm({ user, onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' | 'rfp'
  const [form, setForm] = useState({ ...EMPTY });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // RFP-specific state
  const [rfpForm, setRfpForm] = useState({ title: '', description: '', priority: 'medium', client_name: '' });
  const [rfpFile, setRfpFile] = useState(null);
  const [rfpSaving, setRfpSaving] = useState(false);
  const [rfpSuccess, setRfpSuccess] = useState(null); // { refCode }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resolveVendorId = async (vendorName) => {
    if (!vendorName?.trim()) return null;
    const vendors = await base44.entities.Vendor.list('-created_date', 200);
    const match = vendors.find(
      (v) => v.company_name?.trim().toLowerCase() === vendorName.trim().toLowerCase()
    );
    return match?.id || null;
  };

  const handleSubmit = async () => {
    setSaving(true);
    let attachments = [];

    if (files.length > 0) {
      setUploading(true);
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        attachments.push({ name: file.name, url: file_url, uploaded_at: new Date().toISOString(), uploaded_by: user?.full_name || 'User' });
      }
      setUploading(false);
    }

    const vendorId = await resolveVendorId(form.vendor_name);

    const activity = [{
      id: Date.now().toString(),
      action: 'Request Created',
      from_status: null,
      to_status: 'new_request',
      actor: user?.full_name || 'System',
      timestamp: new Date().toISOString(),
      note: `Internal operations workflow · Source: ${form.source}`,
    }];

    await base44.entities.ServiceRequest.create({
      ...form,
      vendor_id: vendorId || undefined,
      ref_code: generateRef(),
      status: 'new_request',
      attachments,
      comments: [],
      activity_history: activity,
      sla_deadline: form.sla_deadline || undefined,
    });

    setSaving(false);
    onCreated();
    onClose();
  };

  const handleRFPSubmit = async () => {
    if (!rfpForm.title || !rfpForm.client_name) return;
    setRfpSaving(true);

    let rfpFileUrl = null;
    if (rfpFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: rfpFile });
      rfpFileUrl = file_url;
    }

    const refCode = generateRef();
    const attachments = rfpFileUrl
      ? [{ name: rfpFile.name, url: rfpFileUrl, uploaded_at: new Date().toISOString(), uploaded_by: user?.full_name || 'User' }]
      : [];

    const created = await base44.entities.ServiceRequest.create({
      title: rfpForm.title,
      description: rfpForm.description,
      priority: rfpForm.priority,
      client_name: rfpForm.client_name,
      source: 'rfp',
      status: 'new_request',
      ref_code: refCode,
      attachments,
      comments: [],
      activity_history: [{
        id: Date.now().toString(),
        action: 'RFP Registered',
        from_status: null,
        to_status: 'new_request',
        actor: user?.full_name || 'Operations',
        timestamp: new Date().toISOString(),
        note: 'RFP uploaded internally by operations — no client notification sent',
      }],
    });

    // Fire-and-forget AI vendor matching — pushes to matched vendor dashboards
    base44.functions.invoke('rfpVendorMatch', {
      serviceRequestId: created.id,
      fileUrl: rfpFileUrl,
      description: rfpForm.description,
      title: rfpForm.title,
    }).catch(err => console.warn('rfpVendorMatch fire-and-forget error:', err));

    setRfpSaving(false);
    setRfpSuccess({ refCode });
    onCreated();
  };

  if (rfpSuccess) {
    return (
      <RFPSuccessModal
        refCode={rfpSuccess.refCode}
        internal
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl glass-card overflow-hidden" style={{ border: '1px solid rgba(6,182,212,0.25)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(6,182,212,0.1)' }}>
          <div>
            <h3 className="font-bold text-white">New Service Request</h3>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>A unique reference code will be auto-generated</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[{ key: 'standard', label: 'Standard Request' }, { key: 'rfp', label: 'Upload RFP' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 text-xs font-semibold transition-all"
              style={{
                color: activeTab === tab.key ? '#06B6D4' : '#475569',
                borderBottom: activeTab === tab.key ? '2px solid #06B6D4' : '2px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* STANDARD TAB */}
        {activeTab === 'standard' && (
          <>
            <div className="overflow-y-auto p-5 space-y-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Request Title *</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none text-white" style={inp}
                  placeholder="Brief description of the service required"
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Full Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white resize-none" style={inp}
                  placeholder="Detailed scope and requirements..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Client Name *</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
                    value={form.client_name} onChange={e => set('client_name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Location *</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
                    placeholder="Site / building / address"
                    value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Service Category</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                    value={form.service_category} onChange={e => set('service_category', e.target.value)}>
                    {['maintenance','facility_management','technical','cleaning','security','landscaping','pest_control','hvac','electrical','plumbing','civil','other'].map(o => (
                      <option key={o} value={o} style={{ background: '#1e293b' }}>{o.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Priority</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                    value={form.priority} onChange={e => set('priority', e.target.value)}>
                    {['low','medium','high','critical'].map(o => (
                      <option key={o} value={o} style={{ background: '#1e293b' }}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                    Source <span className="text-xs font-normal" style={{ color: '#475569' }}>(Rule 3)</span>
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                    value={form.source} onChange={e => set('source', e.target.value)}>
                    {VALID_SOURCES.map(o => (
                      <option key={o.value} value={o.value} style={{ background: '#1e293b' }}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Assign Vendor (optional)</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
                    placeholder="Vendor company name"
                    value={form.vendor_name} onChange={e => set('vendor_name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Operations Controller</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
                    placeholder="Controller name or email"
                    value={form.assigned_controller} onChange={e => set('assigned_controller', e.target.value)} />
                </div>
              </div>
              {form.vendor_name && !form.assigned_controller && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span><strong>Rule 4:</strong> An Operations Controller must be assigned to manage all vendor–client communication.</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>SLA Deadline (optional)</label>
                <input type="datetime-local" className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={{ ...inp, colorScheme: 'dark' }}
                  value={form.sla_deadline} onChange={e => set('sla_deadline', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Scope Notes</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white resize-none" style={inp}
                  placeholder="Technical scope, constraints, or special instructions..."
                  value={form.scope_notes} onChange={e => set('scope_notes', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Attachments (optional)</label>
                <label className="flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer"
                  style={{ border: '2px dashed rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.02)' }}>
                  <Upload className="w-5 h-5 mb-1" style={{ color: '#06B6D4' }} />
                  <span className="text-xs" style={{ color: '#64748b' }}>Upload documents, RFPs, or photos</span>
                  <input type="file" className="hidden" multiple onChange={e => setFiles(Array.from(e.target.files))} />
                </label>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                        <FileText className="w-3 h-3" />{f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: 'rgba(6,182,212,0.1)' }}>
              <GlassButton variant="ghost" onClick={onClose}>Cancel</GlassButton>
              <GlassButton disabled={saving || !form.title || !form.client_name || (!!form.vendor_name && !form.assigned_controller)} onClick={handleSubmit}>
                {saving ? (uploading ? 'Uploading files...' : 'Creating...') : 'Create Request'}
              </GlassButton>
            </div>
          </>
        )}

        {/* RFP TAB */}
        {activeTab === 'rfp' && (
          <>
            <div className="overflow-y-auto p-5 space-y-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                <p className="text-xs font-semibold" style={{ color: '#06B6D4' }}>Internal Operations Workflow</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  Upload a client RFP for internal review. No email is sent to the client. Matched vendors will see this request on their dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>RFP Title *</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none text-white" style={inp}
                  placeholder="e.g. Annual HVAC Maintenance Contract – Riyadh HQ"
                  value={rfpForm.title} onChange={e => setRfpForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Client / Company Name *</label>
                <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
                  placeholder="Your company name"
                  value={rfpForm.client_name} onChange={e => setRfpForm(f => ({ ...f, client_name: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Brief Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white resize-none" style={inp}
                  placeholder="Summarise the key services and requirements..."
                  value={rfpForm.description} onChange={e => setRfpForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Priority</label>
                <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                  value={rfpForm.priority} onChange={e => setRfpForm(f => ({ ...f, priority: e.target.value }))}>
                  {['low','medium','high','critical'].map(o => (
                    <option key={o} value={o} style={{ background: '#1e293b' }}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>RFP Document (optional but recommended)</label>
                <label className="flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer transition-all"
                  style={{ border: `2px dashed ${rfpFile ? 'rgba(16,185,129,0.4)' : 'rgba(6,182,212,0.25)'}`, background: rfpFile ? 'rgba(16,185,129,0.04)' : 'rgba(6,182,212,0.02)' }}>
                  {rfpFile ? (
                    <>
                      <FileText className="w-6 h-6 mb-1.5" style={{ color: '#10B981' }} />
                      <span className="text-sm font-medium" style={{ color: '#10B981' }}>{rfpFile.name}</span>
                      <span className="text-xs mt-0.5" style={{ color: '#64748b' }}>Click to replace</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-1.5" style={{ color: '#06B6D4' }} />
                      <span className="text-sm" style={{ color: '#64748b' }}>Upload RFP document</span>
                      <span className="text-xs mt-0.5" style={{ color: '#475569' }}>PDF, DOCX, or any format</span>
                    </>
                  )}
                  <input type="file" className="hidden" onChange={e => setRfpFile(e.target.files[0] || null)} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: 'rgba(6,182,212,0.1)' }}>
              <GlassButton variant="ghost" onClick={onClose}>Cancel</GlassButton>
              <GlassButton
                disabled={rfpSaving || !rfpForm.title || !rfpForm.client_name}
                onClick={handleRFPSubmit}>
                {rfpSaving ? 'Registering RFP...' : 'Register RFP'}
              </GlassButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}