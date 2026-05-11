export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-brand-dark">
        NBR Licensing Portal
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Regulatory workflow and compliance management for licensing applications.
      </p>
      <a
        href="/login"
        className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Sign in
      </a>
    </main>
  );
}
