import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          <Coffee className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-lg font-bold text-foreground">BrewLog</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
