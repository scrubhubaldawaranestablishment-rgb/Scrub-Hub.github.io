import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { parseRfpMeta, parseVendorMatches } from '@/lib/workOrderUtils';

const inp = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };

function ScoreBar({ score }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-10 text-right" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function WorkOrderVendorMatcher({
  workOrder,
  vendorName = '',
  onVendorNameChange,
  onSelectVendor,
  onMatchesChange,
}) {
  const { t } = useTranslation();
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState(() => parseVendorMatches(workOrder?.vendor_match_data));
  const [error, setError] = useState(null);

  const rfpMeta = parseRfpMeta(workOrder);
  const isRfp = workOrder?.source === 'rfp' || !!rfpMeta.fileUrl || /RFP/i.test(workOrder?.notes || '');

  const runMatch = async () => {
    setMatching(true);
    setError(null);

    try {
      const allVendors = await base44.entities.Vendor.list('-created_date', 200);
      const vendors = allVendors.filter(v =>
        v.status === 'active' || v.review_status === 'approved' || v.onboarding_complete
      );

      if (!vendors.length) {
        setError('No approved vendors available for matching.');
        setMatches([]);
        return;
      }

      let extractedText = '';
      if (rfpMeta.fileUrl) {
        try {
          const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: rfpMeta.fileUrl,
            json_schema: {
              type: 'object',
              properties: {
                services_required: { type: 'array', items: { type: 'string' } },
                locations: { type: 'array', items: { type: 'string' } },
                scope_summary: { type: 'string' },
                equipment_needed: { type: 'array', items: { type: 'string' } },
              },
            },
          });
          if (extracted.status === 'success' && extracted.output) {
            extractedText = JSON.stringify(extracted.output);
          }
        } catch {
          /* continue with title/description only */
        }
      }

      const vendorSummaries = vendors.map(v => {
        let subcats = '';
        try {
          subcats = v.subcategories ? JSON.stringify(JSON.parse(v.subcategories)) : '';
        } catch {
          subcats = v.subcategories || '';
        }
        return {
          id: v.id,
          name: v.company_name,
          sectors: Array.isArray(v.sectors) ? v.sectors.join(', ') : (v.sectors || 'General'),
          subcategories: subcats,
          cities: v.cities_covered || v.cities_served || 'N/A',
          employees: v.num_employees || 'N/A',
          service_capacity: v.service_capacity || 'N/A',
          emergency: v.emergency_support ? 'yes' : 'no',
        };
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a vendor matching AI for NOSSCO, a facilities management company in Saudi Arabia.

A client has submitted a Request for Proposal (RFP). Analyze the requirements and rank the best vendor partners.

WORK ORDER / RFP:
- Title: ${workOrder?.title || 'N/A'}
- Client: ${workOrder?.client_name || 'N/A'}
- Description: ${workOrder?.description || 'N/A'}
- Priority: ${workOrder?.priority || 'medium'}
- RFP Reference: ${rfpMeta.ref || 'N/A'}
- RFP File URL: ${rfpMeta.fileUrl || 'Not attached'}
${extractedText ? `\nExtracted from RFP document:\n${extractedText}` : ''}

AVAILABLE VENDORS (${vendorSummaries.length}):
${JSON.stringify(vendorSummaries, null, 2)}

INSTRUCTIONS:
1. Identify services required from the RFP title, description, and attachment.
2. Score each vendor 0-100 based on sector/subcategory fit (60%), geography (20%), capacity (20%).
3. Return TOP 5 vendors sorted by score descending.
4. Provide a concise reason for each match.
5. Only include vendors with score >= 30.`,
        response_json_schema: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  vendor_id: { type: 'string' },
                  vendor_name: { type: 'string' },
                  score: { type: 'number' },
                  reason: { type: 'string' },
                  sectors: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const nextMatches = (result?.matches || []).slice(0, 5);
      const ranAt = new Date().toISOString();
      setMatches(nextMatches);
      onMatchesChange?.(nextMatches, ranAt);

      if (workOrder?.id) {
        await base44.entities.WorkOrder.update(workOrder.id, {
          vendor_match_data: JSON.stringify(nextMatches),
          vendor_match_ran_at: ranAt,
        });
      }
    } catch (err) {
      console.error('Vendor match failed:', err);
      setError(err.message || 'AI vendor matching failed. Try again.');
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="block text-xs font-medium" style={{ color: '#94a3b8' }}>{t('Vendor Name')}</label>
          <button
            type="button"
            onClick={runMatch}
            disabled={matching}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}
          >
            {matching
              ? <><Loader2 className="w-3 h-3 animate-spin" /> {t('Analyzing...')}</>
              : <><Sparkles className="w-3 h-3" /> {t('AI Generate')}</>}
          </button>
        </div>
        <input
          className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
          style={inp}
          value={vendorName}
          onChange={(e) => onVendorNameChange?.(e.target.value)}
          placeholder={t('Assign vendor manually or use AI Generate')}
        />
      </div>

    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.18)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#06B6D4' }} />
        <span className="text-xs font-semibold" style={{ color: '#06B6D4' }}>
          {isRfp ? t('AI Vendor Match (RFP)') : t('AI Vendor Match')}
        </span>
      </div>

      {isRfp && rfpMeta.fileUrl && (
        <a href={rfpMeta.fileUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs hover:underline"
          style={{ color: '#94a3b8' }}>
          <ExternalLink className="w-3 h-3" /> {t('View client RFP attachment')}
          {rfpMeta.ref && <span style={{ color: '#64748b' }}>({rfpMeta.ref})</span>}
        </a>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {!matches?.length && !matching && !error && (
        <p className="text-xs" style={{ color: '#64748b' }}>
          {t('Click AI Generate to analyze the RFP and rank vendors by fit percentage.')}
        </p>
      )}

      {matches?.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {matches.map((m, idx) => (
            <div key={m.vendor_id || idx} className="rounded-lg p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-medium text-white truncate">{m.vendor_name}</span>
                <button
                  type="button"
                  onClick={() => onSelectVendor?.(m.vendor_id, m.vendor_name, Math.round(m.score))}
                  className="text-xs px-2 py-1 rounded font-semibold flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  {t('Assign')}
                </button>
              </div>
              <ScoreBar score={Math.round(m.score)} />
              {m.reason && <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>{m.reason}</p>}
            </div>
          ))}
        </div>
      )}

      {workOrder?.vendor_match_ran_at && (
        <p className="text-xs" style={{ color: '#475569' }}>
          {t('Last analyzed')}: {new Date(workOrder.vendor_match_ran_at).toLocaleString('en-GB')}
        </p>
      )}
    </div>
    </div>
  );
}
