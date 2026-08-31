import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0' +
    ' hover:shadow-lg active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
  {
    variants: {
      variant: {
        default:
          'relative overflow-hidden border border-primary-border bg-primary text-primary-foreground shadow-[0_0_15px_-3px_rgba(124,58,237,0.4)] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:-translate-y-0.5 hover:shadow-[0_0_25px_-3px_rgba(124,58,237,0.6)] hover:after:animate-[shimmer_850ms_ease-out_1] active:translate-y-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:after:animate-none',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm border-destructive-border hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
        outline:
          'border [border-color:var(--button-outline)] shadow-sm active:shadow-none hover:bg-white/5 hover:border-white/10 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
        secondary:
          'border bg-secondary text-secondary-foreground border border-secondary-border hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
        ghost: 'border border-transparent hover:bg-white/5 hover:text-white',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        premium: 'relative overflow-hidden border border-white/10 bg-gradient-to-r from-primary via-[#a855f7] to-[#DCBBE5] text-white shadow-[0_10px_30px_-12px_rgba(224,188,231,0.55)] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(224,188,231,0.7)] hover:after:animate-[shimmer_850ms_ease-out_1] active:translate-y-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:after:animate-none'
      },
      size: {
        default: 'min-h-9 px-4 py-2',
        sm: 'min-h-8 rounded-md px-3 text-xs',
        lg: 'min-h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
