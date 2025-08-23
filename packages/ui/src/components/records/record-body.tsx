import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { LocalRecordNode } from '@brainbox/client/types';
import { NodeRole, hasNodeRole } from '@brainbox/core';
import { Document } from '@brainbox/ui/components/documents/document';
import { RecordAttributes } from '@brainbox/ui/components/records/record-attributes';
import { RecordDatabase } from '@brainbox/ui/components/records/record-database';
import { RecordProvider } from '@brainbox/ui/components/records/record-provider';
import { ScrollBar } from '@brainbox/ui/components/ui/scroll-area';
import { Separator } from '@brainbox/ui/components/ui/separator';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';

interface RecordBodyProps {
  record: LocalRecordNode;
  role: NodeRole;
}

export const RecordBody = ({ record, role }: RecordBodyProps) => {
  const workspace = useWorkspace();

  const canEdit =
    record.createdBy === workspace.userId || hasNodeRole(role, 'editor');
  return (
    <RecordDatabase id={record.attributes.databaseId} role={role}>
      <div className="h-full w-full overflow-y-auto">
        <ScrollAreaPrimitive.Root className="relative overflow-hidden h-full">
          <ScrollAreaPrimitive.Viewport className="h-full max-h-[calc(100vh-100px)] w-full overflow-y-auto rounded-[inherit]">
            <RecordProvider record={record} role={role}>
              <RecordAttributes />
            </RecordProvider>
            <Separator className="my-4 w-full" />
            <Document node={record} canEdit={canEdit} autoFocus={false} />
          </ScrollAreaPrimitive.Viewport>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
          <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
      </div>
    </RecordDatabase>
  );
};
