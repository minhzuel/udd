import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const alertVariants = cva(
  'flex items-stretch w-full gap-2 group-[.toaster]:w-(--width)',
  {
    variants: {
      variant: {
        default: '',
        primary: '',
        destructive: '',
        success: '',
        info: '',
        mono: '',
        warning: '',
      },
      icon: {
        primary: '',
        destructive: '',
        success: '',
        info: '',
        warning: '',
      },
      appearance: {
        solid: '',
        outline: '',
        soft: '',
        stroke: 'text-foreground',
      },
      size: {
        lg: 'rounded-lg p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-slot=alert-icon:mt-0 *:data-slot=alert-close:mt-0.5 *:data-slot=alert-close:-me-0.5',
        md: 'rounded-lg p-3.5 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-slot=alert-icon:mt-0 *:data-slot=alert-close:-me-0.5',
        sm: 'rounded-md px-3 py-2.5 gap-2 text-[0.8125rem] leading-[--text-sm--line-height] [&>[data-slot=alert-icon]>svg]:size-4 *:data-alert-icon:mt-0.5 *:data-slot=alert-close:-me-0.5 [&>[data-slot=alert-close]>svg]:size-3.5!',
        xs: 'rounded-md p-2 gap-1.5 text-xs [&>[data-slot=alert-icon]>svg]:size-4 *:data-slot=alert-icon:mt-0.5 [&>[data-slot=alert-title]]:pt-0.5	*:data-slot=alert-close:-me-0.5 [&>[data-slot=alert-close]>svg]:size-3.5!',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        appearance: 'solid',
        className:
          'bg-muted text-foreground *:data-alert-close:text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'solid',
        className:
          'bg-primary text-primary-foreground *:data-alert-close:text-primary-foreground',
      },
      {
        variant: 'destructive',
        appearance: 'solid',
        className:
          'bg-destructive text-destructive-foreground *:data-alert-close:text-destructive-foreground',
      },
      {
        variant: 'success',
        appearance: 'solid',
        className:
          'bg-success text-success-foreground *:data-alert-close:text-success-foreground',
      },
      {
        variant: 'info',
        appearance: 'solid',
        className:
          'bg-info text-info-foreground *:data-alert-close:text-info-foreground',
      },
      {
        variant: 'warning',
        appearance: 'solid',
        className:
          'bg-warning text-warning-foreground *:data-alert-close:text-warning-foreground',
      },
      {
        variant: 'mono',
        appearance: 'solid',
        className:
          'bg-mono text-mono-foreground *:data-alert-close:text-mono-foreground',
      },

      {
        variant: 'default',
        appearance: 'outline',
        className:
          'border border-border bg-background text-foreground *:data-alert-close:text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'outline',
        className:
          'border border-border bg-background text-primary *:data-alert-close:text-foreground',
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className:
          'border border-border bg-background text-destructive *:data-alert-close:text-foreground',
      },
      {
        variant: 'success',
        appearance: 'outline',
        className:
          'border border-border bg-background text-success *:data-alert-close:text-foreground',
      },
      {
        variant: 'info',
        appearance: 'outline',
        className:
          'border border-border bg-background text-info *:data-alert-close:text-foreground',
      },
      {
        variant: 'warning',
        appearance: 'outline',
        className:
          'border border-border bg-background text-warning *:data-alert-close:text-foreground',
      },
      {
        variant: 'mono',
        appearance: 'outline',
        className:
          'border border-border bg-background text-mono *:data-alert-close:text-foreground',
      },

      {
        variant: 'default',
        appearance: 'stroke',
        className:
          'border border-border bg-background [&>div:first-of-type>svg]:text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'stroke',
        className:
          'border border-border bg-background [&>div:first-of-type>svg]:text-primary',
      },
      {
        variant: 'destructive',
        appearance: 'stroke',
        className:
          'border border-border bg-background [&>div:first-of-type>svg]:text-destructive',
      },
      {
        variant: 'success',
        appearance: 'stroke',
        className:
          'border border-borde bg-background [&>div:first-of-type>svg]:text-success',
      },
      {
        variant: 'info',
        appearance: 'stroke',
        className:
          'border border-border bg-background [&>div:first-of-type>svg]:text-info',
      },
      {
        variant: 'warning',
        appearance: 'stroke',
        className:
          'border border-border bg-background [&>div:first-of-type>svg]:text-warning',
      },
      {
        variant: 'mono',
        appearance: 'stroke',
        className:
          'border border-border bg-background [&>div:first-of-type>svg]:text-mono',
      },

      {
        variant: 'default',
        appearance: 'soft',
        className: 'bg-muted border border-border text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'soft',
        className:
          'bg-primary/5 border border-primary/10 text-foreground [&>div:first-of-type>svg]:text-primary',
      },
      {
        variant: 'destructive',
        appearance: 'soft',
        className:
          'bg-destructive/5 border border-destructive/10 text-foreground [&>div:first-of-type>svg]:text-destructive',
      },
      {
        variant: 'success',
        appearance: 'soft',
        className:
          'bg-success/5 border border-success/20 text-foreground [&>div:first-of-type>svg]:text-success',
      },
      {
        variant: 'info',
        appearance: 'soft',
        className:
          'bg-info/5 border border-info/10 text-foreground [&>div:first-of-type>svg]:text-info',
      },
      {
        variant: 'warning',
        appearance: 'soft',
        className:
          'bg-warning/5 border border-warning/20 text-foreground [&>div:first-of-type>svg]:text-warning',
      },
      {
        variant: 'mono',
        appearance: 'soft',
        className:
          'bg-mono/5 border border-mono/10 text-foreground [&>div:first-of-type>svg]:text-mono',
      },

      {
        variant: 'mono',
        icon: 'primary',
        className: '[&>div:first-of-type>svg]:text-primary',
      },
      {
        variant: 'mono',
        icon: 'warning',
        className: '[&>div:first-of-type>svg]:text-warning',
      },
      {
        variant: 'mono',
        icon: 'success',
        className: '[&>div:first-of-type>svg]:text-success',
      },
      {
        variant: 'mono',
        icon: 'destructive',
        className: '[&>div:first-of-type>svg]:text-destructive',
      },
      {
        variant: 'mono',
        icon: 'info',
        className: '[&>div:first-of-type>svg]:text-info',
      },
    ],
    defaultVariants: {
      variant: 'default',
      appearance: 'solid',
      size: 'md',
    },
  },
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  close?: boolean;
  onClose?: () => void;
}

interface AlertIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({
  className,
  variant,
  size,
  icon,
  appearance,
  close = false,
  onClose,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant, size, icon, appearance }),
        className,
      )}
      {...props}
    >
      {children}
      {close && (
        <Button
          size="xs"
          variant="inverse"
          mode="icon"
          onClick={onClose}
          aria-label="Dismiss"
          data-alert-close="true"
          className={cn('group shrink-0 size-5')}
        >
          <X className="opacity-60! group-hover:opacity-100! size-4!" />
        </Button>
      )}
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('grow tracking-tight', className)}
      {...props}
    />
  );
}

function AlertIcon({ children, className, ...props }: AlertIconProps) {
  return (
    <div
      data-slot="alert-icon"
      className={cn('shrink-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertToolbar({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot="alert-toolbar" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-sm [&_p]:leading-relaxed [&_p]:mb-2', className)}
      {...props}
    />
  );
}

function AlertContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-content"
      className={cn(
        'space-y-2 [&_[data-slot=alert-title]]:font-semibold',
        className,
      )}
      {...props}
    />
  );
}

export {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
};
