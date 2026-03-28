import {
  Children,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

const baseStyles =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const variantStyles = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
} as const;

const sizeStyles = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
  "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "size-8 p-0",
  "icon-lg": "size-10",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  size?: keyof typeof sizeStyles;
  variant?: keyof typeof variantStyles;
};

export function buttonVariants({
  className,
  size = "default",
  variant = "default",
}: Pick<ButtonProps, "className" | "size" | "variant"> = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export function Button({
  asChild = false,
  children,
  className,
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  const classes = buttonVariants({ className, size, variant });

  if (asChild) {
    const child = Children.only(children);
    if (isValidElement(child)) {
      const element = child as ReactElement<{ className?: string }>;

      return cloneElement(element, {
        className: cn(classes, element.props.className),
      });
    }
  }

  return (
    <button
      data-size={size}
      data-slot="button"
      data-variant={variant}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
