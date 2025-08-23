import { LocalRecordNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';

interface RecordBreadcrumbItemProps {
  record: LocalRecordNode;
}

export const RecordBreadcrumbItem = ({ record }: RecordBreadcrumbItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Avatar
        id={record.id}
        name={record.attributes.name}
        avatar={record.attributes.avatar}
        className="size-4"
      />
      <span>{record.attributes.name}</span>
    </div>
  );
};
