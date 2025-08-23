import { ChevronDown, Trash2 } from 'lucide-react';

import {
  SelectFieldAttributes,
  DatabaseViewFieldFilterAttributes,
} from '@brainbox/core';
import { FieldIcon } from '@brainbox/ui/components/databases/fields/field-icon';
import { SelectFieldOptions } from '@brainbox/ui/components/databases/fields/select-field-options';
import { SelectOptionBadge } from '@brainbox/ui/components/databases/fields/select-option-badge';
import { Button } from '@brainbox/ui/components/ui/button';
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
import { selectFieldFilterOperators } from '@brainbox/ui/lib/databases';

interface ViewSelectFieldFilterProps {
  field: SelectFieldAttributes;
  filter: DatabaseViewFieldFilterAttributes;
}

const isOperatorWithoutValue = (operator: string) => {
  return operator === 'is_empty' || operator === 'is_not_empty';
};

export const ViewSelectFieldFilter = ({
  field,
  filter,
}: ViewSelectFieldFilterProps) => {
  const view = useDatabaseView();
  const selectOptions = Object.values(field.options ?? {});
  const operator =
    selectFieldFilterOperators.find(
      (operator) => operator.value === filter.operator
    ) ?? selectFieldFilterOperators[0];

  if (!operator) {
    return null;
  }

  const selectOptionIds = (filter.value as string[]) ?? [];
  const selectedOptions = selectOptions.filter((option) =>
    selectOptionIds.includes(option.id)
  );

  const hideInput = isOperatorWithoutValue(operator.value);

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
              {selectFieldFilterOperators.map((operator) => (
                <DropdownMenuItem
                  key={operator.value}
                  onSelect={() => {
                    const value = isOperatorWithoutValue(operator.value)
                      ? []
                      : selectOptionIds;

                    view.updateFilter(filter.id, {
                      ...filter,
                      operator: operator.value,
                      value: value,
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
        {!hideInput && (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex h-full w-full cursor-pointer flex-row items-center gap-1 rounded-md border border-input p-2">
                {selectedOptions.map((option) => (
                  <SelectOptionBadge
                    key={option.id}
                    name={option.name}
                    color={option.color}
                  />
                ))}
                {selectedOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No options selected
                  </p>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-1">
              <SelectFieldOptions
                field={field}
                values={selectOptionIds}
                onSelect={(id) => {
                  const value = selectOptionIds.includes(id)
                    ? selectOptionIds.filter((optionId) => optionId !== id)
                    : [...selectOptionIds, id];

                  view.updateFilter(filter.id, {
                    ...filter,
                    value: value,
                  });
                }}
                allowAdd={false}
              />
            </PopoverContent>
          </Popover>
        )}
      </PopoverContent>
    </Popover>
  );
};
