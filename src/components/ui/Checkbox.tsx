"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={[
              "mt-0.5 w-4 h-4 shrink-0 rounded border border-[var(--border)]",
              "bg-[var(--bg2)] text-[var(--blue)] cursor-pointer",
              "focus:ring-[var(--blue)] focus:ring-offset-0",
              error ? "border-red-500" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          <span className="text-sm text-[var(--muted)] group-hover:text-[var(--text)] transition-colors leading-relaxed">
            {label}
          </span>
        </label>
        {error && <p className="text-xs text-red-400 ml-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
