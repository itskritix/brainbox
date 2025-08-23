import { CreatedAtFieldAttributes } from '@brainbox/core';
import { useRecord } from '@brainbox/ui/contexts/record';

interface RecordCreatedAtValueProps {
  field: CreatedAtFieldAttributes;
}

export const RecordCreatedAtValue = ({ field }: RecordCreatedAtValueProps) => {
  const record = useRecord();
  const createdAt = new Date(record.createdAt);

  return (
    <div className="h-full w-full text-sm p-0" data-field={field.id}>
      <p>
        {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
      </p>
    </div>
  );
};
