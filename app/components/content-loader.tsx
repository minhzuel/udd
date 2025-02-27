import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinners';

export const ContentLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn('flex items-center justify-center grow w-full', className)}
    >
      <div className="flex items-center gap-2.5">
        <Spinner className="animate-spin text-muted-foreground opacity-50" />
        <span className="text-muted-foreground font-medium text-sm">
          Loading...
        </span>
      </div>
    </div>
  );
};
