'use client';

import { EquipmentProfile } from '@/lib/db/schema';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EQUIPMENT_TYPES, EQUIPMENT_LABELS } from '@/lib/constants';

interface EquipmentToggleProps {
  profile: EquipmentProfile;
  onChange: (equipment: keyof EquipmentProfile, value: boolean) => void;
  disabled?: boolean;
}

const equipmentIcons: Record<string, React.ElementType> = {
  dumbbells: Dumbbell,
  barbells: Dumbbell,
  kettlebells: Dumbbell,
  bodyweight: Dumbbell,
};

const equipmentDescriptions: Record<string, string> = {
  dumbbells: 'Adjustable weight hand weights',
  barbells: 'Long bar with weight plates',
  kettlebells: 'Cast iron weights with handles',
  bodyweight: 'No equipment needed',
};

export function EquipmentToggle({
  profile,
  onChange,
  disabled = false,
}: EquipmentToggleProps) {
  const equipmentKeys: (keyof EquipmentProfile)[] = [
    'dumbbells',
    'barbells',
    'kettlebells',
    'bodyweight',
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {equipmentKeys.map((key) => {
        const Icon = equipmentIcons[key];
        const isSelected = profile[key];
        const isBodyweight = key === 'bodyweight';

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key, !isSelected)}
            disabled={disabled || isBodyweight}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
              'min-h-[120px] justify-center',
              'hover:scale-105 active:scale-95',
              isSelected
                ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700',
              (disabled || isBodyweight) && 'cursor-not-allowed opacity-60'
            )}
          >
            <div
              className={cn(
                'rounded-full p-3 transition-colors',
                isSelected
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-white' : 'text-zinc-400'
                )}
              >
                {EQUIPMENT_LABELS[key]}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {equipmentDescriptions[key]}
              </div>
            </div>
            {isBodyweight && (
              <div className="absolute right-2 top-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                  ✓
                </span>
              </div>
            )}
            {isSelected && !isBodyweight && (
              <div className="absolute right-2 top-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                  ✓
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
