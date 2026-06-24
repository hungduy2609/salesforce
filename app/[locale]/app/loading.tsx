import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function Loading() {
  return (
    <div className="route-loading" data-testid="route-loading-app">
      <LoadingIndicator label="" size="lg" />
    </div>
  );
}
