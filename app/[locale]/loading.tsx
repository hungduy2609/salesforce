import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function Loading() {
  return (
    <main className="route-loading" data-testid="route-loading">
      <LoadingIndicator label="" size="lg" />
    </main>
  );
}
