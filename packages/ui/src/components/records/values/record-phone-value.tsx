import { PhoneFieldAttributes } from '@brainbox/core';
import { SmartTextInput } from '@brainbox/ui/components/ui/smart-text-input';
import { useRecord } from '@brainbox/ui/contexts/record';

interface RecordPhoneValueProps {
  field: PhoneFieldAttributes;
  readOnly?: boolean;
}

export const RecordPhoneValue = ({
  field,
  readOnly,
}: RecordPhoneValueProps) => {
  const record = useRecord();

  return (
    <SmartTextInput
      value={record.getPhoneValue(field)}
      readOnly={!record.canEdit || readOnly}
      onChange={(newValue) => {
        if (!record.canEdit || readOnly) return;

        if (newValue === record.getPhoneValue(field)) {
          return;
        }

        if (newValue === null || newValue === '') {
          record.removeFieldValue(field);
        } else {
          record.updateFieldValue(field, {
            type: 'string',
            value: newValue,
          });
        }
      }}
      className="flex h-full w-full cursor-pointer flex-row items-center gap-1 p-0 border-none text-sm focus-visible:cursor-text"
    />
  );
};
