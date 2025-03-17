
import { Loader } from './Loader';
import { useLoading } from '@/context/LoadingContext';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  className?: string;
}

export function PageLoading({ className }: PageLoadingProps) {
  const { isPageLoading } = useLoading();

  if (!isPageLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        "pt-16", // Avoid overlapping with the topbar
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader size="lg" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
