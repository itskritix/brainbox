import { ChevronRight, Plus } from 'lucide-react';
import { RefAttributes, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { toast } from 'sonner';

import { LocalSpaceNode } from '@colanode/client/types';
import { extractNodeRole } from '@colanode/core';
import { SidebarItem } from '@colanode/ui/components/layouts/sidebars/sidebar-item';
import { SpaceSidebarDropdown } from '@colanode/ui/components/spaces/space-sidebar-dropdown';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@colanode/ui/components/ui/collapsible';
import { useLayout } from '@colanode/ui/contexts/layout';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';
import { useMutation } from '@colanode/ui/hooks/use-mutation';
import { sortSpaceChildren } from '@colanode/ui/lib/spaces';
import { cn } from '@colanode/ui/lib/utils';

interface SpaceSidebarItemProps {
  space: LocalSpaceNode;
}

export const SpaceSidebarItem = ({ space }: SpaceSidebarItemProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const mutation = useMutation();

  const role = extractNodeRole(space, workspace.userId);
  const canEdit = role === 'admin';

  const nodeChildrenGetQuery = useLiveQuery({
    type: 'node.children.get',
    nodeId: space.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    types: ['page', 'database', 'folder'],
  });

  const [dropMonitor, dropRef] = useDrop({
    accept: 'sidebar-item',
    drop: () => ({
      after: null,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const divRef = useRef<HTMLDivElement>(null);
  const dropDivRef = dropRef(divRef);

  const children = sortSpaceChildren(space, nodeChildrenGetQuery.data ?? []);

  const handleDragEnd = (childId: string, after: string | null) => {
    mutation.mutate({
      input: {
        type: 'space.child.reorder',
        accountId: workspace.accountId,
        workspaceId: workspace.id,
        spaceId: space.id,
        childId,
        after,
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  };

  return (
    <Collapsible
      key={space.id}
      defaultOpen={true}
      className="group/sidebar-space"
    >
      <div
        className={cn(
          'flex w-full min-w-0 flex-row items-center hover:bg-blue-50 rounded-md transition-colors h-8 group/space-hover',
          dropMonitor.isOver &&
            dropMonitor.canDrop &&
            'border-b-2 border-blue-300'
        )}
        ref={dropDivRef as RefAttributes<HTMLDivElement>['ref']}
      >
        <CollapsibleTrigger asChild>
          <button className="group/space-button flex items-center gap-2 overflow-hidden px-2 py-1.5 text-left text-sm flex-1 cursor-pointer">
            {/* <Avatar
              id={space.id}
              avatar={space.attributes.avatar}
              name={space.attributes.name}
              className="size-4"
            /> */}
            {/* <ChevronRight className="size-3 text-gray-400 transition-transform duration-200 group-data-[state=open]/sidebar-space:rotate-90" /> */}
            <span className="text-xs font-medium text-gray-900 truncate">{space.attributes.name}</span>
          </button>
        </CollapsibleTrigger>
        <button
          onClick={() => {
            mutation.mutate({
              input: {
                type: 'page.create',
                accountId: workspace.accountId,
                workspaceId: workspace.id,
                parentId: space.id,
                name: 'New Page',
                after: null,
              },
              onSuccess(page) {
                layout.open(page.id);
              },
              onError(error) {
                toast.error(error.message);
              },
            });
          }}
          className="opacity-0 group-hover/sidebar-space:opacity-100 p-1 rounded hover:bg-gray-100 transition-all mr-1"
        >
          <Plus className="size-3 text-gray-500" />
        </button>
        <SpaceSidebarDropdown space={space} />
      </div>
      <CollapsibleContent>
        <ul className="ml-1 flex min-w-0 flex-col gap-1  py-0.5 mr-0 pr-0">
          {children.map((child) => (
            <li
              key={child.id}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  layout.openLeft(child.id);
                } else {
                  layout.preview(child.id);
                }
              }}
              onDoubleClick={() => {
                layout.open(child.id);
              }}
              className="cursor-pointer select-none"
            >
              <SidebarItem
                node={child}
                isActive={layout.activeTab === child.id}
                canDrag={canEdit}
                onDragEnd={(after) => {
                  handleDragEnd(child.id, after);
                }}
              />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};
