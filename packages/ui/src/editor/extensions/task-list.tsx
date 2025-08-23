import { TaskList } from '@tiptap/extension-list';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const TaskListNode = TaskList.configure({
  HTMLAttributes: {
    class: defaultClasses.taskList,
  },
});
