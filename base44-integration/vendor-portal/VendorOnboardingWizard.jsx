/**
 * Vendor 6-step onboarding wizard — persistence-fixed version.
 *
 * Apply in Base44: replace the existing VendorOnboardingWizard component
 * (search for "Save & Continue" or the STEPS array with Company Info → Tier).
 *
 * Fixes:
 * - Restores form data + step from Vendor entity on load/refresh
 * - localStorage draft backup on every change (survives refresh before auto-save)
 * - Creates Vendor record on first change (not only when company_name exists)
 * - Syncs step + form when vendor prop loads asynchronously
 * - Flushes pending auto-save on page unload
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  saveVendorDraft,
  loadVendorDraft,
  clearVendorDraft,
  saveVendorStep,
  mergeVendorData,
  getResumeStep,
  getMaxReachableStep,
} from '@/lib/vendorDraftStorage';

// Re-use your existing step components — adjust import paths to match your project
import CompanyInfoStep from '@/components/vendor/onboarding/CompanyInfoStep';
import SectorsStep from '@/components/vendor/onboarding/SectorsStep';
import CapabilitiesStep from '@/components/vendor/onboarding/CapabilitiesStep';
import DocumentsStep from '@/components/vendor/onboarding/DocumentsStep';
import ReviewStep from '@/components/vendor/onboarding/ReviewStep';
import TierStep from '@/components/vendor/onboarding/TierStep';

const STEPS = [
  { num: 1, label: 'Company Info' },
  { num: 2, label: 'Sectors' },
  { num: 3, label: 'Capabilities' },
  { num: 4, label: 'Documents' },
  { num: 5, label: 'Review' },
  { num: 6, label: 'Tier' },
];

const AUTOSAVE_DELAY_MS = 1200;

export default function VendorOnboardingWizard({
  vendor,
  docs,
  user,
  isInternalUser,
  onUpdate,
  startStep,
}) {
  const userEmail = user?.email || '';
  const draft = loadVendorDraft(userEmail);

  const initialForm = mergeVendorData(vendor, draft, userEmail);
  const initialStep =
    startStep ??
    (isInternalUser
      ? 5
      : getResumeStep(vendor, docs, draft, isInternalUser));

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [maxStep, setMaxStep] = useState(
    isInternalUser ? 6 : getMaxReachableStep(vendor, docs)
  );
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const autoSaveTimer = useRef(null);
  const formRef = useRef(initialForm);
  const vendorIdRef = useRef(vendor?.id || initialForm?.id || null);
  const hydratedVendorId = useRef(vendor?.id ?? null);

  useEffect(() => {
    formRef.current = formData;
  }, [formData]);

  useEffect(() => {
    vendorIdRef.current = vendor?.id || formData?.id || null;
  }, [vendor?.id, formData?.id]);

  // Hydrate from server when vendor loads after refresh
  useEffect(() => {
    if (!vendor?.id) return;

    const vendorId = vendor.id;
    const isNewVendor = vendorId !== hydratedVendorId.current;
    hydratedVendorId.current = vendorId;

    if (isNewVendor) {
      const merged = mergeVendorData(vendor, loadVendorDraft(userEmail), userEmail);
      setFormData(merged);
      formRef.current = merged;
      vendorIdRef.current = vendorId;

      if (!isInternalUser && startStep == null) {
        const resume = getResumeStep(vendor, docs, loadVendorDraft(userEmail), false);
        setCurrentStep(resume);
        setMaxStep((prev) => Math.max(prev, resume));
      }
    } else if (!isInternalUser && startStep == null) {
      setFormData((prev) => ({ ...vendor, ...prev, id: vendor.id }));
      const resume = getResumeStep(vendor, docs, loadVendorDraft(userEmail), false);
      setCurrentStep((prev) => Math.max(prev, resume));
      setMaxStep((prev) => Math.max(prev, resume, getMaxReachableStep(vendor, docs)));
    }
  }, [vendor?.id, vendor?.onboarding_step, vendor?.updated_date, docs?.length, isInternalUser, startStep, userEmail]);

  useEffect(() => {
    setSaveError(null);
  }, [currentStep]);

  const persistToServer = useCallback(
    async (data, step, { createIfMissing = true } = {}) => {
      const payload = {
        contact_email: userEmail || data.contact_email || '',
        ...data,
        onboarding_step: Math.max(step, data.onboarding_step || 1),
      };

      const existingId = vendorIdRef.current;

      if (existingId) {
        await base44.entities.Vendor.update(existingId, payload);
        return existingId;
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
    },
    [userEmail, onUpdate]
  );

  const scheduleAutoSave = useCallback(
    (nextForm, step) => {
      if (isInternalUser || step >= 4) return;

      saveVendorDraft(userEmail, nextForm, step);
      saveVendorStep(userEmail, step);

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

      autoSaveTimer.current = setTimeout(async () => {
        const latest = formRef.current;
        try {
          await persistToServer(latest, step);
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, AUTOSAVE_DELAY_MS);
    },
    [isInternalUser, userEmail, persistToServer]
  );

  const handleFormChange = useCallback(
    (updater) => {
      setFormData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const withId = { ...next, id: next.id || prev?.id };
        scheduleAutoSave(withId, currentStep);
        return withId;
      });
    },
    [currentStep, scheduleAutoSave]
  );

  // Keep local draft in sync when leaving the page (refresh / close tab)
  useEffect(() => {
    const flushDraft = () => {
      if (isInternalUser || currentStep >= 4) return;
      saveVendorDraft(userEmail, formRef.current, currentStep);
      saveVendorStep(userEmail, currentStep);
    };

    window.addEventListener('beforeunload', flushDraft);
    return () => {
      window.removeEventListener('beforeunload', flushDraft);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [currentStep, isInternalUser, userEmail]);

  const goToStep = async (targetStep) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    setSaving(true);
    setSaveError(null);

    const payload = {
      contact_email: userEmail || formData.contact_email || '',
      ...formData,
      onboarding_step: Math.max(
        targetStep,
        formData.onboarding_step || 1,
        vendor?.onboarding_step || 1
      ),
    };

    try {
      await persistToServer(payload, targetStep);
      saveVendorDraft(userEmail, payload, targetStep);
      saveVendorStep(userEmail, targetStep);
      setCurrentStep(targetStep);
      setMaxStep((prev) => Math.max(prev, targetStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Could not save your progress. Your data is kept locally — try again.');
      saveVendorDraft(userEmail, payload, targetStep);
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (status, notes) => {
    setSaving(true);
    const now = new Date().toISOString();
    const statusMap = {
      approved: 'active',
      rejected: 'inactive',
      needs_revision: vendor?.status || 'onboarding',
      needs_human_review: vendor?.status || 'onboarding',
    };
    const extra = {};
    if (status === 'approved') extra.approved_date = now;
    if (status === 'rejected') extra.rejected_date = now;

    await base44.entities.Vendor.update(vendor.id, {
      review_status: status,
      review_notes: notes,
      reviewed_by: user?.full_name || 'Internal',
      reviewed_date: now,
      status: statusMap[status] || vendor?.status,
      ...extra,
    });

    setSaving(false);
    onUpdate?.();
  };

  const handleAssignTier = async (tier) => {
    setSaving(true);
    await base44.entities.Vendor.update(vendor.id, {
      vendor_tier: tier,
      status: tier === 'suspended' ? 'suspended' : 'active',
    });
    if (tier !== 'suspended') clearVendorDraft(userEmail);
    setSaving(false);
    onUpdate?.();
  };

  const canContinue = () => {
    if (currentStep === 1) {
      return !!(formData.company_name && (formData.contact_email || userEmail));
    }
    if (currentStep === 2) return (formData.sectors || []).length > 0;
    if (currentStep === 3) return !!formData.terms_accepted;
    return true;
  };

  const handleDocumentsSuccess = () => {
    clearVendorDraft(userEmail);
    onUpdate?.();
    setCurrentStep(5);
    setMaxStep((prev) => Math.max(prev, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const vendorId = vendor?.id || formData.id;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, index) => {
          const completed = step.num < maxStep;
          const active = currentStep === step.num;
          const reachable = isInternalUser || step.num <= maxStep;

          return (
            <div key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setCurrentStep(step.num)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all"
                style={{
                  background: active
                    ? 'rgba(6,182,212,0.15)'
                    : completed
                      ? 'rgba(16,185,129,0.08)'
                      : 'rgba(255,255,255,0.03)',
                  color: active ? '#06B6D4' : completed ? '#10B981' : '#475569',
                  border: active
                    ? '1px solid rgba(6,182,212,0.3)'
                    : completed
                      ? '1px solid rgba(16,185,129,0.2)'
                      : '1px solid rgba(255,255,255,0.05)',
                  cursor: reachable ? 'pointer' : 'not-allowed',
                }}
              >
                {completed ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: active ? '#06B6D4' : 'rgba(255,255,255,0.06)',
                      color: active ? 'white' : 'inherit',
                    }}
                  >
                    {step.num}
                  </span>
                )}
                {step.label}
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className="w-4 h-px mx-1 flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        {!isInternalUser && currentStep < 4 && (
          <div className="flex justify-end mb-3 h-4">
            {autoSaved && (
              <span className="text-xs flex items-center gap-1" style={{ color: '#10B981' }}>
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        )}

        {saveError && (
          <p className="text-xs mb-3" style={{ color: '#F97316' }}>
            {saveError}
          </p>
        )}

        {currentStep === 1 && <CompanyInfoStep data={formData} onChange={handleFormChange} />}
        {currentStep === 2 && <SectorsStep data={formData} onChange={handleFormChange} />}
        {currentStep === 3 && <CapabilitiesStep data={formData} onChange={handleFormChange} />}
        {currentStep === 4 && (
          <DocumentsStep
            docs={docs}
            setDocs={() => onUpdate?.()}
            vendorId={vendorId}
            vendorName={formData.company_name || vendor?.company_name}
            vendor={vendor || formData}
            onSubmitSuccess={handleDocumentsSuccess}
          />
        )}
        {currentStep === 5 && (
          <ReviewStep
            vendor={vendor || formData}
            docs={docs}
            onReview={handleReview}
            isInternalUser={isInternalUser}
          />
        )}
        {currentStep === 6 && (
          <TierStep
            vendor={vendor || formData}
            onAssignTier={handleAssignTier}
            isInternalUser={isInternalUser}
          />
        )}
      </div>

      {!isInternalUser && (
        <div className="flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() =>
                currentStep <= 3 ? goToStep(currentStep - 1) : setCurrentStep((s) => s - 1)
              }
              className="text-sm px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {saving ? '...' : '← Back'}
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 && (
            <button
              type="button"
              disabled={!canContinue() || saving}
              onClick={() => goToStep(currentStep + 1)}
              className="text-sm px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                color: 'white',
                opacity: canContinue() && !saving ? 1 : 0.4,
              }}
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
