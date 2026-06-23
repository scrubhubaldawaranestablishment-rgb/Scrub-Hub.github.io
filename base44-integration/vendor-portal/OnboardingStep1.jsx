import CitiesCoveredSelector from '@/components/vendor/CitiesCoveredSelector';
import { useTranslation } from '@/lib/useTranslation';
import {
  SA_PHONE_PREFIX,
  CR_DIGIT_LENGTH,
  VAT_DIGIT_LENGTH,
  digitsOnly,
  digitFieldStyle,
  isDigitFieldValid,
  normalizeSaPhone,
  normalizeVendorFormFields,
  phoneLocalPart,
} from '@/lib/vendorFormUtils';

const Field = ({ label, children, required, error, isRTL }) => (
  <div>
    <label
      className={`block text-xs font-medium mb-1.5 ${isRTL ? 'text-right' : ''}`}
      style={{ color: '#94a3b8' }}
    >
      {label}
      {required && <span className="text-red-400 mx-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className={`text-xs mt-1 text-red-400 ${isRTL ? 'text-right' : ''}`}>{error}</p>
    )}
  </div>
);

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm text-white outline-none';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };

function PhoneInput({ value, onChange, placeholder, isRTL }) {
  const local = phoneLocalPart(value);
  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`} dir="ltr">
      <span
        className="px-3 py-2 text-sm text-white flex items-center rounded-s-lg"
        style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}
      >
        +966
      </span>
      <input
        className={`${inputCls} rounded-s-none rounded-e-lg flex-1`}
        style={inputStyle}
        value={local}
        onChange={(e) => onChange(SA_PHONE_PREFIX + digitsOnly(e.target.value, 9))}
        placeholder={placeholder}
        inputMode="numeric"
      />
    </div>
  );
}

export default function OnboardingStep1({ data, onChange }) {
  const { t, lang, isRTL } = useTranslation();
  const fields = normalizeVendorFormFields(data);
  const set = (k, v) => onChange(normalizeVendorFormFields({ ...fields, [k]: v }));

  const crDigits = digitsOnly(fields.cr_number, CR_DIGIT_LENGTH);
  const vatDigits = digitsOnly(fields.vat_number, VAT_DIGIT_LENGTH);
  const crInvalid = crDigits.length > 0 && crDigits.length !== CR_DIGIT_LENGTH;
  const vatInvalid = vatDigits.length > 0 && vatDigits.length !== VAT_DIGIT_LENGTH;
  const crError = t('CR must be exactly 10 digits');
  const vatError = t('VAT must be exactly 15 digits');

  const phoneValue = normalizeSaPhone(fields.phone);
  const whatsappValue = normalizeSaPhone(fields.whatsapp);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isRTL ? 'text-right' : ''}`}
        style={{ color: '#06B6D4' }}
      >
        {t('Basic Company Information')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t('Company Name')} required isRTL={isRTL}>
          <input
            className={inputCls}
            style={inputStyle}
            value={fields.company_name || ''}
            onChange={(e) => set('company_name', e.target.value)}
            placeholder="ACME Services Co."
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </Field>
        <Field label={t('CR Number')} error={crInvalid ? crError : null} isRTL={isRTL}>
          <input
            className={inputCls}
            style={digitFieldStyle(crDigits, CR_DIGIT_LENGTH)}
            value={crDigits}
            onChange={(e) => set('cr_number', digitsOnly(e.target.value, CR_DIGIT_LENGTH))}
            placeholder="1234567890"
            inputMode="numeric"
            maxLength={CR_DIGIT_LENGTH}
            dir="ltr"
          />
        </Field>
        <Field label={t('VAT Number')} error={vatInvalid ? vatError : null} isRTL={isRTL}>
          <input
            className={inputCls}
            style={digitFieldStyle(vatDigits, VAT_DIGIT_LENGTH)}
            value={vatDigits}
            onChange={(e) => set('vat_number', digitsOnly(e.target.value, VAT_DIGIT_LENGTH))}
            placeholder="300000000000003"
            inputMode="numeric"
            maxLength={VAT_DIGIT_LENGTH}
            dir="ltr"
          />
        </Field>
        <Field label={t('Website')} isRTL={isRTL}>
          <input
            className={inputCls}
            style={inputStyle}
            value={fields.website || ''}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://example.com"
            dir="ltr"
          />
        </Field>
        <Field label={t('Contact Person')} required isRTL={isRTL}>
          <input
            className={inputCls}
            style={inputStyle}
            value={fields.contact_person || ''}
            onChange={(e) => set('contact_person', e.target.value)}
            placeholder="Ahmed Al-Rashid"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </Field>
        <Field label={t('Email')} required isRTL={isRTL}>
          <input
            type="email"
            className={inputCls}
            style={inputStyle}
            value={fields.contact_email || ''}
            onChange={(e) => set('contact_email', e.target.value)}
            placeholder="contact@company.com"
            dir="ltr"
          />
        </Field>
        <Field label={t('Phone')} isRTL={isRTL}>
          <PhoneInput
            value={phoneValue}
            onChange={(v) => set('phone', v)}
            placeholder="5x xxx xxxx"
            isRTL={isRTL}
          />
        </Field>
        <Field label={t('WhatsApp')} isRTL={isRTL}>
          <PhoneInput
            value={whatsappValue}
            onChange={(v) => set('whatsapp', v)}
            placeholder="5x xxx xxxx"
            isRTL={isRTL}
          />
        </Field>
        <Field label={t('Cities Covered')} isRTL={isRTL}>
          <CitiesCoveredSelector
            value={(() => {
              try {
                return typeof fields.cities_covered === 'string'
                  ? JSON.parse(fields.cities_covered)
                  : fields.cities_covered;
              } catch {
                return fields.cities_covered;
              }
            })()}
            onChange={(v) => set('cities_covered', typeof v === 'string' ? v : JSON.stringify(v))}
          />
        </Field>
        <Field label={t('Years in Operation')} isRTL={isRTL}>
          <input
            type="number"
            min="0"
            className={inputCls}
            style={inputStyle}
            value={fields.years_in_operation ?? ''}
            onChange={(e) =>
              set(
                'years_in_operation',
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            placeholder="5"
            dir="ltr"
          />
        </Field>
      </div>
    </div>
  );
}

export function isStep1Valid(data, userEmail) {
  const fields = normalizeVendorFormFields(data);
  const cr = digitsOnly(fields.cr_number, CR_DIGIT_LENGTH);
  const vat = digitsOnly(fields.vat_number, VAT_DIGIT_LENGTH);
  return !!(
    fields.company_name &&
    fields.contact_person &&
    (fields.contact_email || userEmail) &&
    isDigitFieldValid(cr, CR_DIGIT_LENGTH) &&
    isDigitFieldValid(vat, VAT_DIGIT_LENGTH)
  );
}
