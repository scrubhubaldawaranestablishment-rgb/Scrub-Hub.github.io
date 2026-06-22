import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import VendorOnboardingWizard from '@/components/vendor/VendorOnboardingWizard';
import VendorCompliancePortal from '@/components/vendor/VendorCompliancePortal';
import VendorPortalDashboard from '@/components/vendor/VendorPortalDashboard';
import PageHeader from '@/components/shared/PageHeader';
import { ClipboardList, LayoutDashboard, ShieldCheck, ChevronDown, PenSquare } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { saveVendorTab, loadVendorTab, loadVendorStep } from '@/lib/vendorDraftStorage';

export default function VendorPortal() {
  const { t } = useTranslation();
  const { lang } = useAppSettings();
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [allVendors, setAllVendors] = useState([]);
  const [docs, setDocs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null); // null = loading, then resolved after data loads
  const [onboardingStartStep, setOnboardingStartStep] = useState(null);

  const isInternalUser = ['admin', 'operations', 'vendor_success'].includes(user?.role);
  // Also treat default 'user' role as vendor if they have a vendor record
  const isVendorUser = user?.role === 'vendor' || user?.role === 'user';

  const load = async (u, selectedVendor) => {
    const me = u || user;
    if (!me) return;

    const internal = ['admin', 'operations', 'vendor_success'].includes(me.role);

    if (internal) {
      const vendors = await base44.entities.Vendor.list('-created_date', 100);
      setAllVendors(vendors);
      const v = selectedVendor !== undefined ? selectedVendor : (vendor || vendors[0] || null);
      setVendor(v);
      if (v?.id) {
        const [d, wos, tix] = await Promise.all([
          base44.entities.ComplianceDocument.filter({ vendor_id: v.id }),
          base44.entities.WorkOrder.filter({ vendor_name: v.company_name }, '-created_date', 20),
          base44.entities.Ticket.filter({ assigned_to: v.company_name }, '-created_date', 20),
        ]);
        setDocs(d); setWorkOrders(wos); setTickets(tix);
      }
    } else {
      // Vendor users — find by email
      const vendors = await base44.entities.Vendor.filter({ contact_email: me.email });
      const v = vendors[0] || null;
      setVendor(v);
      if (v?.id) {
        const [d, wos, tix] = await Promise.all([
          base44.entities.ComplianceDocument.filter({ vendor_id: v.id }),
          base44.entities.WorkOrder.filter({ vendor_name: v.company_name }, '-created_date', 20),
          base44.entities.Ticket.filter({ assigned_to: v.company_name }, '-created_date', 20),
        ]);
        setDocs(d); setWorkOrders(wos); setTickets(tix);
      }
    }
  };

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      load(u).finally(() => {
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const handleUpdate = () => load(user, vendor);

  const onboarded = vendor?.onboarding_complete;

  // Resolve default view once data is loaded — resume onboarding if incomplete
  useEffect(() => {
    if (loading || view !== null || !user) return;

    const internal = ['admin', 'operations', 'vendor_success'].includes(user.role);
    const savedTab = loadVendorTab(user.email);
    const hasIncompleteOnboarding = vendor && !vendor.onboarding_complete;

    if (internal) {
      setView(savedTab === 'onboarding' ? 'onboarding' : 'compliance');
      return;
    }

    if (hasIncompleteOnboarding) {
      const savedStep = loadVendorStep(user.email);
      if (savedStep) setOnboardingStartStep(savedStep);
      setView(savedTab === 'compliance' ? 'compliance' : 'onboarding');
      return;
    }

    setView(savedTab || 'dashboard');
  }, [loading, user, vendor, view]);

  if (loading || view === null) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const handleViewChange = (tab) => {
    setView(tab);
    if (user?.email) saveVendorTab(user.email, tab);
  };

  const handleGoToStep = (step) => {
    setOnboardingStartStep(step);
    handleViewChange('onboarding');
  };

  // 3 tabs for vendor users; internal users keep compliance + onboarding
  const tabs = isInternalUser
    ? [
        { key: 'compliance', label: t('Compliance Docs'), icon: ShieldCheck },
        { key: 'onboarding', label: t('Review Application'), icon: ClipboardList },
      ]
    : [
        { key: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
        { key: 'compliance', label: t('Compliance Docs'), icon: ShieldCheck },
        { key: 'onboarding', label: t('Edit Application'), icon: PenSquare },
      ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('Vendor Portal')}
        subtitle={isInternalUser
          ? t('Manage vendor onboarding, compliance documents, and tier assignment')
          : `${t('Welcome back')}, ${user?.full_name || t('Vendor')} — ${t('Upload and manage your compliance documents')}`}
        actions={
          <div className="flex items-center gap-3">
            {/* Internal: vendor selector */}
            {isInternalUser && allVendors.length > 0 && (
              <div className="relative">
                <select
                  value={vendor?.id || ''}
                  onChange={e => {
                    const v = allVendors.find(x => x.id === e.target.value) || null;
                    setVendor(v);
                    load(user, v);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-medium outline-none text-white"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(6,182,212,0.2)', minWidth: '180px' }}
                >
                  {allVendors.map(v => (
                    <option key={v.id} value={v.id} style={{ background: '#1e293b' }}>{v.company_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#06B6D4' }} />
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.12)' }}>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleViewChange(tab.key)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: view === tab.key ? 'rgba(6,182,212,0.15)' : 'transparent',
                      color: view === tab.key ? '#06B6D4' : '#64748b'
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

      {/* TAB: Dashboard (vendor users) */}
      {view === 'dashboard' && !isInternalUser && (
        <>
          {!vendor ? (
            <div className="glass-card p-6">
              <div className="max-w-md mx-auto text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}>
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Start Your Vendor Application</h3>
                <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                  Complete the 6-step onboarding process to become an approved NOSSCO business partner.
                </p>
                <button
                  onClick={() => handleViewChange('onboarding')}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
                  Begin Application →
                </button>
              </div>
            </div>
          ) : (
            <VendorPortalDashboard
              vendor={vendor}
              docs={docs}
              onGoToEditStep={handleGoToStep}
            />
          )}
        </>
      )}

      {/* TAB: Compliance Docs */}
      {view === 'compliance' && (
        <VendorCompliancePortal
          vendor={vendor}
          docs={docs}
          user={user}
          isInternalUser={isInternalUser}
          onUpdate={handleUpdate}
        />
      )}

      {/* TAB: Edit Application */}
      {view === 'onboarding' && (
        <div className="glass-card p-6">
          {!isInternalUser && vendor && !vendor.onboarding_complete && (
            <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-4"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div>
                <p className="text-sm font-semibold text-white">📝 Continue Your Application</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  You stopped at Step {vendor.onboarding_step || 1}. All your data is saved.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
                style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
                Step {vendor.onboarding_step || 1} of 6
              </span>
            </div>
          )}
          <VendorOnboardingWizard
            vendor={vendor}
            docs={docs}
            user={user}
            isInternalUser={isInternalUser}
            onUpdate={handleUpdate}
            startStep={onboardingStartStep}
          />
        </div>
      )}
    </div>
  );
}