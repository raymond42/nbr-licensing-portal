import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you requested does not exist.</p>
      <Link href="/" className="mt-6 text-sm font-medium text-brand hover:underline">
        Go to home
      </Link>
    </main>
  );
}
