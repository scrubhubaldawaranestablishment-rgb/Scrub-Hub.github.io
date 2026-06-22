/**
 * Vendor Portal page — persistence-fixed version.
 *
 * Apply in Base44: replace pages/VendorPortal.jsx
 *
 * Fixes:
 * - Resumes "Edit Application" tab after refresh when onboarding is incomplete
 * - Remembers last active tab in sessionStorage
 * - Re-fetches vendor record on mount so saved data is always loaded from server
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, FileText, ClipboardList, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useT } from '@/lib/useT';
import PageHeader from '@/components/shared/PageHeader';
import VendorDashboard from '@/components/vendor/VendorDashboard';
import VendorCompliancePortal from '@/components/vendor/VendorCompliancePortal';
import VendorOnboardingWizard from '@/components/vendor/VendorOnboardingWizard';
import {
  saveVendorTab,
  loadVendorTab,
  loadVendorStep,
} from '@/lib/vendorDraftStorage';

const INTERNAL_ROLES = ['admin', 'operations', 'vendor_success'];

export default function VendorPortal() {
  const { t } = useT();

  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [allVendors, setAllVendors] = useState([]);
  const [docs, setDocs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [wizardStartStep, setWizardStartStep] = useState(null);

  const isInternalUser = INTERNAL_ROLES.includes(user?.role);

  const loadVendorRelated = useCallback(async (currentUser, selectedVendor) => {
    const u = currentUser || user;
    if (!u) return;

    if (INTERNAL_ROLES.includes(u.role)) {
      const vendors = await base44.entities.Vendor.list('-created_date', 100);
      setAllVendors(vendors);
      const active = selectedVendor !== undefined ? selectedVendor : vendor || vendors[0] || null;
      setVendor(active);

      if (active?.id) {
        const [docList, woList, ticketList] = await Promise.all([
          base44.entities.ComplianceDocument.filter({ vendor_id: active.id }),
          base44.entities.WorkOrder.filter({ vendor_name: active.company_name }, '-created_date', 20),
          base44.entities.Ticket.filter({ assigned_to: active.company_name }, '-created_date', 20),
        ]);
        setDocs(docList);
        setWorkOrders(woList);
        setTickets(ticketList);
      }
    } else {
      const found =
        (await base44.entities.Vendor.filter({ contact_email: u.email }))[0] || null;
      setVendor(found);

      if (found?.id) {
        const [docList, woList, ticketList] = await Promise.all([
          base44.entities.ComplianceDocument.filter({ vendor_id: found.id }),
          base44.entities.WorkOrder.filter({ vendor_name: found.company_name }, '-created_date', 20),
          base44.entities.Ticket.filter({ assigned_to: found.company_name }, '-created_date', 20),
        ]);
        setDocs(docList);
        setWorkOrders(woList);
        setTickets(ticketList);
      } else {
        setDocs([]);
        setWorkOrders([]);
        setTickets([]);
      }
    }
  }, [user, vendor]);

  useEffect(() => {
    base44.auth
      .me()
      .then((me) => {
        setUser(me);
        return loadVendorRelated(me);
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => loadVendorRelated(user, vendor);

  // Restore tab after data loads — resume onboarding if incomplete
  useEffect(() => {
    if (loading || activeTab !== null || !user) return;

    const savedTab = loadVendorTab(user.email);
    const hasIncompleteOnboarding = vendor && !vendor.onboarding_complete;

    if (isInternalUser) {
      setActiveTab(savedTab === 'onboarding' ? 'onboarding' : 'compliance');
      return;
    }

    if (hasIncompleteOnboarding) {
      const savedStep = loadVendorStep(user.email);
      if (savedStep) setWizardStartStep(savedStep);
      setActiveTab(savedTab === 'compliance' ? 'compliance' : 'onboarding');
      return;
    }

    setActiveTab(savedTab || 'dashboard');
  }, [loading, user, vendor, isInternalUser, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (user?.email) saveVendorTab(user.email, tab);
  };

  const handleGoToEditStep = (step) => {
    setWizardStartStep(step);
    handleTabChange('onboarding');
  };

  const tabs = isInternalUser
    ? [
        { key: 'compliance', label: t('Compliance Docs'), icon: FileText },
        { key: 'onboarding', label: t('Review Application'), icon: ClipboardList },
      ]
    : [
        { key: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
        { key: 'compliance', label: t('Compliance Docs'), icon: FileText },
        { key: 'onboarding', label: t('Edit Application'), icon: ClipboardList },
      ];

  if (loading || activeTab === null) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('Vendor Portal')}
        subtitle={
          isInternalUser
            ? t('Manage vendor onboarding, compliance documents, and tier assignment')
            : `${t('Welcome back')}, ${user?.full_name || t('Vendor')} — ${t('Upload and manage your compliance documents')}`
        }
        actions={
          <div className="flex items-center gap-3">
            {isInternalUser && allVendors.length > 0 && (
              <div className="relative">
                <select
                  value={vendor?.id || ''}
                  onChange={(e) => {
                    const selected = allVendors.find((v) => v.id === e.target.value) || null;
                    setVendor(selected);
                    loadVendorRelated(user, selected);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-medium outline-none text-white"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(6,182,212,0.2)',
                    minWidth: '180px',
                  }}
                >
                  {allVendors.map((v) => (
                    <option key={v.id} value={v.id} style={{ background: '#1e293b' }}>
                      {v.company_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: '#06B6D4' }}
                />
              </div>
            )}

            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(6,182,212,0.12)',
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: activeTab === tab.key ? 'rgba(6,182,212,0.15)' : 'transparent',
                      color: activeTab === tab.key ? '#06B6D4' : '#64748b',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        }
      />

      {activeTab === 'dashboard' && !isInternalUser && (
        vendor ? (
          <VendorDashboard vendor={vendor} docs={docs} onGoToEditStep={handleGoToEditStep} />
        ) : (
          <div className="glass-card p-6">
            <div className="max-w-md mx-auto text-center mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                  boxShadow: '0 0 24px rgba(6,182,212,0.3)',
                }}
              >
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('Start Your Vendor Application')}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                {t('Complete the 6-step onboarding process to become an approved NOSSCO business partner.')}
              </p>
              <button
                onClick={() => handleTabChange('onboarding')}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                  color: 'white',
                }}
              >
                {t('Begin Application →')}
              </button>
            </div>
          </div>
        )
      )}

      {activeTab === 'compliance' && (
        <VendorCompliancePortal
          vendor={vendor}
          docs={docs}
          user={user}
          isInternalUser={isInternalUser}
          onUpdate={refresh}
        />
      )}

      {activeTab === 'onboarding' && (
        <div className="glass-card p-6">
          {!isInternalUser && vendor && !vendor.onboarding_complete && (
            <div
              className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-4"
              style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  📝 {t('Continue Your Application')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  {t('You stopped at step. All your data is saved.', {
                    step: vendor.onboarding_step || 1,
                  })}
                </p>
              </div>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
                style={{
                  background: 'rgba(6,182,212,0.12)',
                  color: '#06B6D4',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                {t('Step of 6', { step: vendor.onboarding_step || 1 })}
              </span>
            </div>
          )}

          <VendorOnboardingWizard
            vendor={vendor}
            docs={docs}
            user={user}
            isInternalUser={isInternalUser}
            onUpdate={refresh}
            startStep={wizardStartStep}
          />
        </div>
      )}
    </div>
  );
}
