import { BulletList } from '@tiptap/extension-list';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const BulletListNode = BulletList.configure({
  HTMLAttributes: {
    class: defaultClasses.bulletList,
  },
});
