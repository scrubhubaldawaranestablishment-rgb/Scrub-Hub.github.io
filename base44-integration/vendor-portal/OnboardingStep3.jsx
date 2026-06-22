import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

const CITY_DISTRICTS = {
  "Riyadh": [
    "Al Olaya","Al Malaz","Al Murabbah","Al Naseem","Al Rawdah","Al Sulaimaniyah",
    "Al Nakheel","Al Rabwah","Al Wurud","Al Aziziyah","Al Sahafah","Al Qirawan",
    "Al Yasmin","Al Narjis","Al Masif","Al Mohammadiyah","Al Aqiq","Al Hamra",
    "Al Shohada","Al Batha"
  ],
  "Jeddah": [
    "Al Balad","Al Salamah","Al Rawdah","Al Zahraa","Al Hamra","Al Corniche",
    "Al Shati","Al Faisaliyah","Al Khalidiyah","Al Aziziyah","Al Rehab",
    "Al Marwah","Al Naeem","Al Safa","Al Andalus","Al Bawadi","Al Naseem",
    "Al Rowais","Al Hindawiyah","Al Basateen"
  ],
  "Makkah": [
    "Al Haram","Al Aziziyah","Al Shoqiyah","Al Massfalah","Al Kakiyah",
    "Al Rusayfah","Al Zaidi","Al Nuzha","Al Awali","Al Adl","Al Khalidiyah",
    "Al Tayseer","Al Buhayrat","Al Shubaikah","Al Umrah Al Jadidah",
    "Al Khadra","Al Dhiyafah","Al Misfalah","Kudai","Al Utaibiyah"
  ],
  "Dammam": [
    "Al Faisaliyah","Al Shatea","Al Badiyah","Al Mazroiyah","Al Nuzha",
    "Al Jawharah","Al Muraikabat","Al Fursan","Al Anud","Al Qadsiyah",
    "Al Hamra","Al Nahdah","Al Amamrah","Al Khalidiyah","Al Badi",
    "Al Rakah Al Janubiyah","Al Rakah Al Shamaliyah","Al Taawun","Al Iskan","Al Aziziyah"
  ]
};

const EQUIPMENT_CATEGORIES = {
  "Cleaning Equipment": [
    "Industrial Floor Scrubbers","Pressure Washers","Steam Cleaners",
    "Vacuum Cleaners (Industrial)","Window Cleaning Equipment",
    "Carpet Cleaning Machines","Sanitization Sprayers","Scaffolding Equipment"
  ],
  "Facility Equipment": [
    "HVAC Tools & Equipment","Electrical Testing Equipment","Plumbing Tools",
    "Power Tools Set","Safety & PPE Equipment","Ladders & Access Equipment",
    "Generators","Welding Equipment"
  ],
  "Logistics Equipment": [
    "Light Vehicles (Cars/Vans)","Heavy Vehicles (Trucks)","Forklifts",
    "Pallet Jacks","GPS Tracking Systems","Refrigerated Vehicles",
    "Motorcycles/Bikes","Cranes & Lifting Equipment"
  ],
  "Catering Equipment": [
    "Commercial Ovens","Food Warmers","Refrigeration Units",
    "Food Preparation Equipment","Serving Equipment",
    "Beverage Dispensers","Outdoor Catering Equipment"
  ],
  "Laundry Equipment": [
    "Industrial Washing Machines","Commercial Dryers","Steam Press Machines",
    "Dry Cleaning Machines","Ironing Equipment","Folding Machines","Linen Carts"
  ]
};

const TERMS_TEXT = `NOSSCO VENDOR TERMS & CONDITIONS

1. VENDOR OBLIGATIONS
   The Vendor agrees to provide services as per NOSSCO standards and requirements at all times.

2. COMPLIANCE REQUIREMENTS
   All vendors must maintain valid licenses, certifications, and compliance documents throughout the contract period.

3. SERVICE STANDARDS
   Vendors must adhere to agreed SLA timelines and quality standards for all service requests.

4. CONFIDENTIALITY
   All client and project information must be kept strictly confidential.

5. PAYMENT TERMS
   Payments will be processed within 30 days of approved work order completion.

6. TERMINATION
   NOSSCO reserves the right to terminate vendor agreements for non-compliance or poor performance.

7. GOVERNING LAW
   This agreement is governed by the laws of the Kingdom of Saudi Arabia.`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseJSON(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return null; }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none";
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)' };

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
    <button type="button" onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? '#06B6D4' : 'rgba(255,255,255,0.1)' }}>
      <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  </div>
);

// ── Cities Selector ───────────────────────────────────────────────────────────

function CitiesSelector({ selectedCities, selectedDistricts, onLocationsChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const ALL_CITIES = Object.keys(CITY_DISTRICTS);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const toggleCity = (city) => {
    if (selectedCities.includes(city)) {
      const newCities = selectedCities.filter(c => c !== city);
      const newDistricts = { ...selectedDistricts };
      delete newDistricts[city];
      onLocationsChange(newCities, newDistricts);
    } else {
      onLocationsChange(
        [...selectedCities, city],
        { ...selectedDistricts, [city]: selectedDistricts[city] || [] },
      );
    }
  };

  const toggleDistrict = (city, district) => {
    const current = selectedDistricts[city] || [];
    const updated = current.includes(district)
      ? current.filter(d => d !== district)
      : [...current, district];
    onLocationsChange(selectedCities, { ...selectedDistricts, [city]: updated });
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* City multi-select dropdown */}
      <div className="relative">
        <button type="button" onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-white"
          style={inputStyle}>
          <span style={{ color: selectedCities.length ? '#e2e8f0' : '#475569' }}>
            {selectedCities.length ? selectedCities.join(', ') : 'Select cities…'}
          </span>
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#64748b' }} />
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden shadow-xl"
            style={{ background: '#1e293b', border: '1px solid rgba(6,182,212,0.25)' }}>
            {ALL_CITIES.map(city => (
              <div key={city}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors"
                style={{ color: selectedCities.includes(city) ? '#06B6D4' : '#cbd5e1' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => toggleCity(city)}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: selectedCities.includes(city) ? '#06B6D4' : 'rgba(255,255,255,0.06)',
                    border: selectedCities.includes(city) ? 'none' : '1px solid rgba(255,255,255,0.15)'
                  }}>
                  {selectedCities.includes(city) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {city}
              </div>
            ))}
            <div className="px-4 py-2 border-t" style={{ borderColor: 'rgba(6,182,212,0.1)' }}>
              <button type="button" onClick={() => setOpen(false)}
                className="text-xs w-full text-center" style={{ color: '#64748b' }}>Done</button>
            </div>
          </div>
        )}
      </div>

      {/* Districts per selected city */}
      {selectedCities.map(city => (
        <div key={city} className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
            <span className="text-xs font-semibold" style={{ color: '#06B6D4' }}>{city} Districts</span>
            {(selectedDistricts[city] || []).length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(6,182,212,0.2)', color: '#06B6D4' }}>
                {(selectedDistricts[city] || []).length} selected
              </span>
            )}
          </div>
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
            {CITY_DISTRICTS[city].map(district => {
              const checked = (selectedDistricts[city] || []).includes(district);
              return (
                <label key={district} className="flex items-center gap-2 cursor-pointer"
                  style={{ color: checked ? '#e2e8f0' : '#94a3b8' }}>
                  <input type="checkbox" checked={checked}
                    onChange={() => toggleDistrict(city, district)}
                    className="w-3.5 h-3.5 flex-shrink-0 accent-cyan-400" />
                  <span className="text-xs">{district}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Equipment Selector ────────────────────────────────────────────────────────

function EquipmentSelector({ selectedEquipment, onEquipmentChange }) {
  const [openCategory, setOpenCategory] = useState(null);
  const ALL_CATS = Object.keys(EQUIPMENT_CATEGORIES);

  const toggleItem = (item) => {
    const updated = selectedEquipment.includes(item)
      ? selectedEquipment.filter(e => e !== item)
      : [...selectedEquipment, item];
    onEquipmentChange(updated);
  };

  const removeItem = (item) => onEquipmentChange(selectedEquipment.filter(e => e !== item));

  return (
    <div className="space-y-2">
      {/* Category dropdown trigger */}
      <div className="flex flex-wrap gap-1.5 mb-1">
        {ALL_CATS.map(cat => {
          const count = EQUIPMENT_CATEGORIES[cat].filter(i => selectedEquipment.includes(i)).length;
          return (
            <button key={cat} type="button"
              onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: openCategory === cat ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                color: openCategory === cat ? '#06B6D4' : '#64748b',
                border: openCategory === cat ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.06)'
              }}>
              {cat.replace(' Equipment', '')}
              {count > 0 && <span className="ml-1.5 font-bold" style={{ color: '#06B6D4' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Active category checkboxes */}
      {openCategory && (
        <div className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2"
          style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}>
          {EQUIPMENT_CATEGORIES[openCategory].map(item => {
            const checked = selectedEquipment.includes(item);
            return (
              <label key={item} className="flex items-center gap-2 cursor-pointer"
                style={{ color: checked ? '#e2e8f0' : '#94a3b8' }}>
                <input type="checkbox" checked={checked} onChange={() => toggleItem(item)}
                  className="w-3.5 h-3.5 flex-shrink-0 accent-cyan-400" />
                <span className="text-xs">{item}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Selected tags */}
      {selectedEquipment.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedEquipment.map(item => (
            <span key={item} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}>
              {item}
              <button type="button" onClick={() => removeItem(item)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OnboardingStep3({ data, onChange }) {
  const selectedCities = parseJSON(data.cities_served) || [];
  const selectedDistricts = parseJSON(data.districts_served) || {};
  const selectedEquipment = parseJSON(data.equipment_list) || [];

  const patch = (updates) => {
    if (typeof onChange !== 'function') return;
    onChange((prev) => ({ ...prev, ...updates }));
  };

  const set = (k, v) => patch({ [k]: v });

  const updateLocations = (cities, districts) => {
    patch({
      cities_served: JSON.stringify(cities),
      districts_served: JSON.stringify(districts),
    });
  };

  const handleEquipmentChange = (items) => {
    patch({ equipment_list: JSON.stringify(items) });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#06B6D4' }}>
        Operational Capability
      </p>

      {/* Basic numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Number of Employees">
          <input type="number" min="0" className={inputCls} style={inputStyle}
            value={data.num_employees || ''} onChange={e => set('num_employees', Number(e.target.value))} placeholder="50" />
        </Field>
        <Field label="Fleet Size (vehicles)">
          <input type="number" min="0" className={inputCls} style={inputStyle}
            value={data.fleet_size || ''} onChange={e => set('fleet_size', Number(e.target.value))} placeholder="10" />
        </Field>
        <Field label="Service Capacity">
          <input className={inputCls} style={inputStyle}
            value={data.service_capacity || ''} onChange={e => set('service_capacity', e.target.value)} placeholder="Up to 50 concurrent projects" />
        </Field>
        <Field label="Average Response Time">
          <input className={inputCls} style={inputStyle}
            value={data.response_time || ''} onChange={e => set('response_time', e.target.value)} placeholder="2 hours" />
        </Field>
      </div>

      {/* Cities + Districts */}
      <Field label="Cities Served">
        <CitiesSelector
          selectedCities={selectedCities}
          selectedDistricts={selectedDistricts}
          onLocationsChange={updateLocations}
        />
      </Field>

      {/* Equipment */}
      <Field label="Equipment List">
        <EquipmentSelector
          selectedEquipment={selectedEquipment}
          onEquipmentChange={handleEquipmentChange}
        />
      </Field>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Toggle label="Emergency Support Available" value={!!data.emergency_support} onChange={v => set('emergency_support', v)} />
        <Toggle label="24/7 Support Available" value={!!data.support_247} onChange={v => set('support_247', v)} />
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#06B6D4' }}>
          Terms &amp; Conditions
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
          <textarea
            readOnly
            value={TERMS_TEXT}
            rows={12}
            className="w-full px-4 py-3 text-xs resize-none outline-none leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontFamily: 'monospace' }}
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!data.terms_accepted}
            onChange={e => set('terms_accepted', e.target.checked)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 accent-cyan-400"
          />
          <span className="text-sm" style={{ color: data.terms_accepted ? '#e2e8f0' : '#94a3b8' }}>
            I have read and agree to NOSSCO Terms &amp; Conditions
          </span>
        </label>
      </div>
    </div>
  );
}