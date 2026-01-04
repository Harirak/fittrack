// Responsive container that adapts to mobile, tablet, and desktop
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* 
        Responsive container:
        - Mobile: Full width with subtle border
        - Tablet (md): Max 768px centered with borders
        - Desktop (lg): Max 1024px centered with borders
        - Large Desktop (xl): Max 1280px centered with borders
      */}
      <div className="mx-auto min-h-screen w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl md:border-x md:border-border">
        {children}
      </div>
    </div>
  );
}
