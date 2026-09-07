'use client';

import React from 'react';
import { PAIN_LOCATIONS, PainLocationKey } from '@/lib/types/pain';
import { Check } from 'lucide-react';

interface PainLocationSelectorProps {
  selectedKeys: PainLocationKey[];
  onChange: (keys: PainLocationKey[]) => void;
  disabled?: boolean;
}

export function PainLocationSelector({
  selectedKeys,
  onChange,
  disabled = false,
}: PainLocationSelectorProps) {
  const toggleLocation = (key: PainLocationKey) => {
    if (disabled) return;
    if (selectedKeys.includes(key)) {
      // Don't deselect if it's the last remaining item
      if (selectedKeys.length === 1) return;
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold text-muted-fg px-1">
        <span>Select one or multiple body areas:</span>
        <span className="text-primary font-bold text-[11px]">
          {selectedKeys.length} selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
        {PAIN_LOCATIONS.map((loc) => {
          const isSelected = selectedKeys.includes(loc.key);
          return (
            <button
              type="button"
              key={loc.key}
              onClick={() => toggleLocation(loc.key)}
              disabled={disabled}
              className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-lunara-rose/30 border-lunara-rose text-lunara-plum font-bold shadow-soft ring-1 ring-primary/40'
                  : 'bg-muted/40 hover:bg-muted/70 border-border text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{loc.iconEmoji}</span>
                <span>{loc.label}</span>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
