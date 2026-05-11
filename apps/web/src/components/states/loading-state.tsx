interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-40 items-center justify-center text-sm text-gray-500"
    >
      {label}
    </div>
  );
}
