import { CheckCircle2, X } from 'lucide-react';

export default function RFPSuccessModal({ refCode, emailSent, email, internal, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm glass-card p-8 text-center relative"
        style={{ border: '1px solid rgba(6,182,212,0.3)', boxShadow: '0 0 60px rgba(6,182,212,0.1)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: '#64748b' }} />
        </button>

        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          {internal ? 'RFP Registered Successfully' : 'RFP Submitted Successfully'}
        </h3>
        <p className="text-sm mb-5" style={{ color: '#64748b' }}>
          {internal
            ? 'The RFP has been registered for internal review. Matched vendors will see this opportunity on their dashboard.'
            : 'Your RFP has been received. Our team will review it within 1–3 business days.'}
        </p>

        {refCode && (
          <div className="rounded-xl px-4 py-3 mb-4" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <p className="text-xs mb-1" style={{ color: '#64748b' }}>Reference Number</p>
            <p className="text-base font-mono font-bold" style={{ color: '#06B6D4' }}>{refCode}</p>
          </div>
        )}

        {!internal && emailSent && email && (
          <p className="text-xs mb-5" style={{ color: '#94a3b8' }}>
            A confirmation email has been sent to <span style={{ color: '#06B6D4' }}>{email}</span>
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
          Close
        </button>
      </div>
    </div>
  );
}
