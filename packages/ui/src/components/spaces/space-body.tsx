import { LocalSpaceNode } from '@colanode/client/types';
import { NodeRole, hasNodeRole } from '@colanode/core';
import { NodeCollaborators } from '@colanode/ui/components/collaborators/node-collaborators';
import { SpaceDeleteForm } from '@colanode/ui/components/spaces/space-delete-form';
import { SpaceGeneralTab } from '@colanode/ui/components/spaces/space-general-tab';
import { Separator } from '@colanode/ui/components/ui/separator';
import { useLayout } from '@colanode/ui/contexts/layout';

interface SpaceBodyProps {
  space: LocalSpaceNode;
  role: NodeRole;
}

export const SpaceBody = ({ space, role }: SpaceBodyProps) => {
  const layout = useLayout();
  const canEdit = hasNodeRole(role, 'admin');
  const canDelete = hasNodeRole(role, 'admin');

  return (
    <div className="h-full overflow-auto px-6 py-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* General Settings Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            <p className="text-sm text-gray-600">Manage your space name, avatar, and description</p>
          </div>
          <SpaceGeneralTab space={space} readonly={!canEdit} />
        </div>

        <Separator />

        {/* Collaborators Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Collaborators</h2>
            <p className="text-sm text-gray-600">Manage who has access to this space and their permissions</p>
          </div>
          <NodeCollaborators node={space} nodes={[space]} role={role} />
        </div>

        {/* Delete Section */}
        {canDelete && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-red-600">Delete Space</h2>
                <p className="text-sm text-gray-600">Permanently delete this space and all its contents</p>
              </div>
              <SpaceDeleteForm
                id={space.id}
                onDeleted={() => {
                  layout.close(space.id);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
