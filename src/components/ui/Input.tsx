"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode; // ej: selector de país
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, className = "", id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--muted)]"
          >
            {label}
          </label>
        )}
        <div className="flex items-stretch">
          {prefix && (
            <div className="flex items-center px-3 rounded-l-xl border border-r-0 border-[var(--border)] bg-[var(--bg2)] text-[var(--dim)] text-sm shrink-0">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={[
              "w-full px-4 py-2.5 text-sm bg-[var(--bg2)] text-[var(--text)]",
              "border border-[var(--border)] outline-none transition-colors",
              "placeholder:text-[var(--dim)]",
              "focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)]",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "",
              prefix ? "rounded-r-xl" : "rounded-xl",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--dim)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
