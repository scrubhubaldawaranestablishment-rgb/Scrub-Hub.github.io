import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingStep1, { isStep1Valid } from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import OnboardingStep4 from './OnboardingStep4';
import OnboardingStep5 from './OnboardingStep5';
import OnboardingStep6 from './OnboardingStep6';
import { CheckCircle } from 'lucide-react';
import {
  saveVendorDraft,
  loadVendorDraft,
  clearVendorDraft,
  saveVendorStep,
  mergeVendorData,
  getResumeStep,
  getMaxReachableStep,
  hasVendorDraft,
} from '@/lib/vendorDraftStorage';
import { useTranslation } from '@/lib/useTranslation';

const STEP_KEYS = [
  { num: 1, labelKey: 'ob_step_company' },
  { num: 2, labelKey: 'ob_step_sectors' },
  { num: 3, labelKey: 'ob_step_capabilities' },
  { num: 4, labelKey: 'ob_step_documents' },
  { num: 5, labelKey: 'ob_step_review' },
  { num: 6, labelKey: 'ob_step_tier' },
];

export default function VendorOnboardingWizard({ vendor, docs, user, isInternalUser, onUpdate, startStep }) {
  const { t, isRTL } = useTranslation();
  const userEmail = user?.email || '';
  const draft = loadVendorDraft(userEmail);
  const initialFormData = mergeVendorData(vendor, draft, userEmail);
  const initialStep =
    startStep ??
    (isInternalUser ? 5 : getResumeStep(vendor, docs, draft, isInternalUser));

  const [step, setStep] = useState(initialStep);
  const [maxStep, setMaxStep] = useState(isInternalUser ? 6 : getMaxReachableStep(vendor, docs));
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const formDataRef = useRef(initialFormData);
  const vendorIdRef = useRef(vendor?.id || initialFormData?.id || null);
  const hydratedVendorId = useRef(vendor?.id ?? null);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { vendorIdRef.current = vendor?.id || formData?.id || null; }, [vendor?.id, formData?.id]);
  useEffect(() => { setSaveError(null); }, [step]);

  // Jump to a specific step when parent requests it (e.g. dashboard "edit step 1")
  useEffect(() => {
    if (startStep != null) {
      setStep(startStep);
      setMaxStep((prev) => Math.max(prev, startStep));
    }
  }, [startStep]);

  // Hydrate from local draft when no server vendor yet (e.g. after failed create)
  useEffect(() => {
    if (vendor?.id || !userEmail) return;
    const localDraft = loadVendorDraft(userEmail);
    if (!localDraft?.formData) return;

    setFormData((prev) => mergeVendorData(null, localDraft, userEmail));
    if (!isInternalUser && startStep == null && localDraft.step) {
      setStep(localDraft.step);
      setMaxStep((prev) => Math.max(prev, localDraft.step));
    }
  }, [userEmail, vendor?.id, isInternalUser, startStep]);

  // Hydrate from server only when vendor record first loads — never bump step on later updates
  useEffect(() => {
    if (!vendor?.id) return;

    const vendorId = vendor.id;
    const isNewVendor = vendorId !== hydratedVendorId.current;
    if (!isNewVendor) return;

    hydratedVendorId.current = vendorId;

    const merged = mergeVendorData(vendor, loadVendorDraft(userEmail), userEmail);
    setFormData(merged);
    formDataRef.current = merged;
    vendorIdRef.current = vendorId;

    if (!isInternalUser && startStep == null) {
      const resume = getResumeStep(vendor, docs, loadVendorDraft(userEmail), false);
      setStep(resume);
      setMaxStep((prev) => Math.max(prev, resume));
    }
  }, [vendor?.id, docs, isInternalUser, startStep, userEmail]);

  const persistToServer = useCallback(async (data, nextStep, { createIfMissing = true } = {}) => {
    const payload = {
      contact_email: userEmail || data.contact_email || '',
      ...data,
      onboarding_step: Math.max(nextStep, data.onboarding_step || 1),
    };

    const existingId = vendorIdRef.current;

    try {
      const result = await base44.functions.invoke('saveVendorOnboarding', {
        vendorId: existingId || null,
        formData: payload,
        onboardingStep: nextStep,
      });

      const saved = result?.data?.vendor || result?.vendor;
      if (saved?.id) {
        vendorIdRef.current = saved.id;
        setFormData((prev) => ({ ...prev, ...saved, id: saved.id }));
        onUpdate?.();
        return saved.id;
      }
    } catch (fnErr) {
      console.warn('saveVendorOnboarding failed, falling back to entity API:', fnErr);
    }

    // Fallback to direct entity API (works after RLS fix)
    if (existingId) {
      const updated = await base44.entities.Vendor.update(existingId, payload);
      onUpdate?.();
      return updated?.id || existingId;
    }

    if (!createIfMissing) return null;

    const created = await base44.entities.Vendor.create({
      ...payload,
      status: 'onboarding',
      review_status: 'not_submitted',
    });

    vendorIdRef.current = created.id;
    setFormData((prev) => ({ ...prev, id: created.id }));
    onUpdate?.();
    return created.id;
  }, [userEmail, onUpdate]);

  const handleFormChange = useCallback((updater) => {
    setFormData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const withId = { ...next, id: next.id || prev?.id };
      formDataRef.current = withId;

      // Local draft only — server save happens on "Save & Continue" / Back (steps 1–3)
      if (!isInternalUser && step < 4) {
        saveVendorDraft(userEmail, withId, step);
        saveVendorStep(userEmail, step);
      }

      return withId;
    });
  }, [step, isInternalUser, userEmail]);

  useEffect(() => {
    const flushDraft = () => {
      if (isInternalUser || step >= 4) return;
      saveVendorDraft(userEmail, formDataRef.current, step);
      saveVendorStep(userEmail, step);
    };

    window.addEventListener('beforeunload', flushDraft);
    return () => window.removeEventListener('beforeunload', flushDraft);
  }, [step, isInternalUser, userEmail]);

  const saveStep = async (nextStep) => {
    setSaving(true);
    setSaveError(null);

    const payload = {
      contact_email: userEmail || formData.contact_email || '',
      ...formData,
      onboarding_step: Math.max(nextStep, formData.onboarding_step || 1, vendor?.onboarding_step || 1),
    };

    try {
      await persistToServer(payload, nextStep);
      saveVendorDraft(userEmail, payload, nextStep);
      saveVendorStep(userEmail, nextStep);
      setStep(nextStep);
      setMaxStep((prev) => Math.max(prev, nextStep));
      setLastSavedAt(Date.now());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Could not save your progress. Your data is kept locally — try again.');
      saveVendorDraft(userEmail, payload, nextStep);
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (action, notes) => {
    setSaving(true);
    const now = new Date().toISOString();
    const statusMap = {
      approved: 'active',
      rejected: 'inactive',
      needs_revision: vendor?.status || 'onboarding',
      needs_human_review: vendor?.status || 'onboarding',
    };
    const extraFields = {};
    if (action === 'approved') extraFields.approved_date = now;
    if (action === 'rejected') extraFields.rejected_date = now;
    await base44.entities.Vendor.update(vendor.id, {
      review_status: action,
      review_notes: notes,
      reviewed_by: user?.full_name || 'Internal',
      reviewed_date: now,
      status: statusMap[action] || vendor?.status,
      ...extraFields,
    });
    setSaving(false);
    onUpdate();
  };

  const handleAssignTier = async (tier) => {
    setSaving(true);
    await base44.entities.Vendor.update(vendor.id, {
      vendor_tier: tier,
      status: tier === 'suspended' ? 'suspended' : 'active',
    });
    if (tier !== 'suspended') clearVendorDraft(userEmail);
    setSaving(false);
    onUpdate();
  };

  const canGoNext = () => {
    if (step === 1) return isStep1Valid(formData, userEmail);
    if (step === 2) return (formData.sectors || []).length > 0;
    if (step === 3) return !!formData.terms_accepted;
    return true;
  };

  const handleDocumentsSuccess = () => {
    clearVendorDraft(userEmail);
    onUpdate();
    setStep(5);
    setMaxStep((prev) => Math.max(prev, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const vendorId = vendor?.id || formData.id;
  const canContinue = canGoNext() && !saving;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {!isInternalUser && (vendor || hasVendorDraft(userEmail)) && !vendor?.onboarding_complete && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div>
            <p className="text-sm font-semibold text-white">{t('Continue Your Application')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {step < 4
                ? t('Edit your answers below, then click Save & Continue when ready.')
                : t('You stopped at step. All your data is saved.', { step })}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
            style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
            {t('Step of 6', { step })}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEP_KEYS.map((s, i) => {
          const done = s.num < maxStep;
          const active = step === s.num;
          const canAccess = isInternalUser || s.num <= maxStep;
          return (
            <div key={s.num} className="flex items-center">
              <button
                type="button"
                disabled={!canAccess}
                onClick={() => {
                  if (!canAccess) return;
                  if (!isInternalUser && s.num < 4) {
                    saveVendorDraft(userEmail, formDataRef.current, s.num);
                    saveVendorStep(userEmail, s.num);
                  }
                  setStep(s.num);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all"
                style={{
                  background: active ? 'rgba(6,182,212,0.15)' : done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#06B6D4' : done ? '#10B981' : '#475569',
                  border: active ? '1px solid rgba(6,182,212,0.3)' : done ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: canAccess ? 'pointer' : 'not-allowed',
                }}
              >
                {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: active ? '#06B6D4' : 'rgba(255,255,255,0.06)', color: active ? 'white' : 'inherit' }}>{s.num}</span>}
                {t(s.labelKey)}
              </button>
              {i < STEP_KEYS.length - 1 && <div className="w-4 h-px mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />}
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        {!isInternalUser && step < 4 && (
          <div className="flex justify-end mb-3 h-4">
            {lastSavedAt && Date.now() - lastSavedAt < 5000 && (
              <span className="text-xs flex items-center gap-1" style={{ color: '#10B981' }}>
                <CheckCircle className="w-3 h-3" /> {t('Saved')}
              </span>
            )}
          </div>
        )}

        {saveError && (
          <p className="text-xs mb-3" style={{ color: '#F97316' }}>{saveError}</p>
        )}

        {step === 1 && <OnboardingStep1 data={formData} onChange={handleFormChange} />}
        {step === 2 && <OnboardingStep2 data={formData} onChange={handleFormChange} />}
        {step === 3 && <OnboardingStep3 data={formData} onChange={handleFormChange} />}
        {step === 4 && (
          <OnboardingStep4
            docs={docs}
            setDocs={() => onUpdate()}
            vendorId={vendorId}
            vendorName={formData.company_name || vendor?.company_name}
            vendor={vendor || formData}
            onSubmitSuccess={handleDocumentsSuccess}
          />
        )}
        {step === 5 && (
          <OnboardingStep5
            vendor={vendor || formData}
            docs={docs}
            onReview={handleReview}
            isInternalUser={isInternalUser}
          />
        )}
        {step === 6 && (
          <OnboardingStep6
            vendor={vendor || formData}
            onAssignTier={handleAssignTier}
            isInternalUser={isInternalUser}
          />
        )}
      </div>

      {!isInternalUser && (
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => (step <= 3 ? saveStep(step - 1) : setStep((s) => s - 1))}
              className="text-sm px-4 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {saving ? '...' : t('← Back')}
            </button>
          ) : <div />}

          {step < 4 && (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => saveStep(step + 1)}
              className="text-sm px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                background: canContinue ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.06)',
                color: canContinue ? 'white' : '#64748b',
                border: canContinue ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: canContinue ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? t('Saving...') : t('Save & Continue →')}
            </button>
          )}

          {step === 4 && <div />}
        </div>
      )}
    </div>
  );
}
