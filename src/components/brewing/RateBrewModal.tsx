import { useState } from 'react';
import { Clock, Droplets, Users, Coffee } from 'lucide-react';
import type { BrewingEntry } from '../../types/brewing';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import { formatTime, formatBrewingMethod, formatWaterSource } from '../../lib/utils';

interface RateBrewModalProps {
  entry: BrewingEntry | null;
  open: boolean;
  onClose: () => void;
  onSave: (rating: number) => void;
}

export function RateBrewModal({ entry, open, onClose, onSave }: RateBrewModalProps) {
  const [rating, setRating] = useState(0);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setRating(0);
      onClose();
    }
  };

  const handleSave = () => {
    if (!entry || rating === 0) return;
    onSave(rating);
    setRating(0);
    onClose();
  };

  if (!entry) return null;

  const ratio = (entry.millilitersOfWater / entry.gramsOfCoffee).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Brew</DialogTitle>
        </DialogHeader>

        {/* Brew summary */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="font-medium text-foreground text-base">{entry.coffeeProducer}</div>
          <div className="flex items-center gap-1">
            <Coffee className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {entry.brewingMethod === 'other' && entry.brewingMethodCustom
                ? entry.brewingMethodCustom
                : formatBrewingMethod(entry.brewingMethod)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {entry.brewTimeSeconds !== null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatTime(entry.brewTimeSeconds)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              {entry.gramsOfCoffee}g · {entry.millilitersOfWater}ml ({formatWaterSource(entry.waterSource)}) · 1:{ratio}
            </span>
            {entry.numberOfPeople > 1 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {entry.numberOfPeople} people
              </span>
            )}
          </div>
        </div>

        {/* Star rating */}
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm font-medium text-foreground">Your Rating</p>
          <StarRating value={rating} onChange={setRating} size="lg" label="Overall rating" />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={rating === 0}>
            Save Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
