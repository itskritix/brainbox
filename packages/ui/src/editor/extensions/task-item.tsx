import { TaskItem } from '@tiptap/extension-list';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const TaskItemNode = TaskItem.configure({
  HTMLAttributes: {
    class: defaultClasses.taskItem,
  },
});
