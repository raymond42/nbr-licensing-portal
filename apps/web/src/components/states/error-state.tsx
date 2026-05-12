interface ErrorStateProps {
  title?: string;
  description?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  message,
  onRetry,
}: ErrorStateProps) {
  const desc =
    message ??
    description ??
    'Please try again. If the issue persists, contact your administrator.';
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
      <p className="font-medium text-red-800">{title}</p>
      <p className="mt-1 text-red-700">{desc}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
