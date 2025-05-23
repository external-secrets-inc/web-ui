import { ReactNode } from "react";

interface AuthCommonSectionProps {
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
}

export function AuthCommonSection({
  title,
  description,
  children,
  ariaLabel,
}: AuthCommonSectionProps) {
  return (
    <section className="grid gap-6" aria-label={ariaLabel}>
      <header className="grid gap-1">
        <h1 className="text-lg sm:text-3xl font-bold">{title}</h1>
        <h2 className="text-sm sm:text-base text-pretty text-muted-foreground">
          {description}
        </h2>
      </header>
      {children}
    </section>
  );
}
