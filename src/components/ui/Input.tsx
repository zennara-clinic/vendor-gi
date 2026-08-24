import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  size?: 'md' | 'lg';
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, success, leading, trailing, size = 'md', className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-body-sm font-medium text-ink-700">
          {label}
          {props.required && <span className="text-error-600"> *</span>}
        </label>
      )}
      <div className="relative">
        {leading && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 [&>svg]:h-5 [&>svg]:w-5">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'w-full rounded-md bg-white text-body text-ink-900 border px-3 outline-none transition-[box-shadow,border-color] duration-[120ms]',
            size === 'lg' ? 'h-12' : 'h-11',
            error ? 'border-error-600 focus:ring-[3px] focus:ring-error-50' : 'border-border-input focus:border-accent-600 focus:ring-[3px] focus:ring-accent-100',
            'disabled:bg-cream-200 disabled:text-ink-400 disabled:border-border-strong',
            leading && 'pl-10',
            (trailing || success || error) && 'pr-10',
          )}
          {...props}
        />
        {(success || error || trailing) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {error ? <AlertCircle className="h-4 w-4 text-error-600" /> : success ? <CheckCircle2 className="h-4 w-4 text-success-600" /> : trailing}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-caption text-error-700">{error}</p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-caption text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, Pick<FieldProps, 'label' | 'hint' | 'error'> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label htmlFor={inputId} className="text-body-sm font-medium text-ink-700">{label}</label>}
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={cn(
          'w-full min-h-24 rounded-md bg-white text-body text-ink-900 border px-3 py-2.5 outline-none transition-[box-shadow,border-color] duration-[120ms] resize-y',
          error ? 'border-error-600' : 'border-border-input focus:border-accent-600 focus:ring-[3px] focus:ring-accent-100',
        )}
        {...props}
      />
      {error ? <p className="text-caption text-error-700">{error}</p> : hint ? <p className="text-caption text-ink-500">{hint}</p> : null}
    </div>
  );
});

export function Select({ label, error, className, children, id, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label htmlFor={selectId} className="text-body-sm font-medium text-ink-700">{label}</label>}
      <select
        id={selectId}
        className={cn(
          'h-11 w-full rounded-md bg-white border border-border-input px-3 text-body text-ink-900 outline-none focus:border-accent-600 focus:ring-[3px] focus:ring-accent-100 appearance-none',
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234F3F2D%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_12px_center] pr-9",
          error && 'border-error-600',
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-caption text-error-700">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2.5 cursor-pointer text-body text-ink-700 select-none', className)}>
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 shrink-0 rounded-xs border border-border-input accent-accent-600 cursor-pointer"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function Radio({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2.5 cursor-pointer text-body text-ink-700 select-none', className)}>
      <input id={id} type="radio" className="h-4 w-4 shrink-0 border border-border-input accent-accent-600 cursor-pointer" {...props} />
      <span>{label}</span>
    </label>
  );
}
