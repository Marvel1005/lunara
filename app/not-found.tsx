import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="w-16 h-16 rounded-3xl bg-lunara-lavender/50 flex items-center justify-center mb-6 text-2xl shadow-soft">
        <Compass className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-fg max-w-sm mb-8 text-sm leading-relaxed">
        The sanctuary page you are looking for might have moved or doesn&apos;t exist yet.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-fg text-sm font-medium shadow-comfort hover:opacity-95 transition-all"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
