import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-gray-900">Unauthorized</h1>
      <p className="mt-2 text-gray-600">
        You do not have permission to view this page. If you believe this is an error, contact your
        administrator.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-brand hover:underline">
        Go to home
      </Link>
    </main>
  );
}
