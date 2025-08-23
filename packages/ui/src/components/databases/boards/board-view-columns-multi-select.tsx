import { CircleDashed } from 'lucide-react';
import { toast } from 'sonner';

import {
  DatabaseViewFilterAttributes,
  FieldValue,
  MultiSelectFieldAttributes,
  SelectOptionAttributes,
} from '@brainbox/core';
import { BoardViewColumn } from '@brainbox/ui/components/databases/boards/board-view-column';
import { SelectOptionBadge } from '@brainbox/ui/components/databases/fields/select-option-badge';
import { BoardViewContext } from '@brainbox/ui/contexts/board-view';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { useDatabaseView } from '@brainbox/ui/contexts/database-view';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { getSelectOptionLightColorClass } from '@brainbox/ui/lib/databases';

interface BoardViewColumnsMultiSelectProps {
  field: MultiSelectFieldAttributes;
}

export const BoardViewColumnsMultiSelect = ({
  field,
}: BoardViewColumnsMultiSelectProps) => {
  const workspace = useWorkspace();
  const database = useDatabase();
  const view = useDatabaseView();

  const selectOptionCountQuery = useLiveQuery({
    type: 'record.field.value.count',
    databaseId: database.id,
    filters: view.filters,
    fieldId: field.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  const selectOptions = Object.values(field.options ?? {});
  const noValueFilter: DatabaseViewFilterAttributes = {
    id: '1',
    type: 'field',
    fieldId: field.id,
    operator: 'is_empty',
  };

  const selectOptionCount = selectOptionCountQuery.data?.values ?? [];
  const noValueCount = selectOptionCountQuery.data?.noValueCount ?? 0;

  const noValueDraggingClass = getSelectOptionLightColorClass('gray');

  return (
    <>
      {selectOptions.map((option) => {
        const filter: DatabaseViewFilterAttributes = {
          id: '1',
          type: 'field',
          fieldId: field.id,
          operator: 'is_in',
          value: [option.id],
        };

        const draggingClass = getSelectOptionLightColorClass(
          option.color ?? 'gray'
        );

        const count =
          selectOptionCount.find((count) => count.value === option.id)?.count ??
          0;

        return (
          <BoardViewContext.Provider
            key={option.id}
            value={{
              field,
              filter,
              canDrop: () => true,
              drop: () => {
                return {
                  type: 'string_array',
                  value: [option.id],
                };
              },
              dragOverClass: draggingClass,
              header: (
                <BoardViewColumnMultiSelectHeader
                  field={field}
                  option={option}
                  count={count}
                />
              ),
              canDrag: (record) => record.canEdit,
              onDragEnd: async (record, value) => {
                if (!value) {
                  const result = await window.brainbox.executeMutation({
                    type: 'record.field.value.delete',
                    recordId: record.id,
                    fieldId: field.id,
                    accountId: workspace.accountId,
                    workspaceId: workspace.id,
                  });

                  if (!result.success) {
                    toast.error(result.error.message);
                  }
                } else {
                  if (value.type !== 'string_array') {
                    return;
                  }

                  let newValue: FieldValue = value;
                  const currentValue = record.fields[field.id];
                  if (currentValue && currentValue.type === 'string_array') {
                    const newOptions = [
                      ...currentValue.value.filter(
                        (optionId) => optionId !== option.id
                      ),
                      ...newValue.value,
                    ];

                    newValue = {
                      type: 'string_array',
                      value: newOptions,
                    };
                  }

                  const result = await window.brainbox.executeMutation({
                    type: 'record.field.value.set',
                    recordId: record.id,
                    fieldId: field.id,
                    value: newValue,
                    accountId: workspace.accountId,
                    workspaceId: workspace.id,
                  });

                  if (!result.success) {
                    toast.error(result.error.message);
                  }
                }
              },
            }}
          >
            <BoardViewColumn />
          </BoardViewContext.Provider>
        );
      })}
      <BoardViewContext.Provider
        value={{
          field,
          filter: noValueFilter,
          canDrop: () => true,
          drop: () => {
            return null;
          },
          header: (
            <BoardViewColumnMultiSelectHeader
              field={field}
              option={null}
              count={noValueCount}
            />
          ),
          dragOverClass: noValueDraggingClass,
          canDrag: () => true,
          onDragEnd: async (record, value) => {
            if (!value) {
              const result = await window.brainbox.executeMutation({
                type: 'record.field.value.delete',
                recordId: record.id,
                fieldId: field.id,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              });

              if (!result.success) {
                toast.error(result.error.message);
              }
            } else {
              const result = await window.brainbox.executeMutation({
                type: 'record.field.value.set',
                recordId: record.id,
                fieldId: field.id,
                value,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              });

              if (!result.success) {
                toast.error(result.error.message);
              }
            }
          },
        }}
      >
        <BoardViewColumn />
      </BoardViewContext.Provider>
    </>
  );
};

interface BoardViewColumnMultiSelectHeaderProps {
  field: MultiSelectFieldAttributes;
  option: SelectOptionAttributes | null;
  count: number;
}

const BoardViewColumnMultiSelectHeader = ({
  field,
  option,
  count,
}: BoardViewColumnMultiSelectHeaderProps) => {
  if (!option) {
    return (
      <div className="flex flex-row gap-2 items-center">
        <CircleDashed className="size-5" />
        <p className="text-muted-foreground">No {field.name}</p>
        <p className="text-muted-foreground text-sm ml-1">
          {count.toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <SelectOptionBadge name={option.name} color={option.color} />
      <p className="text-muted-foreground text-sm ml-1">
        {count.toLocaleString()}
      </p>
    </div>
  );
};
