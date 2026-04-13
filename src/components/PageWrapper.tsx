'use client';

import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcluded = pathname?.startsWith('/admin') || pathname === '/login';

  return (
    <main className={`flex-grow ${!isExcluded ? 'pt-16' : ''}`}>
      {children}
    </main>
  );
}
