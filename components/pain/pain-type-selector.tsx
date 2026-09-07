'use client';

import React from 'react';
import { PAIN_TYPES, PainTypeKey } from '@/lib/types/pain';
import { Check } from 'lucide-react';

interface PainTypeSelectorProps {
  selectedKeys: PainTypeKey[];
  onChange: (keys: PainTypeKey[]) => void;
  disabled?: boolean;
}

export function PainTypeSelector({
  selectedKeys,
  onChange,
  disabled = false,
}: PainTypeSelectorProps) {
  const toggleType = (key: PainTypeKey) => {
    if (disabled) return;
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold text-muted-fg px-1">
        <span>Select pain sensations (optional):</span>
        <span className="text-primary font-bold text-[11px]">
          {selectedKeys.length} selected
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PAIN_TYPES.map((t) => {
          const isSelected = selectedKeys.includes(t.key);
          return (
            <button
              type="button"
              key={t.key}
              onClick={() => toggleType(t.key)}
              disabled={disabled}
              className={`min-h-[44px] py-2.5 px-2 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-primary text-primary-fg border-primary shadow-soft font-bold scale-[1.02]'
                  : 'bg-muted/40 hover:bg-muted/70 border-border text-foreground'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5" />}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
