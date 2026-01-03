// Mobile-optimized container with max-width constraint
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <div className="mx-auto max-w-md min-h-screen border-x border-border">
        {children}
      </div>
    </div>
  );
}
