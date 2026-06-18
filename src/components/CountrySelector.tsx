"use client";

import { useState } from "react";
import { ChevronDown, Globe, Search } from "lucide-react";
import { COUNTRIES } from "@/data/countries";

interface CountrySelectorProps {
  selected: string;
  onSelect: (code: string) => void;
}

export default function CountrySelector({
  selected,
  onSelect,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find((c) => c.code === selected);

  const grouped = filtered.reduce<Record<string, typeof COUNTRIES>>(
    (acc, country) => {
      if (!acc[country.region]) acc[country.region] = [];
      acc[country.region].push(country);
      return acc;
    },
    {}
  );

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Globe size={16} className="inline mr-1.5 -mt-0.5" />
        Select Your Country
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-left hover:border-violet-400 transition-colors shadow-sm"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2.5">
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="font-medium text-gray-800">{selectedCountry.name}</span>
          </span>
        ) : (
          <span className="text-gray-400">Choose a country...</span>
        )}
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-56">
            {Object.entries(grouped).map(([region, countries]) => (
              <div key={region}>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                  {region}
                </p>
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onSelect(country.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50 transition-colors ${
                      selected === country.code ? "bg-violet-50" : ""
                    }`}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {country.name}
                    </span>
                    {selected === country.code && (
                      <span className="ml-auto text-violet-600 text-xs font-semibold">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
