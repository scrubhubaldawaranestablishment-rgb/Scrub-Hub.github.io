import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingStep1 from './OnboardingStep1';
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
} from '@/lib/vendorDraftStorage';

const STEPS = [
  { num: 1, label: 'Company Info' },
  { num: 2, label: 'Sectors' },
  { num: 3, label: 'Capabilities' },
  { num: 4, label: 'Documents' },
  { num: 5, label: 'Review' },
  { num: 6, label: 'Tier' },
];

const AUTOSAVE_DELAY_MS = 1200;

export default function VendorOnboardingWizard({ vendor, docs, user, isInternalUser, onUpdate, startStep }) {
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
  const [autoSaved, setAutoSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const autoSaveTimer = useRef(null);
  const formDataRef = useRef(initialFormData);
  const vendorIdRef = useRef(vendor?.id || initialFormData?.id || null);
  const hydratedVendorId = useRef(vendor?.id ?? null);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { vendorIdRef.current = vendor?.id || formData?.id || null; }, [vendor?.id, formData?.id]);
  useEffect(() => { setSaveError(null); }, [step]);

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

  // Hydrate from server when vendor loads after refresh
  useEffect(() => {
    if (!vendor?.id) return;

    const vendorId = vendor.id;
    const isNewVendor = vendorId !== hydratedVendorId.current;
    hydratedVendorId.current = vendorId;

    if (isNewVendor) {
      const merged = mergeVendorData(vendor, loadVendorDraft(userEmail), userEmail);
      setFormData(merged);
      formDataRef.current = merged;
      vendorIdRef.current = vendorId;

      if (!isInternalUser && startStep == null) {
        const resume = getResumeStep(vendor, docs, loadVendorDraft(userEmail), false);
        setStep(resume);
        setMaxStep((prev) => Math.max(prev, resume));
      }
    } else if (!isInternalUser && startStep == null) {
      setFormData((prev) => ({ ...vendor, ...prev, id: vendor.id }));
      const resume = getResumeStep(vendor, docs, loadVendorDraft(userEmail), false);
      setStep((prev) => Math.max(prev, resume));
      setMaxStep((prev) => Math.max(prev, resume, getMaxReachableStep(vendor, docs)));
    }
  }, [vendor?.id, vendor?.onboarding_step, vendor?.updated_date, docs?.length, isInternalUser, startStep, userEmail]);

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

      if (!isInternalUser && step < 4) {
        saveVendorDraft(userEmail, withId, step);
        saveVendorStep(userEmail, step);

        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(async () => {
          try {
            await persistToServer(formDataRef.current, step);
            setAutoSaved(true);
            setTimeout(() => setAutoSaved(false), 2000);
          } catch (err) {
            console.error('Auto-save failed:', err);
          }
        }, AUTOSAVE_DELAY_MS);
      }

      return withId;
    });
  }, [step, isInternalUser, userEmail, persistToServer]);

  useEffect(() => {
    const flushDraft = () => {
      if (isInternalUser || step >= 4) return;
      saveVendorDraft(userEmail, formDataRef.current, step);
      saveVendorStep(userEmail, step);
    };

    window.addEventListener('beforeunload', flushDraft);
    return () => {
      window.removeEventListener('beforeunload', flushDraft);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [step, isInternalUser, userEmail]);

  const saveStep = async (nextStep) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
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
    if (step === 1) return !!(formData.company_name && (formData.contact_email || userEmail));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const done = s.num < maxStep;
          const active = step === s.num;
          const canAccess = isInternalUser || s.num <= maxStep;
          return (
            <div key={s.num} className="flex items-center">
              <button
                type="button"
                disabled={!canAccess}
                onClick={() => canAccess && setStep(s.num)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all"
                style={{
                  background: active ? 'rgba(6,182,212,0.15)' : done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#06B6D4' : done ? '#10B981' : '#475569',
                  border: active ? '1px solid rgba(6,182,212,0.3)' : done ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: canAccess ? 'pointer' : 'not-allowed',
                }}
              >
                {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: active ? '#06B6D4' : 'rgba(255,255,255,0.06)', color: active ? 'white' : 'inherit' }}>{s.num}</span>}
                {s.label}
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />}
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        {!isInternalUser && step < 4 && (
          <div className="flex justify-end mb-3 h-4">
            {autoSaved && (
              <span className="text-xs flex items-center gap-1" style={{ color: '#10B981' }}>
                <CheckCircle className="w-3 h-3" /> Saved
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
              {saving ? '...' : '← Back'}
            </button>
          ) : <div />}

          {step < 4 && (
            <button
              type="button"
              disabled={!canGoNext() || saving}
              onClick={() => saveStep(step + 1)}
              className="text-sm px-6 py-2 rounded-lg font-medium transition-all"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white', opacity: canGoNext() && !saving ? 1 : 0.4 }}
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          )}

          {step === 4 && <div />}
        </div>
      )}
    </div>
  );
}
