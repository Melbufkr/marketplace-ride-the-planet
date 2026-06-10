"use client";

import { type SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = "", id: idProp, ...props },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--muted)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={[
            "w-full px-4 py-2.5 text-sm bg-[var(--bg2)] text-[var(--text)]",
            "border border-[var(--border)] rounded-xl outline-none transition-colors",
            "focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)]",
            "appearance-none cursor-pointer",
            error ? "border-red-500" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235a7a94' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "36px",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--dim)]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
