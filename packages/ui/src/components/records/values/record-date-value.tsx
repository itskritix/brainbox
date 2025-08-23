import { DateFieldAttributes } from '@brainbox/core';
import { DatePicker } from '@brainbox/ui/components/ui/date-picker';
import { useRecord } from '@brainbox/ui/contexts/record';

interface RecordDateValueProps {
  field: DateFieldAttributes;
  readOnly?: boolean;
}

export const RecordDateValue = ({ field, readOnly }: RecordDateValueProps) => {
  const record = useRecord();

  return (
    <DatePicker
      value={record.getDateValue(field)}
      readonly={!record.canEdit || readOnly}
      onChange={(newValue) => {
        if (!record.canEdit || readOnly) return;

        if (newValue === null || newValue === undefined) {
          record.removeFieldValue(field);
        } else {
          record.updateFieldValue(field, {
            type: 'string',
            value: newValue.toISOString(),
          });
        }
      }}
      className="flex h-full w-full cursor-pointer flex-row items-center gap-1 border-none text-sm focus-visible:cursor-text p-0"
    />
  );
};
