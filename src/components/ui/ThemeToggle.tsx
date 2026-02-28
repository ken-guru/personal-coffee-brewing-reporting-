import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2" aria-label="Theme toggle">
      <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <SwitchPrimitive.Root
        checked={isDark}
        onCheckedChange={toggleTheme}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          isDark ? 'bg-primary' : 'bg-input'
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
            isDark ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>
      <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
