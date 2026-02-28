import { useFieldArray, Control, Controller } from 'react-hook-form';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { Card, CardContent } from '../ui/Card';
import { BrewFormValues } from './BrewingForm';

interface GuestRatingsProps {
  control: Control<BrewFormValues>;
}

export function GuestRatings({ control }: GuestRatingsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'guestRatings',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Guest Ratings</h3>
          <span className="text-xs text-muted-foreground">({fields.length})</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ id: crypto.randomUUID(), rating: 3, comment: '' })}
        >
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          Add Guest
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          No guest ratings yet. Add guests who tried your brew!
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-foreground">Guest {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                aria-label={`Remove guest ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <Controller
                control={control}
                name={`guestRatings.${index}.rating`}
                render={({ field: { value, onChange } }) => (
                  <StarRating value={value} onChange={onChange} label={`Guest ${index + 1} rating`} />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guestRatings.${index}.comment`}>Comment (optional)</Label>
              <Controller
                control={control}
                name={`guestRatings.${index}.comment`}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id={`guestRatings.${index}.comment`}
                    placeholder="What did they think?"
                    rows={2}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
