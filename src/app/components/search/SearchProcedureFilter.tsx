"use client";

import type { Surgery } from "./searchTypes";

interface SearchProcedureFilterProps {
  selected: string[];
  category: string;
  surgeries: Surgery[];
  onChange: (selected: string[]) => void;
}

export default function SearchProcedureFilter({ selected, category, surgeries, onChange }: SearchProcedureFilterProps) {
  const filtered = category ? surgeries.filter((surgery) => surgery.category === category) : surgeries;
  const groups = [...new Set(filtered.map((surgery) => surgery.group))];
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group}</p>
          <div className="space-y-1">
            {filtered.filter((surgery) => surgery.group === group).map((surgery) => (
              <label key={surgery.name} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(surgery.name)}
                    onChange={() => toggle(surgery.name)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{surgery.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
