/**
 * Patch for Sectors step — add to your existing SectorsStep component.
 *
 * Problem: sectors/subcategories local state is only initialized once on mount.
 * After a page refresh, when vendor data loads from the server, the step shows empty.
 *
 * Add this useEffect inside your SectorsStep component:
 */

import { useEffect, useState } from 'react';

// Example helper — use your existing parseSubcategories if you have one
function parseSubcategories(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function useSyncSectorsFromData(data) {
  const [sectors, setSectors] = useState(() =>
    Array.isArray(data.sectors) ? data.sectors : []
  );
  const [subcategories, setSubcategories] = useState(() =>
    parseSubcategories(data.subcategories)
  );

  useEffect(() => {
    setSectors(Array.isArray(data.sectors) ? data.sectors : []);
    setSubcategories(parseSubcategories(data.subcategories));
  }, [data.id, data.sectors, data.subcategories]);

  return [sectors, setSectors, subcategories, setSubcategories];
}

/**
 * Patch for Capabilities step — add similar sync for cities_served, districts_served, equipment_list:
 */

function parseJsonField(raw) {
  if (!raw) return Array.isArray(raw) ? [] : {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return Array.isArray(raw) ? [] : {};
  }
}

export function useSyncCapabilitiesFromData(data) {
  const [citiesServed, setCitiesServed] = useState(() => parseJsonField(data.cities_served));
  const [districtsServed, setDistrictsServed] = useState(() => parseJsonField(data.districts_served));
  const [equipmentList, setEquipmentList] = useState(() => parseJsonField(data.equipment_list));

  useEffect(() => {
    setCitiesServed(parseJsonField(data.cities_served));
    setDistrictsServed(parseJsonField(data.districts_served));
    setEquipmentList(parseJsonField(data.equipment_list));
  }, [data.id, data.cities_served, data.districts_served, data.equipment_list]);

  return { citiesServed, setCitiesServed, districtsServed, setDistrictsServed, equipmentList, setEquipmentList };
}
