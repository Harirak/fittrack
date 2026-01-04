'use client';

// Bottom navigation bar with gradient active state - Responsive design
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/exercises', label: 'Exercises', icon: Search },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Responsive nav container matching header width */}
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium transition-colors md:py-4 md:text-sm',
                  isActive
                    ? 'bg-gradient-to-t from-brand-forest/10 to-transparent text-brand-forest'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'mb-1 h-5 w-5 transition-all md:h-6 md:w-6',
                    isActive && 'scale-110 text-brand-forest'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
