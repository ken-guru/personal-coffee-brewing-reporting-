import { Link } from 'react-router-dom';
import { Clock, Users, Droplets, Coffee } from 'lucide-react';
import { BrewingEntry } from '../../types/brewing';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { formatTime, formatBrewingMethod } from '../../lib/utils';

interface BrewingCardProps {
  entry: BrewingEntry;
}

export function BrewingCard({ entry }: BrewingCardProps) {
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const ratio = (entry.millilitersOfWater / entry.gramsOfCoffee).toFixed(1);

  return (
    <Link
      to={`/brew/${entry.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      aria-label={`View ${entry.coffeeProducer} brew details`}
    >
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-card-foreground truncate">
                  {entry.coffeeProducer}
                </h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  {entry.countryOfOrigin}
                </Badge>
                {entry.coffeeVariety && (
                  <Badge variant="outline" className="text-xs shrink-0 italic font-normal">
                    {entry.coffeeVariety}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Coffee className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                  {formatBrewingMethod(entry.brewingMethod)}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <StarRating value={entry.rating} readOnly size="sm" />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatTime(entry.brewTimeSeconds)}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" aria-hidden="true" />
              {entry.gramsOfCoffee}g · {entry.millilitersOfWater}ml · 1:{ratio}
            </span>
            {entry.numberOfPeople > 1 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {entry.numberOfPeople} people
              </span>
            )}
            {entry.guestRatings.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {entry.guestRatings.length} guest rating{entry.guestRatings.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="ml-auto">{date}</span>
          </div>

          {entry.comment && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic">
              "{entry.comment}"
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
