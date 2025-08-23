import { JSONContent } from '@tiptap/core';
import { Clipboard } from 'lucide-react';
import { useState } from 'react';

import { defaultClasses } from '@brainbox/ui/editor/classes';
import { highlightCode, languages } from '@brainbox/ui/lib/lowlight';

interface CodeBlockRendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const CodeBlockRenderer = ({
  node,
  keyPrefix,
}: CodeBlockRendererProps) => {
  const language = node.attrs?.language;

  const [copied, setCopied] = useState(false);

  const code = node.content?.[0]?.text ?? '';
  if (!code) {
    return null;
  }

  const highlight = highlightCode(code, language);
  const languageItem = languages?.find((item) => item.code === language);
  const languageName = languageItem?.name ?? language ?? ' ';

  return (
    <pre className={defaultClasses.codeBlock}>
      <div className={defaultClasses.codeBlockHeader}>
        {<p>{languageName}</p>}
        <div
          className="flex cursor-pointer flex-row items-center gap-1"
          onClick={() => {
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
            });
          }}
        >
          <Clipboard className="size-4" />
          <p>{copied ? 'Copied' : 'Copy code'}</p>
        </div>
      </div>
      {highlight && highlight.language && highlight.nodes?.length > 0 ? (
        <code
          className={
            highlight?.language ? `language-${highlight?.language}` : ''
          }
        >
          {highlight?.nodes.map((node, index) => (
            <span
              key={`${keyPrefix}-${index}`}
              className={node.classes.join(' ')}
            >
              {node.text}
            </span>
          ))}
        </code>
      ) : (
        <code>{code}</code>
      )}
    </pre>
  );
};
