import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/shared/StatusBadge';
import SLATimer from '@/components/shared/SLATimer';
import GlassButton from '@/components/shared/GlassButton';
import PageHeader from '@/components/shared/PageHeader';
import WorkOrderVendorMatcher from '@/components/workorders/WorkOrderVendorMatcher';
import { Plus, X, FileText, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import {
  STATUS_PIPELINE,
  completionForStatus,
  isRfpWorkOrder,
  parseRfpMeta,
} from '@/lib/workOrderUtils';

const EMPTY = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'created',
  vendor_name: '',
  vendor_id: '',
  client_name: '',
  location: '',
  completion_percentage: 0,
  source: 'manual',
};

const inp = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };
const sel = { background: 'rgba(15,20,32,0.9)', border: '1px solid rgba(6,182,212,0.2)' };

function withAutoCompletion(data) {
  const pct = completionForStatus(data.status);
  return { ...data, completion_percentage: pct };
}

export default function WorkOrderSystem() {
  const { t } = useTranslation();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = () => base44.entities.WorkOrder.list('-created_date').then(setWorkOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const rfpCount = workOrders.filter(isRfpWorkOrder).length;

  const patchForm = (updates) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.status) {
        next.completion_percentage = completionForStatus(updates.status);
        if (updates.status === 'assigned' && !next.vendor_name) {
          /* keep vendor empty until assigned */
        }
      }
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const payload = withAutoCompletion(form);
    if (payload.id) {
      await base44.entities.WorkOrder.update(payload.id, payload);
    } else {
      await base44.entities.WorkOrder.create(payload);
    }
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY);
    load();
  };

  const advance = async (wo) => {
    const idx = STATUS_PIPELINE.indexOf(wo.status);
    if (idx < STATUS_PIPELINE.length - 1) {
      const next = STATUS_PIPELINE[idx + 1];
      if (next === 'completed' && wo.status !== 'review') {
        alert('Rule 7: Work Order must pass QA Review before it can be marked completed.');
        return;
      }
      await base44.entities.WorkOrder.update(wo.id, {
        status: next,
        completion_percentage: completionForStatus(next),
      });
      load();
    }
  };

  const filtered = workOrders.filter((w) => {
    if (filter === 'all') return true;
    if (filter === 'rfp') return isRfpWorkOrder(w);
    return w.status === filter || w.priority === filter;
  });

  const openEdit = (wo) => {
    setForm(withAutoCompletion({ ...wo }));
    setShowForm(true);
  };

  const handleVendorAssign = (vendorId, vendorName) => {
    const nextStatus = form.status === 'created' ? 'assigned' : form.status;
    patchForm({
      vendor_id: vendorId,
      vendor_name: vendorName,
      status: nextStatus,
      completion_percentage: completionForStatus(nextStatus),
    });
  };

  const formRfpMeta = parseRfpMeta(form);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Work Orders')}
        subtitle={`${workOrders.filter(w => w.status === 'in_progress').length} ${t('in progress')} · ${rfpCount} ${t('client RFPs')}`}
        actions={<GlassButton icon={Plus} onClick={() => { setForm({ ...EMPTY, completion_percentage: 0 }); setShowForm(true); }}>{t('New Work Order')}</GlassButton>}
      />

      {/* Pipeline overview */}
      <div className="grid grid-cols-5 gap-3">
        {STATUS_PIPELINE.map(s => {
          const count = workOrders.filter(w => w.status === s).length;
          const colors = { created: '#3B82F6', assigned: '#06B6D4', in_progress: '#F59E0B', review: '#A855F7', completed: '#10B981' };
          return (
            <div key={s} className="glass-card p-4 text-center cursor-pointer" onClick={() => setFilter(s)}>
              <p className="text-2xl font-bold" style={{ color: colors[s] }}>{count}</p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>{t(s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</p>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'rfp', ...STATUS_PIPELINE, 'critical', 'high'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
            style={filter === f
              ? { background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {f === 'all' ? t('All') : f === 'rfp' ? `${t('Client RFP')} (${rfpCount})` : t(f.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
              {['Title','Client','Vendor','Priority','Status','SLA','Progress','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: '#64748b' }}>{t('No work orders found')}</td></tr>
            ) : filtered.map(wo => {
              const rfp = isRfpWorkOrder(wo);
              const pct = completionForStatus(wo.status);
              return (
                <tr key={wo.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelected(wo)}>
                  <td className="px-4 py-3 text-sm font-medium text-white max-w-48">
                    <div className="flex items-center gap-2 min-w-0">
                      {rfp && <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#06B6D4' }} />}
                      <span className="truncate">{wo.title}</span>
                      {rfp && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
                          {t('Client RFP')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{wo.client_name || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{wo.vendor_name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={wo.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={wo.status} /></td>
                  <td className="px-4 py-3">{wo.sla_deadline ? <SLATimer deadline={wo.sla_deadline} breached={wo.sla_breached} /> : <span style={{ color: '#475569' }}>—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }} />
                      </div>
                      <span className="text-xs" style={{ color: '#64748b' }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {wo.status !== 'completed' && (
                        <button onClick={() => advance(wo)} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>{t('Advance')}</button>
                      )}
                      <button onClick={() => openEdit(wo)} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>{t('Edit')}</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg glass-card p-6 max-h-[92vh] overflow-y-auto" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{form.id ? t('Edit Work Order') : t('New Work Order')}</h3>
                {isRfpWorkOrder(form) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>{t('Client RFP')}</span>
                )}
              </div>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
            </div>

            {isRfpWorkOrder(form) && formRfpMeta.fileUrl && (
              <div className="mb-4 p-3 rounded-xl flex items-center justify-between gap-3"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: '#06B6D4' }}>{t('Client RFP Attachment')}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{formRfpMeta.ref || 'RFP'}</p>
                </div>
                <a href={formRfpMeta.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded flex items-center gap-1 flex-shrink-0"
                  style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>
                  <ExternalLink className="w-3 h-3" /> {t('View')}
                </a>
              </div>
            )}

            <div className="space-y-4">
              {['title', 'client_name', 'location'].map(key => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1 capitalize" style={{ color: '#94a3b8' }}>{key.replace('_', ' ')}</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={inp}
                    value={form[key] || ''} onChange={e => patchForm({ [key]: e.target.value })} />
                </div>
              ))}

              <WorkOrderVendorMatcher
                workOrder={form}
                vendorName={form.vendor_name || ''}
                onVendorNameChange={(name) => patchForm({ vendor_name: name })}
                onSelectVendor={handleVendorAssign}
                onMatchesChange={(matches, ranAt) => patchForm({
                  vendor_match_data: JSON.stringify(matches),
                  vendor_match_ran_at: ranAt,
                })}
              />

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Description</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white resize-none" style={inp}
                  value={form.description || ''} onChange={e => patchForm({ description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('Priority'), key: 'priority', opts: ['low','medium','high','critical'] },
                  { label: t('Status'), key: 'status', opts: STATUS_PIPELINE },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{f.label}</label>
                    <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={sel}
                      value={form[f.key] || ''} onChange={e => patchForm({ [f.key]: e.target.value })}>
                      {f.opts.map(o => <option key={o} value={o}>{o.replace('_',' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  {t('Completion %')} — {t('auto from status')}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-2 rounded-full" style={{
                      width: `${completionForStatus(form.status)}%`,
                      background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                    }} />
                  </div>
                  <span className="text-sm font-semibold text-white w-10 text-right">
                    {completionForStatus(form.status)}%
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#475569' }}>
                  {t('Created 0% · Assigned 25% · In Progress 50% · Review 75% · Completed 100%')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{t('SLA Deadline')}</label>
                <input type="datetime-local" className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                  style={{ ...inp, colorScheme: 'dark' }}
                  value={form.sla_deadline ? form.sla_deadline.slice(0,16) : ''}
                  onChange={e => patchForm({ sla_deadline: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <GlassButton variant="ghost" onClick={() => setShowForm(false)}>{t('Cancel')}</GlassButton>
              <GlassButton onClick={save} disabled={saving}>{saving ? t('Saving...') : t('Save')}</GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md" style={{ background: 'rgba(10,15,28,0.97)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(6,182,212,0.15)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(6,182,212,0.1)' }}>
            <h3 className="font-semibold text-white">{t('Work Order Details')}</h3>
            <button onClick={() => setSelected(null)}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-semibold text-white">{selected.title}</p>
              {isRfpWorkOrder(selected) && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>{t('Client RFP')}</span>
              )}
            </div>
            <div className="flex gap-2"><StatusBadge status={selected.priority} /><StatusBadge status={selected.status} /></div>

            {isRfpWorkOrder(selected) && (
              <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                <p className="text-xs font-semibold" style={{ color: '#06B6D4' }}>{t('Client RFP')}</p>
                {parseRfpMeta(selected).ref && (
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Ref: <span className="font-mono text-white">{parseRfpMeta(selected).ref}</span></p>
                )}
                {parseRfpMeta(selected).fileUrl && (
                  <a href={parseRfpMeta(selected).fileUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: '#06B6D4' }}>
                    <ExternalLink className="w-3 h-3" /> {t('Open RFP document')}
                  </a>
                )}
              </div>
            )}

            {selected.sla_deadline && <div><p className="text-xs mb-1" style={{ color: '#64748b' }}>SLA</p><SLATimer deadline={selected.sla_deadline} breached={selected.sla_breached} /></div>}
            <div>
              <p className="text-xs mb-1.5" style={{ color: '#64748b' }}>{t('STATUS PIPELINE')}</p>
              <div className="flex items-center gap-1">
                {STATUS_PIPELINE.map((s, i) => {
                  const curr = STATUS_PIPELINE.indexOf(selected.status);
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: i <= curr ? '#06B6D4' : 'rgba(255,255,255,0.1)' }} />
                      {i < STATUS_PIPELINE.length - 1 && <div className="w-4 h-px" style={{ background: i < curr ? '#06B6D4' : 'rgba(255,255,255,0.1)' }} />}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs mt-1 capitalize" style={{ color: '#06B6D4' }}>{t(selected.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[[t('Client'), selected.client_name], [t('Vendor'), selected.vendor_name], [t('Location'), selected.location], [t('Progress'), `${completionForStatus(selected.status)}%`]].map(([k,v]) => (
                <div key={k}><p className="text-xs" style={{ color: '#64748b' }}>{k}</p><p className="text-sm text-white">{v || '—'}</p></div>
              ))}
            </div>
            {selected.status === 'review' && (
              <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
                <strong>Rule 7:</strong> QA Review in progress — completion requires QA sign-off.
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <GlassButton onClick={() => { openEdit(selected); setSelected(null); }}>{t('Edit')}</GlassButton>
              {selected.status !== 'completed' && (
                <GlassButton variant="secondary" onClick={() => { advance(selected); setSelected(null); }}>{t('Advance Status')}</GlassButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
