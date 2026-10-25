import type { TemperatureUnit } from '../api/weather';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

const OPTIONS: { value: TemperatureUnit; label: string }[] = [
  { value: 'celsius', label: '°C' },
  { value: 'fahrenheit', label: '°F' },
];

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="unit-toggle" role="group" aria-label="Temperature unit">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={unit === option.value}
          className={unit === option.value ? 'active' : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
