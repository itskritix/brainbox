import { type NodeViewProps } from '@tiptap/core';
import {
  NodeViewContent,
  NodeViewWrapper,
  useEditorState,
} from '@tiptap/react';
import { Resizable } from 're-resizable';

import { updateColumnWidth } from '@brainbox/client/lib';
import { defaultClasses } from '@brainbox/ui/editor/classes';
import { TableCellContextMenu } from '@brainbox/ui/editor/menus/table-cell-context-menu';
import { TableCellDropdownMenu } from '@brainbox/ui/editor/menus/table-cell-dropdown-menu';
import { editorColors } from '@brainbox/ui/lib/editor';
import { cn } from '@brainbox/ui/lib/utils';

export const TableHeaderNodeView = (props: NodeViewProps) => {
  const state = useEditorState({
    editor: props.editor,
    selector(context) {
      return {
        isActive: context.editor.isActive(
          props.node.type.name,
          props.node.attrs
        ),
      };
    },
  });

  const isActive = state.isActive;
  const colWidth = props.node.attrs.colwidth ?? 100;
  const align = props.node.attrs.align;
  const backgroundColor = editorColors.find(
    (color) => color.color === props.node.attrs.backgroundColor
  );

  return (
    <NodeViewWrapper>
      <TableCellContextMenu {...props}>
        <Resizable
          className={cn(
            defaultClasses.tableHeader,
            'relative',
            isActive && 'outline outline-gray-400',
            backgroundColor?.bgClass,
            align === 'left' && 'justify-start',
            align === 'center' && 'justify-center',
            align === 'right' && 'justify-end'
          )}
          defaultSize={{
            width: `${colWidth}px`,
          }}
          minWidth={100}
          maxWidth={500}
          size={{
            width: `${colWidth}px`,
          }}
          enable={{
            bottom: false,
            bottomLeft: false,
            bottomRight: false,
            left: false,
            right: !isActive,
            top: false,
            topLeft: false,
            topRight: false,
          }}
          handleClasses={{
            right: 'opacity-0 hover:opacity-100 bg-blue-300',
          }}
          handleStyles={{
            right: {
              width: '3px',
              right: '-3px',
            },
          }}
          onResizeStop={(_e, _direction, ref) => {
            const newWidth = ref.offsetWidth;
            const pos = props.getPos();
            if (!pos) {
              return;
            }

            updateColumnWidth(props.editor.view, pos, newWidth);
          }}
        >
          {isActive && <TableCellDropdownMenu {...props} />}
          <NodeViewContent className="z-0 w-full h-full" />
        </Resizable>
      </TableCellContextMenu>
    </NodeViewWrapper>
  );
};
