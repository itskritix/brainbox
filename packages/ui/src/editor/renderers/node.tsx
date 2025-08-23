import { JSONContent } from '@tiptap/core';
import { ReactElement } from 'react';
import { match } from 'ts-pattern';

import { BlockquoteRenderer } from '@brainbox/ui/editor/renderers/blockquote';
import { BulletListRenderer } from '@brainbox/ui/editor/renderers/bullet-list';
import { CodeBlockRenderer } from '@brainbox/ui/editor/renderers/code-block';
import { DocumentRenderer } from '@brainbox/ui/editor/renderers/document';
import { FileRenderer } from '@brainbox/ui/editor/renderers/file';
import { HardBreakRenderer } from '@brainbox/ui/editor/renderers/hard-break';
import { Heading1Renderer } from '@brainbox/ui/editor/renderers/heading1';
import { Heading2Renderer } from '@brainbox/ui/editor/renderers/heading2';
import { Heading3Renderer } from '@brainbox/ui/editor/renderers/heading3';
import { ListItemRenderer } from '@brainbox/ui/editor/renderers/list-item';
import { MarkRenderer } from '@brainbox/ui/editor/renderers/mark';
import { MentionRenderer } from '@brainbox/ui/editor/renderers/mention';
import { MessageRenderer } from '@brainbox/ui/editor/renderers/message';
import { OrderedListRenderer } from '@brainbox/ui/editor/renderers/ordered-list';
import { ParagraphRenderer } from '@brainbox/ui/editor/renderers/paragraph';
import { TableRenderer } from '@brainbox/ui/editor/renderers/table';
import { TableCellRenderer } from '@brainbox/ui/editor/renderers/table-cell';
import { TableHeaderRenderer } from '@brainbox/ui/editor/renderers/table-header';
import { TableRowRenderer } from '@brainbox/ui/editor/renderers/table-row';
import { TaskItemRenderer } from '@brainbox/ui/editor/renderers/task-item';
import { TaskListRenderer } from '@brainbox/ui/editor/renderers/task-list';
import { TextRenderer } from '@brainbox/ui/editor/renderers/text';

interface NodeRendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const NodeRenderer = ({
  node,
  keyPrefix,
}: NodeRendererProps): ReactElement => {
  return (
    <MarkRenderer node={node}>
      {match(node.type)
        .with('message', () => (
          <MessageRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('doc', () => (
          <DocumentRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('text', () => <TextRenderer node={node} />)
        .with('paragraph', () => (
          <ParagraphRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('heading1', () => (
          <Heading1Renderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('heading2', () => (
          <Heading2Renderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('heading3', () => (
          <Heading3Renderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('blockquote', () => (
          <BlockquoteRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('bulletList', () => (
          <BulletListRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('orderedList', () => (
          <OrderedListRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('listItem', () => (
          <ListItemRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('taskList', () => (
          <TaskListRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('taskItem', () => (
          <TaskItemRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('codeBlock', () => (
          <CodeBlockRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('file', () => <FileRenderer node={node} keyPrefix={keyPrefix} />)
        .with('mention', () => (
          <MentionRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('hardBreak', () => (
          <HardBreakRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('table', () => (
          <TableRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('tableRow', () => (
          <TableRowRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('tableCell', () => (
          <TableCellRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .with('tableHeader', () => (
          <TableHeaderRenderer node={node} keyPrefix={keyPrefix} />
        ))
        .otherwise(() => null)}
    </MarkRenderer>
  );
};
