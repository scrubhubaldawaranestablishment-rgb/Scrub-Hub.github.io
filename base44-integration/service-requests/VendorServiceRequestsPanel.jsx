import { useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { ClipboardList, Sparkles, X, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { vendorMatchScore } from '@/lib/serviceRequestUtils';

function DetailModal({ request, vendor, onClose }) {
  const { t } = useTranslation();
  const score = vendorMatchScore(request, vendor?.id);
  const attachments = request.attachments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-mono font-semibold mb-1" style={{ color: '#06B6D4' }}>
              {request.ref_code}
            </p>
            <h3 className="text-lg font-semibold text-white">{request.title}</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={request.priority} />
          <StatusBadge status={request.status} />
          {score != null && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}>
              <Sparkles className="w-2.5 h-2.5" />
              {score}% {t('match')}
            </span>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>{t('Client')}</p>
            <p className="text-white">{request.client_name || '—'}</p>
          </div>
          {request.location && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>{t('Location')}</p>
              <p className="text-white">{request.location}</p>
            </div>
          )}
          {request.description && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>{t('Description')}</p>
              <p className="text-white text-sm" style={{ color: '#94a3b8' }}>{request.description}</p>
            </div>
          )}
          {attachments.length > 0 && (
            <div>
              <p className="text-xs mb-1.5" style={{ color: '#64748b' }}>{t('Attachments')}</p>
              <div className="space-y-1.5">
                {attachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs hover:underline"
                    style={{ color: '#06B6D4' }}>
                    <ExternalLink className="w-3 h-3" />
                    {a.name || t('Attachment')}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#475569' }}>
          {t('Created')}: {new Date(request.created_date).toLocaleString('en-GB')}
        </p>
      </div>
    </div>
  );
}

export default function VendorServiceRequestsPanel({ requests, vendor }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const newCount = requests.filter((r) => r.status === 'new_request').length;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" style={{ color: '#06B6D4' }} />
          <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#06B6D4' }}>
            {t('Service Requests')}
          </p>
        </div>
        {newCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
            {newCount} {t('new')}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: '#64748b' }}>
          {t('No service requests assigned to you yet')}
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {requests.map((r) => {
            const score = vendorMatchScore(r, vendor?.id);
            const isNew = r.status === 'new_request';
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className="w-full text-left p-3 rounded-lg transition-colors hover:bg-white/[0.03]"
                style={{
                  background: isNew ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isNew ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold" style={{ color: '#06B6D4' }}>
                      {r.ref_code}
                    </p>
                    <p className="text-sm font-medium text-white truncate mt-0.5">{r.title}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={r.status} />
                    {score != null && (
                      <span className="text-[10px] font-bold" style={{ color: '#06B6D4' }}>{score}%</span>
                    )}
                  </div>
                </div>
                <p className="text-xs truncate" style={{ color: '#64748b' }}>
                  {r.client_name} · {new Date(r.created_date).toLocaleDateString('en-GB')}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <DetailModal request={selected} vendor={vendor} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
