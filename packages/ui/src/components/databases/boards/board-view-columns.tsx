import { FieldAttributes } from '@brainbox/core';
import { BoardViewColumnsCollaborator } from '@brainbox/ui/components/databases/boards/board-view-columns-collaborator';
import { BoardViewColumnsCreatedBy } from '@brainbox/ui/components/databases/boards/board-view-columns-created-by';
import { BoardViewColumnsMultiSelect } from '@brainbox/ui/components/databases/boards/board-view-columns-multi-select';
import { BoardViewColumnsSelect } from '@brainbox/ui/components/databases/boards/board-view-columns-select';

interface BoardViewColumnsProps {
  field: FieldAttributes;
}

export const BoardViewColumns = ({ field }: BoardViewColumnsProps) => {
  switch (field.type) {
    case 'select':
      return <BoardViewColumnsSelect field={field} />;
    case 'multi_select':
      return <BoardViewColumnsMultiSelect field={field} />;
    case 'collaborator':
      return <BoardViewColumnsCollaborator field={field} />;
    case 'created_by':
      return <BoardViewColumnsCreatedBy field={field} />;
    default:
      return <p>Unsupported field type</p>;
  }
};
