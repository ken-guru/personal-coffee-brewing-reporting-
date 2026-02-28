import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { BrewingEntry, GrindCoarseness, BrewingMethod, WaterSource } from '../../types/brewing';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { StarRating } from '../ui/StarRating';
import { GuestRatings } from './GuestRatings';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/Select';
import { cn } from '../../lib/utils';

const brewSchema = z.object({
  coffeeProducer: z.string().min(1, 'Coffee producer is required'),
  countryOfOrigin: z.string().min(1, 'Country of origin is required'),
  grindCoarseness: z.enum(['extra-fine', 'fine', 'medium-fine', 'medium', 'medium-coarse', 'coarse', 'extra-coarse'] as const),
  grindEquipment: z.string().min(1, 'Grind equipment is required'),
  brewingMethod: z.enum(['pour-over', 'french-press', 'aeropress', 'aeropress-go', 'kalita', 'siemens-drip', 'espresso', 'moka-pot', 'cold-brew', 'drip', 'other'] as const),
  gramsOfCoffee: z.coerce.number().min(1, 'Must be at least 1g').max(1000, 'Max 1000g'),
  millilitersOfWater: z.coerce.number().min(1, 'Must be at least 1ml').max(10000, 'Max 10000ml'),
  waterSource: z.enum(['tap', 'filtered-tap', 'bottled-still', 'bottled-sparkling', 'spring', 'other'] as const),
  numberOfPeople: z.coerce.number().min(1, 'At least 1 person').max(100, 'Max 100 people'),
  brewMinutes: z.coerce.number().min(0).max(60),
  brewSeconds: z.coerce.number().min(0).max(59),
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

const grindOptions: { value: GrindCoarseness; label: string }[] = [
  { value: 'extra-fine', label: 'Extra Fine' },
  { value: 'fine', label: 'Fine' },
  { value: 'medium-fine', label: 'Medium Fine' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium-coarse', label: 'Medium Coarse' },
  { value: 'coarse', label: 'Coarse' },
  { value: 'extra-coarse', label: 'Extra Coarse' },
];

const methodOptions: { value: BrewingMethod; label: string }[] = [
  { value: 'pour-over', label: 'Pour Over' },
  { value: 'french-press', label: 'French Press' },
  { value: 'aeropress', label: 'AeroPress' },
  { value: 'aeropress-go', label: 'AeroPress Go' },
  { value: 'kalita', label: 'Kalita Hand Brewer' },
  { value: 'siemens-drip', label: 'Siemens Coffee Brewer' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'moka-pot', label: 'Moka Pot' },
  { value: 'cold-brew', label: 'Cold Brew' },
  { value: 'drip', label: 'Drip' },
  { value: 'other', label: 'Other' },
];

const waterOptions: { value: WaterSource; label: string }[] = [
  { value: 'tap', label: 'Tap' },
  { value: 'filtered-tap', label: 'Filtered Tap' },
  { value: 'bottled-still', label: 'Bottled Still' },
  { value: 'bottled-sparkling', label: 'Bottled Sparkling' },
  { value: 'spring', label: 'Spring' },
  { value: 'other', label: 'Other' },
];

const coffeeWaterDefaults: Partial<Record<BrewingMethod, { gramsOfCoffee: number; millilitersOfWater: number }>> = {
  'pour-over': { gramsOfCoffee: 30, millilitersOfWater: 500 },
  kalita: { gramsOfCoffee: 30, millilitersOfWater: 500 },
  aeropress: { gramsOfCoffee: 14, millilitersOfWater: 200 },
  'aeropress-go': { gramsOfCoffee: 14, millilitersOfWater: 200 },
};

const grindEquipmentSuggestions = ['Knock Aergrind', 'Wilfa Svart'];

function FormField({
  label,
  htmlFor,
  error,
  children,
  required,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function BrewingForm({ entry, onSubmit }: BrewingFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFirstRender = useRef(true);

  const defaultValues: BrewFormValues = entry
    ? {
        coffeeProducer: entry.coffeeProducer,
        countryOfOrigin: entry.countryOfOrigin,
        grindCoarseness: entry.grindCoarseness,
        grindEquipment: entry.grindEquipment,
        brewingMethod: entry.brewingMethod,
        gramsOfCoffee: entry.gramsOfCoffee,
        millilitersOfWater: entry.millilitersOfWater,
        waterSource: entry.waterSource,
        numberOfPeople: entry.numberOfPeople,
        brewMinutes: Math.floor(entry.brewTimeSeconds / 60),
        brewSeconds: entry.brewTimeSeconds % 60,
        rating: entry.rating,
        comment: entry.comment ?? '',
        guestRatings: entry.guestRatings,
      }
    : {
        coffeeProducer: '',
        countryOfOrigin: '',
        grindCoarseness: 'medium',
        grindEquipment: '',
        brewingMethod: 'pour-over',
        gramsOfCoffee: 30,
        millilitersOfWater: 500,
        waterSource: 'filtered-tap',
        numberOfPeople: 1,
        brewMinutes: 3,
        brewSeconds: 0,
        rating: 0,
        comment: '',
        guestRatings: [],
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrewFormValues>({
    resolver: zodResolver(brewSchema),
    defaultValues,
  });

  const brewingMethod = watch('brewingMethod');

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const defaults = coffeeWaterDefaults[brewingMethod];
    if (defaults) {
      setValue('gramsOfCoffee', defaults.gramsOfCoffee);
      setValue('millilitersOfWater', defaults.millilitersOfWater);
    }
  }, [brewingMethod, setValue]);

  const handleFormSubmit = async (data: BrewFormValues) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      {/* Coffee Info */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Coffee Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Coffee Producer" htmlFor="coffeeProducer" error={errors.coffeeProducer?.message} required>
            <Input
              id="coffeeProducer"
              placeholder="e.g. Stumptown, Blue Bottle"
              {...register('coffeeProducer')}
              aria-invalid={!!errors.coffeeProducer}
            />
          </FormField>
          <FormField label="Country of Origin" htmlFor="countryOfOrigin" error={errors.countryOfOrigin?.message} required>
            <Input
              id="countryOfOrigin"
              placeholder="e.g. Ethiopia, Colombia"
              {...register('countryOfOrigin')}
              aria-invalid={!!errors.countryOfOrigin}
            />
          </FormField>
        </div>
      </section>

      {/* Grind */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Grind
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Grind Coarseness" error={errors.grindCoarseness?.message} required>
            <Controller
              control={control}
              name="grindCoarseness"
              render={({ field }) => (
                <SelectRoot onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-label="Grind coarseness" className={cn(errors.grindCoarseness && 'border-destructive')}>
                    <SelectValue placeholder="Select coarseness" />
                  </SelectTrigger>
                  <SelectContent>
                    {grindOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
          </FormField>
          <FormField label="Grind Equipment" htmlFor="grindEquipment" error={errors.grindEquipment?.message} required>
            <Input
              id="grindEquipment"
              placeholder="e.g. Baratza Encore, Hario"
              list="grind-equipment-suggestions"
              {...register('grindEquipment')}
              aria-invalid={!!errors.grindEquipment}
            />
            <datalist id="grind-equipment-suggestions">
              {grindEquipmentSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </FormField>
        </div>
      </section>

      {/* Brewing */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Brewing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Brewing Method" error={errors.brewingMethod?.message} required>
            <Controller
              control={control}
              name="brewingMethod"
              render={({ field }) => (
                <SelectRoot onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-label="Brewing method" className={cn(errors.brewingMethod && 'border-destructive')}>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
          </FormField>
          <FormField label="Water Source" error={errors.waterSource?.message} required>
            <Controller
              control={control}
              name="waterSource"
              render={({ field }) => (
                <SelectRoot onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-label="Water source" className={cn(errors.waterSource && 'border-destructive')}>
                    <SelectValue placeholder="Select water source" />
                  </SelectTrigger>
                  <SelectContent>
                    {waterOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Coffee (grams)" htmlFor="gramsOfCoffee" error={errors.gramsOfCoffee?.message} required>
            <Input
              id="gramsOfCoffee"
              type="number"
              min={1}
              max={1000}
              {...register('gramsOfCoffee')}
              aria-invalid={!!errors.gramsOfCoffee}
            />
          </FormField>
          <FormField label="Water (ml)" htmlFor="millilitersOfWater" error={errors.millilitersOfWater?.message} required>
            <Input
              id="millilitersOfWater"
              type="number"
              min={1}
              max={10000}
              {...register('millilitersOfWater')}
              aria-invalid={!!errors.millilitersOfWater}
            />
          </FormField>
          <FormField label="People Served" htmlFor="numberOfPeople" error={errors.numberOfPeople?.message} required>
            <Input
              id="numberOfPeople"
              type="number"
              min={1}
              max={100}
              {...register('numberOfPeople')}
              aria-invalid={!!errors.numberOfPeople}
            />
          </FormField>
        </div>
        <div className="space-y-2">
          <Label>
            Brew Time
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="brewMinutes" className="text-xs text-muted-foreground">Minutes</Label>
              <Input
                id="brewMinutes"
                type="number"
                min={0}
                max={60}
                {...register('brewMinutes')}
                aria-invalid={!!errors.brewMinutes}
              />
            </div>
            <span className="mt-6 text-muted-foreground font-bold text-lg">:</span>
            <div className="flex-1 space-y-1">
              <Label htmlFor="brewSeconds" className="text-xs text-muted-foreground">Seconds</Label>
              <Input
                id="brewSeconds"
                type="number"
                min={0}
                max={59}
                {...register('brewSeconds')}
                aria-invalid={!!errors.brewSeconds}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rating */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Your Rating
        </h2>
        <FormField label="Overall Rating" error={errors.rating?.message} required>
          <Controller
            control={control}
            name="rating"
            render={({ field: { value, onChange } }) => (
              <StarRating value={value} onChange={onChange} size="lg" label="Overall rating" />
            )}
          />
        </FormField>
        <FormField label="Notes (optional)" htmlFor="comment" error={errors.comment?.message}>
          <Textarea
            id="comment"
            placeholder="Tasting notes, observations, improvements..."
            rows={3}
            {...register('comment')}
          />
        </FormField>
      </section>

      {/* Guest Ratings */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Guest Ratings
        </h2>
        <GuestRatings control={control} />
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Saving...' : entry ? 'Update Brew' : 'Log Brew'}
        </Button>
      </div>
    </form>
  );
}
