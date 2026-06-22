import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SECTOR_SUBCATEGORIES = {
  "Cleaning": [
    "General Cleaning", "Deep Cleaning",
    "Window Cleaning", "Carpet & Upholstery Cleaning",
    "Post-Construction Cleaning", "Industrial Cleaning",
    "Sanitization & Disinfection", "Facade Cleaning"
  ],
  "Facility Management Coordination": [
    "Preventive Maintenance", "Corrective Maintenance",
    "HVAC Maintenance", "Electrical Maintenance",
    "Plumbing Maintenance", "Civil & Structural Maintenance",
    "Pest Control", "Landscaping & Gardening",
    "Security Services", "Helpdesk & FM Coordination"
  ],
  "Logistics & Drivers": [
    "Light Vehicle Drivers", "Heavy Vehicle Drivers",
    "Courier & Delivery", "Warehouse Logistics",
    "Transportation Management", "Last Mile Delivery",
    "Chauffeur Services", "Freight & Cargo"
  ],
  "Laundry": [
    "Hotel & Hospitality Laundry", "Industrial Laundry",
    "Uniform Laundry", "Dry Cleaning",
    "Linen Management", "Steam Pressing & Ironing",
    "Specialty Fabric Care"
  ],
  "Catering Coordination": [
    "Corporate Catering", "Event Catering",
    "Industrial & Camp Catering", "Cafeteria Management",
    "Hospitality Catering", "Food Truck Services",
    "Meal Preparation & Delivery", "Dietary & Nutrition Catering"
  ],
  "Basic Manpower": [
    "General Labor", "Skilled Labor",
    "Semi-Skilled Labor", "Housekeeping Staff",
    "Janitorial Staff", "Production Line Workers",
    "Warehouse Staff", "Event Staff & Ushers"
  ]
};

const ALL_SECTORS = Object.keys(SECTOR_SUBCATEGORIES);

function parseSubcategories(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

export default function OnboardingStep2({ data, onChange }) {
  // Own local state — source of truth for this step
  const [selectedSectors, setSelectedSectors] = useState(
    () => Array.isArray(data.sectors) ? data.sectors : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState(
    () => parseSubcategories(data.subcategories)
  );

  useEffect(() => {
    setSelectedSectors(Array.isArray(data.sectors) ? data.sectors : []);
    setSelectedSubcategories(parseSubcategories(data.subcategories));
  }, [data.id, data.sectors, data.subcategories]);

  // subcategories stored as JSON string in entity
  const notify = (sectors, subcategories) => {
    onChange({ ...data, sectors, subcategories: JSON.stringify(subcategories) });
  };

  const toggleSector = (sector) => {
    if (selectedSectors.includes(sector)) {
      // Uncheck — remove sector and clear its subcategories
      const newSectors = selectedSectors.filter(s => s !== sector);
      const newSubs = { ...selectedSubcategories };
      delete newSubs[sector];
      setSelectedSectors(newSectors);
      setSelectedSubcategories(newSubs);
      notify(newSectors, newSubs);
    } else {
      // Check — add sector, initialize empty subcategory array
      const newSectors = [...selectedSectors, sector];
      const newSubs = { ...selectedSubcategories, [sector]: [] };
      setSelectedSectors(newSectors);
      setSelectedSubcategories(newSubs);
      notify(newSectors, newSubs);
    }
  };

  const toggleSubcategory = (sector, sub) => {
    const current = selectedSubcategories[sector] || [];
    const updated = current.includes(sub)
      ? current.filter(x => x !== sub)
      : [...current, sub];
    const newSubs = { ...selectedSubcategories, [sector]: updated };
    setSelectedSubcategories(newSubs);
    notify(selectedSectors, newSubs);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#06B6D4' }}>
        Sector Selection
      </p>
      <p className="text-sm" style={{ color: '#94a3b8' }}>
        Select all sectors your company operates in, then choose your subcategories.
      </p>

      <div className="space-y-3 mt-4">
        {ALL_SECTORS.map(sector => {
          const isChecked = selectedSectors.includes(sector);
          const subCount = (selectedSubcategories[sector] || []).length;

          return (
            <div key={sector} className="rounded-xl overflow-hidden"
              style={{
                background: isChecked ? 'rgba(6,182,212,0.07)' : 'rgba(255,255,255,0.03)',
                border: isChecked ? '1px solid rgba(6,182,212,0.35)' : '1px solid rgba(255,255,255,0.07)',
              }}>

              {/* Sector header row */}
              <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => toggleSector(sector)}>
                {/* Custom checkbox */}
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isChecked ? '#06B6D4' : 'rgba(255,255,255,0.06)',
                    border: isChecked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  }}>
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <span className="flex-1 text-sm font-medium" style={{ color: isChecked ? '#e2e8f0' : '#64748b' }}>
                  {sector}
                  {isChecked && subCount > 0 && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(6,182,212,0.2)', color: '#06B6D4' }}>
                      {subCount} selected
                    </span>
                  )}
                </span>

                {isChecked && (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#06B6D4' }} />
                )}
              </div>

              {/* Subcategories — shown directly when sector is checked, no extra toggle needed */}
              {isChecked && (
                <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(6,182,212,0.12)' }}>
                  <p className="text-xs mb-3" style={{ color: '#64748b' }}>Select subcategories:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {SECTOR_SUBCATEGORIES[sector].map(sub => {
                      const isSubChecked = (selectedSubcategories[sector] || []).includes(sub);
                      return (
                        <label key={sub}
                          className="flex items-center gap-2 cursor-pointer"
                          style={{ color: isSubChecked ? '#e2e8f0' : '#94a3b8' }}
                          onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSubChecked}
                            onChange={() => toggleSubcategory(sector, sub)}
                            className="w-3.5 h-3.5 flex-shrink-0 accent-cyan-400"
                          />
                          <span className="text-xs">{sub}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSectors.length > 0 && (
        <p className="text-xs mt-2" style={{ color: '#06B6D4' }}>
          {selectedSectors.length} sector{selectedSectors.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}