import { JSONContent } from '@tiptap/core';

import { defaultClasses } from '@brainbox/ui/editor/classes';
import { NodeChildrenRenderer } from '@brainbox/ui/editor/renderers/node-children';
import { editorColors } from '@brainbox/ui/lib/editor';
import { cn } from '@brainbox/ui/lib/utils';

interface TableCellRendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const TableCellRenderer = ({
  node,
  keyPrefix,
}: TableCellRendererProps) => {
  const align = node.attrs?.align ?? 'left';
  const backgroundColorAttr = node.attrs?.backgroundColor ?? null;
  const backgroundColor = backgroundColorAttr
    ? editorColors.find((color) => color.color === backgroundColorAttr)
    : null;

  return (
    <td className={defaultClasses.tableCellWrapper}>
      <div
        className={cn(
          defaultClasses.tableCell,
          backgroundColor?.bgClass,
          align === 'left' && 'justify-start',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end'
        )}
      >
        <NodeChildrenRenderer node={node} keyPrefix={keyPrefix} />
      </div>
    </td>
  );
};
