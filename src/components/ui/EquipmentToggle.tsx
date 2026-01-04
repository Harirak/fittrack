'use client';

import { EquipmentProfile } from '@/lib/db/schema';
import { Dumbbell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EQUIPMENT_LABELS } from '@/lib/constants';

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
  // weightMachines: Weight, // removed as not in keys
  // cableMachines: Cable,
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
        const Icon = equipmentIcons[key] || Dumbbell;
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
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/50',
              (disabled || isBodyweight) && 'cursor-default opacity-80' // Changed cursor-not-allowed to default for bodyweight since it's just "always on"
            )}
          >
            <div
              className={cn(
                'rounded-full p-3 transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {EQUIPMENT_LABELS[key]}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {equipmentDescriptions[key]}
              </div>
            </div>
            {isBodyweight && (
              <div className="absolute right-2 top-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                  <Check className="h-3 w-3" />
                </span>
              </div>
            )}
            {isSelected && !isBodyweight && (
              <div className="absolute right-2 top-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
