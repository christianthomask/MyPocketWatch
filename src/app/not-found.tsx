import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-accent mb-4">404</p>
        <p className="text-text-muted mb-6">Page not found</p>
        <Link
          href="/"
          className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-background"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
