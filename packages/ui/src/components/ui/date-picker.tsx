import { useState } from 'react';

import { toUTCDate } from '@brainbox/core';
import { Calendar } from '@brainbox/ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brainbox/ui/components/ui/popover';
import { cn } from '@brainbox/ui/lib/utils';

interface DatePickerProps {
  value: Date | null;
  className?: string;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  readonly?: boolean;
}

export const DatePicker = ({
  value,
  className,
  onChange,
  placeholder,
  readonly,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const dateObj = value ? new Date(value) : undefined;
  const placeHolderText = placeholder ?? '';

  if (readonly) {
    return (
      <div
        className={cn(!dateObj && 'text-sm text-muted-foreground', className)}
      >
        {dateObj ? dateObj.toLocaleDateString() : ''}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <div
          className={cn(!dateObj && 'text-sm text-muted-foreground', className)}
        >
          {dateObj ? dateObj.toLocaleDateString() : placeHolderText}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateObj ?? undefined}
          onSelect={(date) => {
            if (!date) {
              onChange(null);
            } else {
              onChange(toUTCDate(date));
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
