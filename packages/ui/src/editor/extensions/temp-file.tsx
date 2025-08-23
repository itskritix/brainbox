import { CommandProps, mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { TempFile } from '@brainbox/client/types';
import { TempFileNodeView } from '@brainbox/ui/editor/views';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tempFile: {
      addTempFile: (file: TempFile) => ReturnType;
    };
  }
}

export const TempFileNode = Node.create({
  name: 'tempFile',
  group: 'block',
  atom: true,
  defining: true,
  draggable: true,
  addAttributes() {
    return {
      id: {
        default: null,
      },
      name: {
        default: null,
      },
      path: {
        default: null,
      },
      size: {
        default: null,
      },
      type: {
        default: null,
      },
      mimeType: {
        default: null,
      },
      extension: {
        default: null,
      },
      url: {
        default: null,
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['tempFile', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TempFileNodeView, {
      as: 'tempFile',
    });
  },
  addCommands() {
    return {
      addTempFile:
        (file: TempFile) =>
        ({ editor, tr }: CommandProps) => {
          const pos = tr.selection.$head.pos;
          editor
            .chain()
            .focus()
            .insertContentAt(pos, {
              type: 'tempFile',
              attrs: file,
            })
            .run();

          return true;
        },
    };
  },
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey('temp-file-paste'),
        props: {
          handlePaste(_, event) {
            const files = Array.from(event.clipboardData?.files || []);
            if (files.length == 0) {
              return false;
            }

            (async () => {
              for (const file of files) {
                const tempFile = await window.brainbox.saveTempFile(file);
                editor.commands.addTempFile(tempFile);
              }
            })();

            return true;
          },
        },
      }),
      new Plugin({
        key: new PluginKey('temp-file-drop'),
        props: {
          handleDrop(_, event) {
            const files = Array.from(event.dataTransfer?.files || []);
            if (files.length == 0) {
              return false;
            }

            (async () => {
              for (const file of files) {
                const tempFile = await window.brainbox.saveTempFile(file);
                editor.commands.addTempFile(tempFile);
              }
            })();

            return true;
          },
        },
      }),
    ];
  },
});
