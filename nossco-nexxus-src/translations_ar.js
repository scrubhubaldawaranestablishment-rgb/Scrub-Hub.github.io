import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/shared/StatusBadge';
import GlassButton from '@/components/shared/GlassButton';
import PageHeader from '@/components/shared/PageHeader';
import { Plus, X, Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

const EMPTY = { company_name: '', contact_name: '', contact_email: '', contact_phone: '', status: 'onboarding', service_tier: 'standard', industry: '' };

export default function ClientManagement() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Client.list('-created_date').then(setClients).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.Client.update(form.id, form);
    else await base44.entities.Client.create(form);
    setSaving(false); setShowForm(false); setForm(EMPTY); load();
  };

  const del = async (id) => { await base44.entities.Client.delete(id); load(); };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Client Management')}
        subtitle={`${clients.filter(c => c.status === 'active').length} ${t('Active Clients')}`}
        actions={<GlassButton icon={Plus} onClick={() => { setForm(EMPTY); setShowForm(true); }}>{t('Add Client')}</GlassButton>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="glass-card h-32 animate-pulse" />
        )) : clients.length === 0 ? (
          <div className="col-span-3 glass-card p-12 text-center">
            <Building2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#475569' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>{t('No clients yet')}. {t('Add your first client.')}</p>
          </div>
        ) : clients.map(c => (
          <div key={c.id} className="glass-card glass-card-hover p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: '#fff' }}>
                  {c.company_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{c.company_name}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{c.industry || t('No industry')}</p>
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-xs" style={{ color: '#94a3b8' }}>{c.contact_name || '—'} · {c.contact_email}</p>
              <p className="text-xs" style={{ color: '#475569' }}>{t('Tier')}: <span style={{ color: '#06B6D4' }}>{t(c.service_tier?.charAt(0).toUpperCase() + c.service_tier?.slice(1) || '')}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm(c); setShowForm(true); }} className="text-xs px-3 py-1.5 rounded-lg flex-1"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>{t('Edit')}</button>
              <button onClick={() => del(c.id)} className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{t('Remove')}</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg glass-card p-6" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{form.id ? t('Edit Client') : t('Add Client')}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { labelKey: 'Company Name', key: 'company_name' },
                { labelKey: 'Industry', key: 'industry' },
                { labelKey: 'Contact Name', key: 'contact_name' },
                { labelKey: 'Contact Email', key: 'contact_email' },
                { labelKey: 'Phone', key: 'contact_phone' },
              ].map(f => (
                <div key={f.key} className={f.key === 'company_name' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{t(f.labelKey)}</label>
                  <input className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}
                    value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              {[
                { labelKey: 'Status', key: 'status', opts: ['active','inactive','onboarding'] },
                { labelKey: 'Service Tier', key: 'service_tier', opts: ['basic','standard','premium','enterprise'] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{t(f.labelKey)}</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                    style={{ background: 'rgba(15,20,32,0.9)', border: '1px solid rgba(6,182,212,0.2)' }}
                    value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <GlassButton variant="ghost" onClick={() => setShowForm(false)}>{t('Cancel')}</GlassButton>
              <GlassButton onClick={save} disabled={saving}>{saving ? t('Saving...') : t('Save')}</GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}