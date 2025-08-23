import { ListItem } from '@tiptap/extension-list';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const ListItemNode = ListItem.configure({
  HTMLAttributes: {
    class: defaultClasses.listItem,
  },
});
