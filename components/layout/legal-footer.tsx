import Link from 'next/link';

export function LegalFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`text-center text-[11px] text-muted-fg py-6 ${className}`}>
      <nav aria-label="Legal" className="flex items-center justify-center gap-4">
        <Link href="/privacy" className="hover:text-foreground hover:underline">
          Privacy
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/terms" className="hover:text-foreground hover:underline">
          Terms
        </Link>
      </nav>
      <p className="mt-2">© {new Date().getFullYear()} Lunara</p>
    </footer>
  );
}
