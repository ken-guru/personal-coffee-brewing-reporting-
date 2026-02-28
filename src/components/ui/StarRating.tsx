import { useState, useCallback, KeyboardEvent } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
  label = 'Rating',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, star: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange?.(star);
      } else if (e.key === 'ArrowLeft' && star > 1) {
        onChange?.(star - 1);
      } else if (e.key === 'ArrowRight' && star < 5) {
        onChange?.(star + 1);
      }
    },
    [onChange]
  );

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role={readOnly ? undefined : 'group'}
      aria-label={readOnly ? `${label}: ${value} out of 5 stars` : label}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        if (readOnly) {
          return (
            <Star
              key={star}
              className={cn(
                sizeMap[size],
                filled ? 'fill-primary text-primary' : 'fill-transparent text-muted-foreground'
              )}
              aria-hidden="true"
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={cn(
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
              'transition-transform active:scale-90',
              sizeMap[size] === 'h-4 w-4' ? 'min-h-[32px] min-w-[32px]' : 'min-h-[44px] min-w-[44px]',
              'flex items-center justify-center'
            )}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={value === star}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled ? 'fill-primary text-primary' : 'fill-transparent text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
