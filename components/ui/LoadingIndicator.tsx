type LoadingIndicatorProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingIndicator({ label = "Loading...", size = "md" }: LoadingIndicatorProps) {
  return (
    <span className={`loading-indicator loading-indicator-${size}`} role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
