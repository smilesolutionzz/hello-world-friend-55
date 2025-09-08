import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href: string;
  children: string;
  className?: string;
}

const SkipLink = ({ href, children, className }: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50",
        "bg-primary text-primary-foreground px-4 py-2 rounded-md",
        "font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
};

export { SkipLink };