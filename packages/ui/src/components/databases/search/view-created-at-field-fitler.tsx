import { ChevronDown, Trash2 } from 'lucide-react';

import {
  CreatedAtFieldAttributes,
  DatabaseViewFieldFilterAttributes,
} from '@brainbox/core';
import { FieldIcon } from '@brainbox/ui/components/databases/fields/field-icon';
import { Button } from '@brainbox/ui/components/ui/button';
import { DatePicker } from '@brainbox/ui/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@brainbox/ui/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brainbox/ui/components/ui/popover';
import { useDatabaseView } from '@brainbox/ui/contexts/database-view';
import { createdAtFieldFilterOperators } from '@brainbox/ui/lib/databases';

interface ViewCreatedAtFieldFilterProps {
  field: CreatedAtFieldAttributes;
  filter: DatabaseViewFieldFilterAttributes;
}

export const ViewCreatedAtFieldFilter = ({
  field,
  filter,
}: ViewCreatedAtFieldFilterProps) => {
  const view = useDatabaseView();

  const operator =
    createdAtFieldFilterOperators.find(
      (operator) => operator.value === filter.operator
    ) ?? createdAtFieldFilterOperators[0];

  if (!operator) {
    return null;
  }

  const dateTextValue = (filter.value as string) ?? null;
  const dateValue = dateTextValue ? new Date(dateTextValue) : null;

  return (
    <Popover
      open={view.isFieldFilterOpened(filter.id)}
      onOpenChange={() => {
        if (view.isFieldFilterOpened(filter.id)) {
          view.closeFieldFilter(filter.id);
        } else {
          view.openFieldFilter(filter.id);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-dashed text-xs text-muted-foreground"
        >
          {field.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-96 flex-col gap-2 p-2">
        <div className="flex flex-row items-center gap-3 text-sm">
          <div className="flex flex-row items-center gap-0.5 p-1">
            <FieldIcon type={field.type} className="size-4" />
            <p>{field.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-grow flex-row items-center gap-1 rounded-md p-1 font-semibold cursor-pointer hover:bg-gray-100">
                <p>{operator.label}</p>
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {createdAtFieldFilterOperators.map((operator) => (
                <DropdownMenuItem
                  key={operator.value}
                  onSelect={() => {
                    const value = dateValue?.toISOString();
                    view.updateFilter(filter.id, {
                      ...filter,
                      operator: operator.value,
                      value: value ?? null,
                    });
                  }}
                >
                  {operator.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              view.removeFilter(filter.id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <DatePicker
          value={dateValue}
          onChange={(newValue) => {
            if (newValue === null || newValue === undefined) {
              view.updateFilter(filter.id, {
                ...filter,
                value: null,
              });
            } else {
              view.updateFilter(filter.id, {
                ...filter,
                value: newValue.toISOString(),
              });
            }
          }}
          placeholder="Select date"
          className="flex h-full w-full cursor-pointer flex-row items-center gap-1 rounded-md border border-input p-2 text-sm"
        />
      </PopoverContent>
    </Popover>
  );
};
