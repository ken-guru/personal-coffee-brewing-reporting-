import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, Fragment } from 'react';
import { useFormDefaults } from '../../hooks/useFormDefaults';
import { BrewingEntry, GrindCoarseness, BrewingMethod, WaterSource } from '../../types/brewing';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { StarRating } from '../ui/StarRating';
import { GuestRatings } from './GuestRatings';
import { cn } from '../../lib/utils';
import { Check, Minus, Plus } from 'lucide-react';
import {
  PourOverIcon,
  FrenchPressIcon,
  AeroPressIcon,
  AeroPressGoIcon,
  KalitaIcon,
  SiemensDripIcon,
  EspressoIcon,
  MokaPotIcon,
  ColdBrewIcon,
  DripIcon,
  OtherBrewIcon,
  TapWaterIcon,
  FilteredTapIcon,
  BottledStillIcon,
  BottledSparklingIcon,
  SpringWaterIcon,
  OtherWaterIcon,
} from './BrewingMethodIcons';

const brewSchema = z.object({
  coffeeProducer: z.string().min(1, 'Coffee producer is required'),
  countryOfOrigin: z.string().min(1, 'Country of origin is required'),
  coffeeVariety: z.array(z.string()).optional(),
  grindCoarseness: z.enum(['extra-fine', 'fine', 'medium-fine', 'medium', 'medium-coarse', 'coarse', 'extra-coarse'] as const),
  grindEquipment: z.string().min(1, 'Grind equipment is required'),
  brewingMethod: z.enum(['pour-over', 'french-press', 'aeropress', 'aeropress-go', 'kalita', 'siemens-drip', 'espresso', 'moka-pot', 'cold-brew', 'drip', 'other'] as const),
  brewingMethodCustom: z.string().optional(),
  gramsOfCoffee: z.coerce.number().min(1, 'Must be at least 1g').max(1000, 'Max 1000g'),
  millilitersOfWater: z.coerce.number().min(1, 'Must be at least 1ml').max(10000, 'Max 10000ml'),
  waterSource: z.enum(['tap', 'filtered-tap', 'bottled-still', 'bottled-sparkling', 'spring', 'other'] as const),
  numberOfPeople: z.coerce.number().min(1, 'At least 1 person').max(100, 'Max 100 people'),
  brewMinutes: z.coerce.number().min(0).max(60),
  brewSeconds: z.coerce.number().min(0).max(59),
  brewTimeNotApplicable: z.boolean(),
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().optional(),
  guestRatings: z.array(
    z.object({
      id: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    })
  ),
});

export type BrewFormValues = z.infer<typeof brewSchema>;

interface BrewingFormProps {
  entry?: BrewingEntry;
  onSubmit: (data: BrewFormValues) => void;
}

// ── Static data ────────────────────────────────────────────────────────────────

const methodOptions: { value: BrewingMethod; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'pour-over',    label: 'Pour Over',    Icon: PourOverIcon     },
  { value: 'french-press', label: 'French Press', Icon: FrenchPressIcon  },
  { value: 'aeropress',    label: 'AeroPress',    Icon: AeroPressIcon    },
  { value: 'aeropress-go', label: 'AeroPress Go', Icon: AeroPressGoIcon  },
  { value: 'kalita',       label: 'Kalita',       Icon: KalitaIcon       },
  { value: 'siemens-drip', label: 'Siemens Drip', Icon: SiemensDripIcon  },
  { value: 'espresso',     label: 'Espresso',     Icon: EspressoIcon     },
  { value: 'moka-pot',     label: 'Moka Pot',     Icon: MokaPotIcon      },
  { value: 'cold-brew',    label: 'Cold Brew',    Icon: ColdBrewIcon     },
  { value: 'drip',         label: 'Drip',         Icon: DripIcon         },
  { value: 'other',        label: 'Other',        Icon: OtherBrewIcon    },
];

const grindOptions: { value: GrindCoarseness; label: string; dotSize: number; dotCount: number }[] = [
  { value: 'extra-fine',    label: 'X-Fine',     dotSize: 3, dotCount: 4 },
  { value: 'fine',          label: 'Fine',       dotSize: 4, dotCount: 4 },
  { value: 'medium-fine',   label: 'Med-Fine',   dotSize: 5, dotCount: 3 },
  { value: 'medium',        label: 'Medium',     dotSize: 6, dotCount: 3 },
  { value: 'medium-coarse', label: 'Med-Coarse', dotSize: 7, dotCount: 2 },
  { value: 'coarse',        label: 'Coarse',     dotSize: 8, dotCount: 2 },
  { value: 'extra-coarse',  label: 'X-Coarse',   dotSize: 9, dotCount: 1 },
];

const waterOptions: { value: WaterSource; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'tap',               label: 'Tap',          Icon: TapWaterIcon         },
  { value: 'filtered-tap',      label: 'Filtered',     Icon: FilteredTapIcon      },
  { value: 'bottled-still',     label: 'Bottled Still',Icon: BottledStillIcon     },
  { value: 'bottled-sparkling', label: 'Sparkling',    Icon: BottledSparklingIcon },
  { value: 'spring',            label: 'Spring',       Icon: SpringWaterIcon      },
  { value: 'other',             label: 'Other',        Icon: OtherWaterIcon       },
];

const coffeeWaterDefaults: Partial<Record<BrewingMethod, { gramsOfCoffee: number; millilitersOfWater: number }>> = {
  'pour-over':    { gramsOfCoffee: 30, millilitersOfWater: 500 },
  kalita:         { gramsOfCoffee: 30, millilitersOfWater: 500 },
  aeropress:      { gramsOfCoffee: 14, millilitersOfWater: 200 },
  'aeropress-go': { gramsOfCoffee: 14, millilitersOfWater: 200 },
};

/**
 * Methods where brew time is fixed by the equipment and cannot be controlled by the user.
 * Selecting one of these methods auto-checks the "Not applicable" brew time toggle.
 */
const BREW_TIME_NOT_APPLICABLE_METHODS = new Set<BrewingMethod>(['siemens-drip']);

/**
 * Per-step sub-schemas used to validate only the current step's fields before
 * advancing. This avoids relying on react-hook-form's `trigger()` which has
 * known compatibility issues with the Zod v4 resolver for partial validation.
 */
const stepSchemas = [
  // Step 0 – Coffee details
  z.object({
    coffeeProducer: z.string().min(1, 'Coffee producer is required'),
    countryOfOrigin: z.string().min(1, 'Country of origin is required'),
  }),
  // Step 1 – Method & Grind (enum fields always have a valid default; only equipment and custom method can be empty)
  z.object({
    brewingMethod: z.enum(['pour-over', 'french-press', 'aeropress', 'aeropress-go', 'kalita', 'siemens-drip', 'espresso', 'moka-pot', 'cold-brew', 'drip', 'other'] as const),
    grindEquipment: z.string().min(1, 'Grind equipment is required'),
    brewingMethodCustom: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.brewingMethod === 'other' && !data.brewingMethodCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please describe your brewing method',
        path: ['brewingMethodCustom'],
      });
    }
  }),
  // Step 2 – Brew parameters (enum + numeric fields with valid defaults; verify numbers)
  z.object({
    gramsOfCoffee:      z.number().min(1, 'Must be at least 1g').max(1000, 'Max 1000g'),
    millilitersOfWater: z.number().min(1, 'Must be at least 1ml').max(10000, 'Max 10000ml'),
    numberOfPeople:     z.number().min(1, 'At least 1 person').max(100, 'Max 100 people'),
  }),
  // Step 3 – Rating
  z.object({
    rating: z.number().min(1, 'Please select a rating').max(5),
  }),
] as const;

const STEPS = ['The Coffee', 'Method & Grind', 'The Brew', 'Rate It'];

// ── Sub-components ─────────────────────────────────────────────────────────────

function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex items-center">
        {STEPS.map((label, index) => (
          <Fragment key={label}>
            <li className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200',
                  index < currentStep  && 'bg-primary text-primary-foreground',
                  index === currentStep && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  index > currentStep  && 'bg-muted text-muted-foreground',
                )}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={cn(
                'text-[10px] font-medium hidden sm:block leading-tight text-center max-w-[56px]',
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground',
              )}>
                {label}
              </span>
            </li>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1 mb-4 sm:mb-5 transition-all duration-300',
                index < currentStep ? 'bg-primary' : 'bg-muted',
              )} />
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

function StepHeading({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="text-center space-y-1 mb-6">
      <div className="text-4xl mb-2" role="img" aria-label={title}>{emoji}</div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1" role="alert">{message}</p>;
}

function MethodPicker({
  value,
  onChange,
  popularMethods,
}: {
  value: BrewingMethod;
  onChange: (v: BrewingMethod) => void;
  popularMethods: BrewingMethod[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = expanded
    ? methodOptions
    : methodOptions.filter(({ value: m }) => popularMethods.includes(m) || m === value);
  const hiddenCount = methodOptions.length - visibleOptions.length;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Brewing method">
        {visibleOptions.map(({ value: method, label, Icon }) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            aria-pressed={value === method}
            aria-label={label}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value === method
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent',
            )}
          >
            <Icon className="h-10 w-10" />
            <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
          </button>
        ))}
      </div>
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Show {hiddenCount} more method{hiddenCount !== 1 ? 's' : ''}
        </button>
      )}
      {expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Show fewer methods
        </button>
      )}
    </div>
  );
}

function GrindPicker({ value, onChange }: { value: GrindCoarseness; onChange: (v: GrindCoarseness) => void }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Grind coarseness">
      {grindOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          aria-label={opt.label}
          className={cn(
            'flex-1 flex flex-col items-center gap-1.5 py-2 px-0.5 rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === opt.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50',
          )}
        >
          {/* Particle visualisation */}
          <div className="h-7 flex items-end justify-center gap-0.5 pb-0.5">
            {Array.from({ length: opt.dotCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-current opacity-80"
                style={{ width: opt.dotSize, height: opt.dotSize }}
              />
            ))}
          </div>
          <span className="text-[9px] font-semibold leading-tight text-center">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function WaterPicker({
  value,
  onChange,
  popularSources,
}: {
  value: WaterSource;
  onChange: (v: WaterSource) => void;
  popularSources: WaterSource[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = expanded
    ? waterOptions
    : waterOptions.filter(({ value: s }) => popularSources.includes(s) || s === value);
  const hiddenCount = waterOptions.length - visibleOptions.length;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Water source">
        {visibleOptions.map(({ value: source, label, Icon }) => (
          <button
            key={source}
            type="button"
            onClick={() => onChange(source)}
            aria-pressed={value === source}
            aria-label={label}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value === source
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent',
            )}
          >
            <Icon className="h-9 w-9" />
            <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
          </button>
        ))}
      </div>
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Show {hiddenCount} more source{hiddenCount !== 1 ? 's' : ''}
        </button>
      )}
      {expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Show fewer sources
        </button>
      )}
    </div>
  );
}

// The two pre-defined grinders shown as quick-select buttons
const KNOWN_GRIND_EQUIPMENTS = ['Knock Aergrind', 'Wilfa Svart'];

function GrindEquipmentPicker({
  value,
  onChange,
  customSuggestions,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  customSuggestions: string[];
  error?: string;
}) {
  const isKnown = KNOWN_GRIND_EQUIPMENTS.includes(value);
  // Show custom input only when the value is a non-empty string not in the known list
  const [showCustom, setShowCustom] = useState(!isKnown && value !== '');

  const handleKnownClick = (opt: string) => {
    onChange(opt);
    setShowCustom(false);
  };

  const handleOtherClick = () => {
    if (isKnown) onChange('');
    setShowCustom(true);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Grind equipment">
        {KNOWN_GRIND_EQUIPMENTS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleKnownClick(opt)}
            aria-pressed={value === opt}
            aria-label={opt}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 text-[11px] font-medium leading-tight text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value === opt
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent',
            )}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={handleOtherClick}
          aria-pressed={showCustom}
          aria-label="Other grinder"
          className={cn(
            'flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 text-[11px] font-medium leading-tight text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            showCustom
              ? 'border-primary bg-primary/10 text-primary shadow-sm'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent',
          )}
        >
          Other
        </button>
      </div>
      {showCustom && (
        <div>
          <Input
            id="grindEquipment"
            placeholder="e.g. Baratza Encore, Comandante"
            list="grind-equipment-suggestions"
            value={isKnown ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-label="Custom grind equipment"
            className="text-base"
          />
          <datalist id="grind-equipment-suggestions">
            {customSuggestions.filter((s) => !KNOWN_GRIND_EQUIPMENTS.includes(s)).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      )}
      {!!error && <p className="text-xs text-destructive mt-1" role="alert">{error}</p>}
    </div>
  );
}

function VarietyPicker({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
}) {
  const [inputValue, setInputValue] = useState('');

  const addVariety = (variety: string) => {
    const trimmed = variety.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  };

  const removeVariety = (variety: string) => {
    onChange(value.filter((v) => v !== variety));
  };

  const availableSuggestions = suggestions.filter((s) => !value.includes(s));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) addVariety(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeVariety(value[value.length - 1]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (availableSuggestions.includes(v)) {
      addVariety(v);
    } else {
      setInputValue(v);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Selected varieties">
          {value.map((v) => (
            <span
              key={v}
              role="listitem"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {v}
              <button
                type="button"
                onClick={() => removeVariety(v)}
                aria-label={`Remove ${v}`}
                className="ml-0.5 hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        placeholder={value.length === 0 ? 'e.g. Geisha, SL28, Bourbon' : 'Add another variety…'}
        list="coffee-variety-suggestions"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addVariety(inputValue); }}
        aria-label="Coffee variety input"
        className="text-base"
      />
      <datalist id="coffee-variety-suggestions">
        {availableSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <p className="text-xs text-muted-foreground">
        Press Enter or select from suggestions to add · Backspace to remove last
      </p>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  unit,
  step = 1,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  // Set to true before any explicit commit or cancel so the subsequent onBlur
  // (fired when the input unmounts) does not double-commit or override the cancel.
  const skipNextBlurRef = useRef(false);

  const startEdit = () => {
    setInputValue(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="text-center min-w-[5rem]">
        {editing ? (
          <input
            type="number"
            value={inputValue}
            min={min}
            max={max}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
              if (skipNextBlurRef.current) {
                skipNextBlurRef.current = false;
              } else {
                commitEdit();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                skipNextBlurRef.current = true;
                commitEdit();
              }
              if (e.key === 'Escape') {
                skipNextBlurRef.current = true;
                setEditing(false);
              }
            }}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            aria-label={`Edit ${label}`}
            className="text-3xl font-bold text-foreground tabular-nums w-20 text-center bg-transparent border-0 border-b-2 border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title="Click to type a value"
            aria-label={`${value}${unit ? ' ' + unit : ''}, click to edit`}
            className="text-3xl font-bold text-foreground tabular-nums cursor-text bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded hover:text-primary transition-colors"
          >
            {value}
          </button>
        )}
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function BrewTimePicker({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  notApplicable,
  onNotApplicableChange,
}: {
  minutes: number;
  seconds: number;
  onMinutesChange: (v: number) => void;
  onSecondsChange: (v: number) => void;
  notApplicable: boolean;
  onNotApplicableChange: (v: boolean) => void;
}) {
  const spinBtn =
    'w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent transition-colors text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={notApplicable}
            onChange={(e) => onNotApplicableChange(e.target.checked)}
            aria-label="Brew time not applicable"
            className="accent-primary"
          />
          Not applicable
        </label>
      </div>
      {!notApplicable && (
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button type="button" className={spinBtn} onClick={() => onMinutesChange(Math.min(60, minutes + 1))} aria-label="Increase minutes">+</button>
            <span className="text-4xl font-bold w-14 text-center tabular-nums text-foreground">{String(minutes).padStart(2, '0')}</span>
            <button type="button" className={spinBtn} onClick={() => onMinutesChange(Math.max(0, minutes - 1))} aria-label="Decrease minutes">−</button>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">min</span>
          </div>
          <span className="text-4xl font-bold text-muted-foreground pb-6">:</span>
          <div className="flex flex-col items-center gap-2">
            <button type="button" className={spinBtn} onClick={() => onSecondsChange(Math.min(45, seconds + 15))} aria-label="Increase seconds">+</button>
            <span className="text-4xl font-bold w-14 text-center tabular-nums text-foreground">{String(seconds).padStart(2, '0')}</span>
            <button type="button" className={spinBtn} onClick={() => onSecondsChange(Math.max(0, seconds - 15))} aria-label="Decrease seconds">−</button>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">sec</span>
          </div>
        </div>
      )}
      {notApplicable && (
        <p className="text-center text-sm text-muted-foreground italic">Time is fixed by the equipment</p>
      )}
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────

export function BrewingForm({ entry, onSubmit }: BrewingFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const isFirstRender = useRef(true);
  const sharedDefaultsApplied = useRef(false);

  const { suggestions, defaults: formDefaults, popularBrewingMethods, popularWaterSources, loading: defaultsLoading, hasLocalData } = useFormDefaults();

  const defaultValues: BrewFormValues = entry
    ? {
        coffeeProducer:         entry.coffeeProducer,
        countryOfOrigin:        entry.countryOfOrigin,
        coffeeVariety:          entry.coffeeVariety ?? [],
        grindCoarseness:        entry.grindCoarseness,
        grindEquipment:         entry.grindEquipment,
        brewingMethod:          entry.brewingMethod,
        brewingMethodCustom:    entry.brewingMethodCustom ?? '',
        gramsOfCoffee:          entry.gramsOfCoffee,
        millilitersOfWater:     entry.millilitersOfWater,
        waterSource:            entry.waterSource,
        numberOfPeople:         entry.numberOfPeople,
        brewMinutes:            entry.brewTimeSeconds !== null ? Math.floor(entry.brewTimeSeconds / 60) : 0,
        brewSeconds:            entry.brewTimeSeconds !== null ? entry.brewTimeSeconds % 60 : 0,
        brewTimeNotApplicable:  entry.brewTimeSeconds === null,
        rating:                 entry.rating,
        comment:                entry.comment ?? '',
        guestRatings:           entry.guestRatings,
      }
    : {
        coffeeProducer:         formDefaults.coffeeProducer,
        countryOfOrigin:        formDefaults.countryOfOrigin,
        coffeeVariety:          formDefaults.coffeeVariety,
        grindCoarseness:        formDefaults.grindCoarseness,
        grindEquipment:         formDefaults.grindEquipment,
        brewingMethod:          formDefaults.brewingMethod,
        brewingMethodCustom:    '',
        gramsOfCoffee:          formDefaults.gramsOfCoffee,
        millilitersOfWater:     formDefaults.millilitersOfWater,
        waterSource:            formDefaults.waterSource,
        numberOfPeople:         formDefaults.numberOfPeople,
        brewMinutes:            formDefaults.brewMinutes,
        brewSeconds:            formDefaults.brewSeconds,
        brewTimeNotApplicable:  formDefaults.brewTimeNotApplicable,
        rating:                 0,
        comment:                '',
        guestRatings:           [],
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<BrewFormValues>({ resolver: zodResolver(brewSchema), defaultValues });

  const brewingMethod      = watch('brewingMethod');
  const numberOfPeople     = watch('numberOfPeople');
  const gramsOfCoffee      = watch('gramsOfCoffee');
  const milliliters        = watch('millilitersOfWater');
  const brewMinutes        = watch('brewMinutes');
  const brewSeconds        = watch('brewSeconds');
  const brewTimeNotApplicable = watch('brewTimeNotApplicable');

  // When shared brews finish loading and there is no local data, apply the
  // most-popular shared-brew values as defaults (only once, and only if the
  // user has not yet modified the form).
  useEffect(() => {
    const alreadyHasData = entry || hasLocalData;
    const notReadyOrUsed = defaultsLoading || isDirty || sharedDefaultsApplied.current;
    if (alreadyHasData || notReadyOrUsed) return;
    sharedDefaultsApplied.current = true;
    reset({
      coffeeProducer:         formDefaults.coffeeProducer,
      countryOfOrigin:        formDefaults.countryOfOrigin,
      coffeeVariety:          formDefaults.coffeeVariety,
      grindCoarseness:        formDefaults.grindCoarseness,
      grindEquipment:         formDefaults.grindEquipment,
      brewingMethod:          formDefaults.brewingMethod,
      brewingMethodCustom:    '',
      gramsOfCoffee:          formDefaults.gramsOfCoffee,
      millilitersOfWater:     formDefaults.millilitersOfWater,
      waterSource:            formDefaults.waterSource,
      numberOfPeople:         formDefaults.numberOfPeople,
      brewMinutes:            formDefaults.brewMinutes,
      brewSeconds:            formDefaults.brewSeconds,
      brewTimeNotApplicable:  formDefaults.brewTimeNotApplicable,
      rating:                 0,
      comment:                '',
      guestRatings:           [],
    });
  }, [entry, hasLocalData, defaultsLoading, isDirty, formDefaults, reset]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const defaults = coffeeWaterDefaults[brewingMethod];
    if (defaults) {
      setValue('gramsOfCoffee', defaults.gramsOfCoffee);
      setValue('millilitersOfWater', defaults.millilitersOfWater);
    }
    setValue('brewTimeNotApplicable', BREW_TIME_NOT_APPLICABLE_METHODS.has(brewingMethod));
  }, [brewingMethod, setValue]);

  const handleNext = () => {
    const values = getValues();
    const schema = stepSchemas[step];
    if (!schema) { setStep((s) => Math.min(STEPS.length - 1, s + 1)); return; }
    const result = schema.safeParse(values);
    if (result.success) {
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    } else {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof BrewFormValues;
        if (field) setError(field, { type: 'manual', message: issue.message });
      }
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleFormSubmit = async (data: BrewFormValues) => {
    setIsSubmitting(true);
    try { onSubmit(data); } finally { setIsSubmitting(false); }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <WizardProgress currentStep={step} />

      {/* ── Step 0: The Coffee ───────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          <StepHeading emoji="☕" title="The Coffee" subtitle="What beans are you brewing today?" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coffeeProducer">
                Coffee Producer <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="coffeeProducer"
                placeholder="e.g. Stumptown, Blue Bottle"
                list="coffee-producer-suggestions"
                {...register('coffeeProducer')}
                aria-invalid={!!errors.coffeeProducer}
                className="text-base"
              />
              <datalist id="coffee-producer-suggestions">
                {suggestions.coffeeProducers.map((s) => <option key={s} value={s} />)}
              </datalist>
              <FieldError message={errors.coffeeProducer?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryOfOrigin">
                Country of Origin <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="countryOfOrigin"
                placeholder="e.g. Ethiopia, Colombia"
                list="country-of-origin-suggestions"
                {...register('countryOfOrigin')}
                aria-invalid={!!errors.countryOfOrigin}
                className="text-base"
              />
              <datalist id="country-of-origin-suggestions">
                {suggestions.countriesOfOrigin.map((s) => <option key={s} value={s} />)}
              </datalist>
              <FieldError message={errors.countryOfOrigin?.message} />
            </div>
            <div className="space-y-2">
              <Label>
                Variety <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Controller
                control={control}
                name="coffeeVariety"
                render={({ field }) => (
                  <VarietyPicker
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={suggestions.coffeeVarieties}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Method & Grind ───────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <StepHeading emoji="🫖" title="Method & Grind" subtitle="How are you brewing it?" />

          <div className="space-y-2">
            <Label>Brewing Method <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Controller
              control={control}
              name="brewingMethod"
              render={({ field }) => (
                <MethodPicker
                  value={field.value}
                  onChange={field.onChange}
                  popularMethods={popularBrewingMethods}
                />
              )}
            />
            {brewingMethod === 'other' && (
              <div className="mt-2">
                <Input
                  id="brewingMethodCustom"
                  placeholder="Describe your brewing method…"
                  {...register('brewingMethodCustom')}
                  aria-invalid={!!errors.brewingMethodCustom}
                  className="text-base"
                />
                <FieldError message={errors.brewingMethodCustom?.message} />
              </div>
            )}
            <FieldError message={errors.brewingMethod?.message} />
          </div>

          <div className="space-y-2">
            <Label>Grind Coarseness <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Controller
              control={control}
              name="grindCoarseness"
              render={({ field }) => (
                <GrindPicker value={field.value} onChange={field.onChange} />
              )}
            />
            <FieldError message={errors.grindCoarseness?.message} />
          </div>

          <div className="space-y-2">
            <Label>
              Grind Equipment <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="grindEquipment"
              render={({ field }) => (
                <GrindEquipmentPicker
                  value={field.value}
                  onChange={field.onChange}
                  customSuggestions={suggestions.grindEquipments}
                  error={errors.grindEquipment?.message}
                />
              )}
            />
          </div>
        </div>
      )}

      {/* ── Step 2: The Brew ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-8">
          <StepHeading emoji="💧" title="The Brew" subtitle="Dial in your recipe" />

          <div className="space-y-2">
            <Label>Water Source <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Controller
              control={control}
              name="waterSource"
              render={({ field }) => (
                <WaterPicker
                  value={field.value}
                  onChange={field.onChange}
                  popularSources={popularWaterSources}
                />
              )}
            />
            <FieldError message={errors.waterSource?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-center text-foreground">
                Coffee <span className="text-destructive" aria-hidden="true">*</span>
              </p>
              <Stepper
                value={gramsOfCoffee}
                onChange={(newCoffee) => {
                  setValue('gramsOfCoffee', newCoffee);
                  if (maintainRatio && gramsOfCoffee > 0 && milliliters > 0) {
                    const ratio = milliliters / gramsOfCoffee;
                    setValue('millilitersOfWater', Math.min(10000, Math.max(1, Math.ceil(newCoffee * ratio))));
                  }
                }}
                min={1}
                max={1000}
                unit="g"
                step={1}
                label="coffee amount"
              />
              <FieldError message={errors.gramsOfCoffee?.message} />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-center text-foreground">
                Water <span className="text-destructive" aria-hidden="true">*</span>
              </p>
              <Stepper
                value={milliliters}
                onChange={(newWater) => {
                  setValue('millilitersOfWater', newWater);
                  if (maintainRatio && gramsOfCoffee > 0 && milliliters > 0) {
                    const ratio = milliliters / gramsOfCoffee;
                    setValue('gramsOfCoffee', Math.min(1000, Math.max(1, Math.ceil(newWater / ratio))));
                  }
                }}
                min={1}
                max={10000}
                unit="ml"
                step={10}
                label="water amount"
              />
              <FieldError message={errors.millilitersOfWater?.message} />
            </div>
          </div>

          {/* Maintain ratio toggle + live ratio badge */}
          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={maintainRatio}
                onChange={(e) => setMaintainRatio(e.target.checked)}
                aria-label="Maintain ratio when adjusting coffee or water"
                className="accent-primary"
              />
              Maintain ratio
            </label>
            {gramsOfCoffee > 0 && milliliters > 0 && (
              <p className="text-sm text-muted-foreground">
                Ratio{' '}
                <span className="font-semibold text-foreground">
                  1:{(milliliters / gramsOfCoffee).toFixed(1)}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-foreground">
              Brew Time <span className="text-destructive" aria-hidden="true">*</span>
            </p>
            <Controller
              control={control}
              name="brewMinutes"
              render={({ field: minField }) => (
                <Controller
                  control={control}
                  name="brewSeconds"
                  render={({ field: secField }) => (
                    <BrewTimePicker
                      minutes={minField.value}
                      seconds={secField.value}
                      onMinutesChange={minField.onChange}
                      onSecondsChange={secField.onChange}
                      notApplicable={brewTimeNotApplicable}
                      onNotApplicableChange={(v) => setValue('brewTimeNotApplicable', v)}
                    />
                  )}
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-foreground">
              People Served <span className="text-destructive" aria-hidden="true">*</span>
            </p>
            <Controller
              control={control}
              name="numberOfPeople"
              render={({ field }) => (
                <Stepper
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={100}
                  step={1}
                  label="people served"
                />
              )}
            />
            <FieldError message={errors.numberOfPeople?.message} />
          </div>
        </div>
      )}

      {/* ── Step 3: Rate It ──────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <StepHeading emoji="⭐" title="Rate It" subtitle="How was that cup?" />

          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-foreground">
              Your Rating <span className="text-destructive" aria-hidden="true">*</span>
            </p>
            <div className="flex justify-center">
              <Controller
                control={control}
                name="rating"
                render={({ field: { value, onChange } }) => (
                  <StarRating value={value} onChange={onChange} size="lg" label="Overall rating" />
                )}
              />
            </div>
            <FieldError message={errors.rating?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              Notes <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Tasting notes, observations, improvements..."
              rows={3}
              {...register('comment')}
            />
          </div>

          {/* Guest ratings — only shown when multiple people were served */}
          {numberOfPeople > 1 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-t border-border pt-4">
                <h3 className="text-base font-semibold text-foreground">Guest Ratings</h3>
                <span className="text-xs text-muted-foreground">
                  ({numberOfPeople - 1} guest{numberOfPeople > 2 ? 's' : ''} can rate)
                </span>
              </div>
              <GuestRatings control={control} />
            </section>
          )}
        </div>
      )}

      {/* ── Wizard navigation ────────────────────────────────────────────── */}
      <div className="flex gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={step === 0 ? () => navigate(-1) : handleBack}
          className="w-auto"
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </Button>
        {isLastStep ? (
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving…' : entry ? 'Update Brew' : 'Log Brew'}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} className="flex-1">
            Next →
          </Button>
        )}
      </div>

      {/* Live recipe summary shown on brew step */}
      {step === 2 && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          {methodOptions.find((m) => m.value === brewingMethod)?.label}
          {' · '}
          {gramsOfCoffee}g coffee · {milliliters}ml water
          {' · '}
          {brewTimeNotApplicable ? 'N/A' : `${String(brewMinutes).padStart(2, '0')}:${String(brewSeconds).padStart(2, '0')}`}
        </p>
      )}
    </form>
  );
}
