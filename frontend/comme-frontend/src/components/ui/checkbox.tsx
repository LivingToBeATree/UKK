import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
        };

        return (
            <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    onChange={handleChange}
                    className="sr-only peer"
                    {...props}
                />
                <div
                    className={cn(
                        'h-4 w-4 shrink-0 rounded border border-border bg-background transition-all',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500 peer-focus-visible:ring-offset-1',
                        'peer-checked:bg-purple-600 peer-checked:border-purple-600 peer-checked:text-white',
                        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                        'flex items-center justify-center',
                        className
                    )}
                >
                    {checked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
            </label>
        );
    }
);
Checkbox.displayName = 'Checkbox';
