import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';

export const viewport: Viewport = {
  themeColor: '#4A1942',
};

export const metadata: Metadata = {
  title: 'Lunara — Your cycle. Your comfort.',
  description: 'A premium personal menstrual-cycle and wellness companion.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'Lunara — Your cycle. Your comfort.',
    description: 'A premium personal menstrual-cycle and wellness companion.',
    images: [{ url: '/icon.png' }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-lunara-rose selection:text-lunara-plum">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

