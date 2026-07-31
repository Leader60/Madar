import type { ReactNode, CSSProperties } from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "gold" | "ghost" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-navy text-primary-foreground hover:bg-navy-deep disabled:opacity-50",
    gold: "bg-gold text-accent-foreground hover:bg-gold-deep disabled:opacity-50",
    ghost: "bg-transparent text-navy hover:bg-secondary",
    outline: "border border-navy/30 text-navy hover:bg-secondary",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "rounded-lg border border-border bg-card shadow-sm",
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Deterministic editorial thumbnail art keyed by hue (no external images).
export function ThumbArt({
  hue,
  label,
  className,
  style,
}: {
  hue: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const bg = `linear-gradient(135deg, oklch(0.32 0.07 262) 0%, oklch(0.55 0.13 ${hue}) 100%)`;
  return (
    <div
      className={cx(
        "relative flex items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: bg, ...style }}
      aria-hidden={label ? undefined : true}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(1 0 0 / 0.14) 0 2px, transparent 2px 14px)",
        }}
      />
      <span className="relative text-gold" style={{ opacity: 0.9 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="9" ry="4" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <span className="h-6 w-1.5 rounded-full bg-gold" />
      <h2 className="text-xl font-bold text-navy">{children}</h2>
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-navy/8 px-2.5 py-0.5 text-xs font-bold text-navy">
      {children}
    </span>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
