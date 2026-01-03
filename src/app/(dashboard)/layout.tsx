// Dashboard layout with header and bottom navigation
import { MobileContainer } from '@/components/layout/MobileContainer';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer>
      <Header />
      <main className="min-h-[calc(100vh-7rem)] pb-20">
        {children}
      </main>
      <BottomNav />
    </MobileContainer>
  );
}
