import { Link } from '@tiptap/extension-link';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const LinkMark = Link.extend({
  inclusive: false,
}).configure({
  autolink: true,
  HTMLAttributes: {
    class: defaultClasses.link,
  },
});
