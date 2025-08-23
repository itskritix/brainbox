import { Plus } from 'lucide-react';

import { FieldCreatePopover } from '@brainbox/ui/components/databases/fields/field-create-popover';
import { TableViewFieldHeader } from '@brainbox/ui/components/databases/tables/table-view-field-header';
import { TableViewNameHeader } from '@brainbox/ui/components/databases/tables/table-view-name-header';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { useDatabaseView } from '@brainbox/ui/contexts/database-view';

export const TableViewHeader = () => {
  const database = useDatabase();
  const view = useDatabaseView();

  return (
    <div className="flex flex-row items-center gap-0.5">
      <div style={{ width: '30px', minWidth: '30px' }} />
      <TableViewNameHeader />
      {view.fields.map((field) => {
        return <TableViewFieldHeader viewField={field} key={field.field.id} />;
      })}
      {database.canEdit && (
        <FieldCreatePopover
          button={<Plus className="ml-2 size-4 cursor-pointer" />}
        />
      )}
    </div>
  );
};
