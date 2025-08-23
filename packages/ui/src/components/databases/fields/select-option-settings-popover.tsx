import { Ellipsis, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { SelectOptionAttributes } from '@brainbox/core';
import { SelectOptionDeleteDialog } from '@brainbox/ui/components/databases/fields/select-option-delete-dialog';
import { Label } from '@brainbox/ui/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brainbox/ui/components/ui/popover';
import { Separator } from '@brainbox/ui/components/ui/separator';
import { SmartTextInput } from '@brainbox/ui/components/ui/smart-text-input';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { selectOptionColors } from '@brainbox/ui/lib/databases';
import { cn } from '@brainbox/ui/lib/utils';

interface SelectOptionSettingsPopoverProps {
  fieldId: string;
  option: SelectOptionAttributes;
}

export const SelectOptionSettingsPopover = ({
  fieldId,
  option,
}: SelectOptionSettingsPopoverProps) => {
  const database = useDatabase();

  const [openSetttingsPopover, setOpenSetttingsPopover] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <Fragment>
      <Popover
        modal={true}
        open={openSetttingsPopover}
        onOpenChange={setOpenSetttingsPopover}
      >
        <PopoverTrigger className="flex cursor-pointer items-center justify-center">
          <Ellipsis className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="ml-1 flex w-72 flex-col gap-1 p-2 text-sm">
          <div className="p-1">
            <SmartTextInput
              value={option.name}
              onChange={(newName) => {
                if (newName === option.name) return;

                database.updateSelectOption(fieldId, {
                  ...option,
                  name: newName,
                });
              }}
            />
          </div>
          <Separator className="my-1" />
          <Label>Color</Label>
          {selectOptionColors.map((color) => {
            return (
              <div
                key={color.value}
                className="flex cursor-pointer flex-row items-center gap-2 rounded-md p-1 hover:bg-gray-100"
                onClick={() => {
                  database.updateSelectOption(fieldId, {
                    ...option,
                    color: color.value,
                  });
                }}
              >
                <span className={cn('h-4 w-4 rounded-md', color.class)} />
                <span>{color.label}</span>
              </div>
            );
          })}
          <Separator className="my-1" />
          <div
            className="flex cursor-pointer flex-row items-center gap-2 p-1 hover:bg-gray-100"
            onClick={() => {
              setOpenDeleteDialog(true);
              setOpenSetttingsPopover(false);
            }}
          >
            <Trash2 className="size-4" />
            <span>Delete option</span>
          </div>
        </PopoverContent>
      </Popover>
      <SelectOptionDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        fieldId={fieldId}
        optionId={option.id}
      />
    </Fragment>
  );
};
