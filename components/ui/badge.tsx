import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  dotClassName?: string;
  disabled?: boolean;
}

export interface BadgeButtonProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeButtonVariants> {
  asChild?: boolean;
}

export type BadgeDotProps = React.HTMLAttributes<HTMLSpanElement>;

const badgeVariants = cva(
  'inline-flex items-center justify-center border font-medium focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        info: 'bg-info text-info-foreground',
        mono: 'bg-mono text-mono-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      appearance: {
        solid: 'border-transparent',
        outline: '',
        light: '',
        stroke: 'bg-transparent border border-border text-secondary-foreground',
        ghost: 'border-transparent bg-transparent',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
      },
      size: {
        lg: 'rounded-md px-[0.5rem] h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5',
        md: 'rounded-md px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5 ',
        sm: 'rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3',
        xs: 'rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        appearance: 'outline',
        className: 'bg-primary/5 border-primary/20 text-primary-darker',
      },
      {
        variant: 'secondary',
        appearance: 'outline',
        className:
          'bg-secondary/40 border-secondary-darker text-secondary-foreground',
      },
      {
        variant: 'success',
        appearance: 'outline',
        className: 'bg-success/5 border-success/20 text-success-darker',
      },
      {
        variant: 'warning',
        appearance: 'outline',
        className: 'bg-warning/5 border-warning/20 text-warning-darker',
      },
      {
        variant: 'info',
        appearance: 'outline',
        className: 'bg-info/5 border-info/20 text-info-darker',
      },
      {
        variant: 'mono',
        appearance: 'outline',
        className: 'bg-mono/10 border-mono/20 text-mono-darker',
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className:
          'bg-destructive/5 border-destructive/20 text-destructive-darker',
      },

      {
        variant: 'primary',
        appearance: 'light',
        className: 'bg-primary/10 border-0 text-primary-darker',
      },
      {
        variant: 'secondary',
        appearance: 'light',
        className: 'bg-secondary/60 border-0 text-secondary-foreground',
      },
      {
        variant: 'success',
        appearance: 'light',
        className: 'bg-success/10 border-0 text-success-darker',
      },
      {
        variant: 'warning',
        appearance: 'light',
        className: 'bg-warning/10 border-0 text-warning-darker',
      },
      {
        variant: 'info',
        appearance: 'light',
        className: 'bg-info/10 border-0 text-info-darker',
      },
      {
        variant: 'mono',
        appearance: 'light',
        className: 'bg-mono/10 border-0 text-mono-darker',
      },
      {
        variant: 'destructive',
        appearance: 'light',
        className: 'bg-destructive/10 border-0 text-destructive-darker',
      },

      {
        variant: 'primary',
        appearance: 'ghost',
        className: 'text-primary-darker',
      },
      {
        variant: 'secondary',
        appearance: 'ghost',
        className: 'text-accent-foreground',
      },
      {
        variant: 'success',
        appearance: 'ghost',
        className: 'text-success-darker',
      },
      {
        variant: 'warning',
        appearance: 'ghost',
        className: 'text-warning-darker',
      },
      { variant: 'info', appearance: 'ghost', className: 'text-info-darker' },
      { variant: 'mono', appearance: 'ghost', className: 'text-mono-darker' },
      {
        variant: 'destructive',
        appearance: 'ghost',
        className: 'text-destructive-darker',
      },

      { size: 'lg', appearance: 'ghost', className: 'px-0' },
      { size: 'md', appearance: 'ghost', className: 'px-0' },
      { size: 'sm', appearance: 'ghost', className: 'px-0' },
      { size: 'xs', appearance: 'ghost', className: 'px-0' },
    ],
    defaultVariants: {
      variant: 'secondary',
      appearance: 'solid',
      size: 'md',
    },
  },
);

const badgeButtonVariants = cva(
  'cursor-pointer transition-all inline-flex items-center justify-center leading-none size-3.5 [&>svg]:opacity-100! [&>svg]:size-3.5 p-0 rounded-md -me-0.5 opacity-60 hover:opacity-100',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  size,
  appearance,
  shape,
  asChild = false,
  disabled,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, appearance, shape, disabled }),
        className,
      )}
      {...props}
    />
  );
}

function BadgeButton({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeButtonProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge-button"
      className={cn(badgeButtonVariants({ variant, className }))}
      role="button"
      {...props}
    />
  );
}

function BadgeDot({ className, ...props }: BadgeDotProps) {
  return (
    <span
      data-slot="badge-dot"
      className={cn(
        'size-1.5 rounded-full bg-[currentColor] opacity-75',
        className,
      )}
      {...props}
    />
  );
}

export { Badge, BadgeButton, BadgeDot, badgeVariants };
