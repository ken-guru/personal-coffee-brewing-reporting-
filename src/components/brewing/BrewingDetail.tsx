import { BrewingEntry } from '../../types/brewing';
import { StarRating } from '../ui/StarRating';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  formatTime,
  formatBrewingMethod,
  formatGrindCoarseness,
  formatWaterSource,
} from '../../lib/utils';
import { Clock, Droplets, Globe, Coffee, Settings, Users, MessageSquare } from 'lucide-react';

interface BrewingDetailProps {
  entry: BrewingEntry;
}

function DetailRow({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        <span className="shrink-0">{label}</span>
      </div>
      <div className="text-sm font-medium text-foreground text-right">{value}</div>
    </div>
  );
}

export function BrewingDetail({ entry }: BrewingDetailProps) {
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const updatedDate = entry.updatedAt !== entry.createdAt
    ? new Date(entry.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const ratio = (entry.millilitersOfWater / entry.gramsOfCoffee).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{entry.coffeeProducer}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">{entry.countryOfOrigin}</span>
          </div>
          {entry.coffeeVariety && (
            <p className="text-sm text-muted-foreground mt-0.5 italic">{entry.coffeeVariety}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <StarRating value={entry.rating} readOnly size="lg" label="Your rating" />
          <p className="text-xs text-muted-foreground mt-1">{date}</p>
          {updatedDate && (
            <p className="text-xs text-muted-foreground">Updated {updatedDate}</p>
          )}
        </div>
      </div>

      {/* Method badge */}
      <Badge className="text-sm py-1 px-3">
        {formatBrewingMethod(entry.brewingMethod)}
      </Badge>

      {/* Core details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <Settings className="h-4 w-4 inline mr-2" aria-hidden="true" />
            Brew Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow
            label="Grind"
            value={formatGrindCoarseness(entry.grindCoarseness)}
            icon={<Coffee className="h-4 w-4" />}
          />
          <DetailRow
            label="Grinder"
            value={entry.grindEquipment}
            icon={<Settings className="h-4 w-4" />}
          />
          <DetailRow
            label="Coffee"
            value={`${entry.gramsOfCoffee}g`}
            icon={<Coffee className="h-4 w-4" />}
          />
          <DetailRow
            label="Water"
            value={`${entry.millilitersOfWater}ml (${formatWaterSource(entry.waterSource)})`}
            icon={<Droplets className="h-4 w-4" />}
          />
          <DetailRow
            label="Ratio"
            value={`1:${ratio}`}
            icon={<Droplets className="h-4 w-4" />}
          />
          <DetailRow
            label="Brew Time"
            value={formatTime(entry.brewTimeSeconds)}
            icon={<Clock className="h-4 w-4" />}
          />
          <DetailRow
            label="Served"
            value={`${entry.numberOfPeople} person${entry.numberOfPeople !== 1 ? 's' : ''}`}
            icon={<Users className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Comment */}
      {entry.comment && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              <MessageSquare className="h-4 w-4 inline mr-2" aria-hidden="true" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground italic">"{entry.comment}"</p>
          </CardContent>
        </Card>
      )}

      {/* Guest ratings */}
      {entry.guestRatings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              <Users className="h-4 w-4 inline mr-2" aria-hidden="true" />
              Guest Ratings ({entry.guestRatings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.guestRatings.map((guest, idx) => (
              <div key={guest.id} className="space-y-1 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Guest {idx + 1}</span>
                  <StarRating value={guest.rating} readOnly size="sm" label={`Guest ${idx + 1} rating`} />
                </div>
                {guest.comment && (
                  <p className="text-sm text-muted-foreground italic">"{guest.comment}"</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
