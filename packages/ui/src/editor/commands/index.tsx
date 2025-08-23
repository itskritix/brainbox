import { EditorCommand, EditorCommandProps } from '@brainbox/client/types';
import { BlockquoteCommand } from '@brainbox/ui/editor/commands/blockquote';
import { BulletListCommand } from '@brainbox/ui/editor/commands/bullet-list';
import { CodeBlockCommand } from '@brainbox/ui/editor/commands/code-block';
import { DatabaseCommand } from '@brainbox/ui/editor/commands/database';
import { DatabaseInlineCommand } from '@brainbox/ui/editor/commands/database-inline';
import { DividerCommand } from '@brainbox/ui/editor/commands/divider';
import { FileCommand } from '@brainbox/ui/editor/commands/file';
import { FolderCommand } from '@brainbox/ui/editor/commands/folder';
import { Heading1Command } from '@brainbox/ui/editor/commands/heading1';
import { Heading2Command } from '@brainbox/ui/editor/commands/heading2';
import { Heading3Command } from '@brainbox/ui/editor/commands/heading3';
import { OrderedListCommand } from '@brainbox/ui/editor/commands/ordered-list';
import { PageCommand } from '@brainbox/ui/editor/commands/page';
import { ParagraphCommand } from '@brainbox/ui/editor/commands/paragraph';
import { TableCommand } from '@brainbox/ui/editor/commands/table';
import { TodoCommand } from '@brainbox/ui/editor/commands/todo';

export type { EditorCommand, EditorCommandProps };

export {
  BlockquoteCommand,
  BulletListCommand,
  CodeBlockCommand,
  DividerCommand,
  FileCommand,
  FolderCommand,
  Heading1Command,
  Heading2Command,
  Heading3Command,
  OrderedListCommand,
  PageCommand,
  ParagraphCommand,
  TableCommand,
  TodoCommand,
  DatabaseCommand,
  DatabaseInlineCommand,
};
