import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    value?: string | number;
    defaultValue?: string | number;
    options?: SelectOption[];
    children?: React.ReactNode;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
    align?: 'start' | 'end' | 'center';
    side?: 'top' | 'bottom';
    className?: string; // Applied to trigger button
    containerClassName?: string;
    contentClassName?: string;
    itemClassName?: string;
    onChange?: (e: { target: { value: string; name?: string } }) => void;
    onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<any, SelectProps>(
    (
        {
            value: controlledValue,
            defaultValue,
            options,
            children,
            placeholder,
            disabled = false,
            name,
            id,
            align = 'start',
            side = 'bottom',
            className,
            containerClassName,
            contentClassName,
            itemClassName,
            onChange,
            onValueChange,
            ...props
        },
        ref
    ) => {
        // Extract options from props.options or props.children (<option>)
        const parsedOptions: SelectOption[] = React.useMemo(() => {
            if (options && options.length > 0) return options;
            const items: SelectOption[] = [];
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    const childProps = child.props as any;
                    if (childProps && (childProps.value !== undefined || child.type === 'option')) {
                        items.push({
                            value: childProps.value !== undefined ? childProps.value : childProps.children,
                            label: childProps.children !== undefined ? childProps.children : String(childProps.value),
                            disabled: childProps.disabled,
                        });
                    }
                }
            });
            return items;
        }, [options, children]);

        const [isOpen, setIsOpen] = React.useState(false);
        const [uncontrolledValue, setUncontrolledValue] = React.useState<string | number>(() => {
            if (defaultValue !== undefined) return defaultValue;
            if (placeholder) return '';
            return parsedOptions[0]?.value ?? '';
        });

        const isControlled = controlledValue !== undefined;
        const currentValue = isControlled ? controlledValue : uncontrolledValue;

        const containerRef = React.useRef<HTMLDivElement>(null);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        // Forward ref to trigger button
        React.useImperativeHandle(ref, () => triggerRef.current);

        // Close on outside click or Escape
        React.useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setIsOpen(false);
                }
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape' && isOpen) {
                    setIsOpen(false);
                    triggerRef.current?.focus();
                }
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('keydown', handleKeyDown);
            }
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [isOpen]);

        const selectedOption = parsedOptions.find(
            (opt) => String(opt.value) === String(currentValue)
        );

        const displayText = selectedOption
            ? selectedOption.label
            : (placeholder || (parsedOptions[0]?.label ?? 'Select...'));

        const handleSelect = (val: string | number) => {
            if (!isControlled) {
                setUncontrolledValue(val);
            }
            setIsOpen(false);
            const strVal = String(val);
            onChange?.({ target: { value: strVal, name } });
            onValueChange?.(strVal);
            triggerRef.current?.focus();
        };

        const positionClasses: Record<string, string> = {
            'bottom-start': 'top-full left-0 mt-1.5 origin-top-left',
            'bottom-end': 'top-full right-0 mt-1.5 origin-top-right',
            'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-1.5 origin-top',
            'top-start': 'bottom-full left-0 mb-1.5 origin-bottom-left',
            'top-end': 'bottom-full right-0 mb-1.5 origin-bottom-right',
            'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-1.5 origin-bottom',
        };

        const posKey = `${side}-${align}`;
        const chosenPos = positionClasses[posKey] || positionClasses['bottom-start'];

        return (
            <div
                ref={containerRef}
                className={cn('relative inline-block text-left', containerClassName)}
                {...props}
            >
                {/* Hidden input for native forms */}
                {name && <input type="hidden" name={name} value={currentValue ?? ''} />}

                <button
                    ref={triggerRef}
                    id={id}
                    type="button"
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-all',
                        'hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                        isOpen && 'ring-1 ring-primary/60 border-primary/60 bg-secondary/30',
                        'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none',
                        className
                    )}
                >
                    <span className="truncate text-left font-medium">{displayText}</span>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 shrink-0 opacity-60 transition-transform duration-200',
                            isOpen && 'rotate-180 opacity-100 text-primary'
                        )}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            role="listbox"
                            initial={{ opacity: 0, scale: 0.96, y: side === 'top' ? 4 : -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: side === 'top' ? 4 : -4 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className={cn(
                                'absolute z-50 min-w-full w-max max-w-xs overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur-xl p-1 text-card-foreground shadow-2xl',
                                chosenPos,
                                contentClassName
                            )}
                        >
                            <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5 scrollbar-thin">
                                {parsedOptions.map((opt, idx) => {
                                    const isSelected = String(opt.value) === String(currentValue);
                                    return (
                                        <button
                                            key={`${opt.value}-${idx}`}
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            disabled={opt.disabled}
                                            onClick={() => handleSelect(opt.value)}
                                            className={cn(
                                                'flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-colors text-left',
                                                isSelected
                                                    ? 'bg-primary/15 text-primary font-bold'
                                                    : 'text-foreground/90 hover:bg-secondary hover:text-foreground',
                                                opt.disabled && 'pointer-events-none opacity-40',
                                                itemClassName
                                            )}
                                        >
                                            <span className="truncate pr-2">{opt.label}</span>
                                            {isSelected && (
                                                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);
Select.displayName = 'Select';
