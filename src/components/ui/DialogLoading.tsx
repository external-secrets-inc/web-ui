
import { Loader } from './Loader';
import { useLoading } from '@/context/LoadingContext';
import { cn } from '@/lib/utils';

interface DialogLoadingProps {
  className?: string;
}

export function DialogLoading({ className }: DialogLoadingProps) {
  const { isDialogLoading } = useLoading();

  if (!isDialogLoading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader size="md" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
