import { useState } from 'react';

import { LocalRecordNode } from '@brainbox/client/types';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@brainbox/ui/components/ui/command';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface RecordSearchProps {
  exclude?: string[];
  onSelect: (record: LocalRecordNode) => void;
  databaseId: string;
}

export const RecordSearch = ({
  exclude,
  onSelect,
  databaseId,
}: RecordSearchProps) => {
  const workspace = useWorkspace();

  const [query, setQuery] = useState('');
  const recordSearchQuery = useLiveQuery({
    type: 'record.search',
    searchQuery: query,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    exclude,
    databaseId,
  });

  return (
    <Command className="min-h-min" shouldFilter={false}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search records..."
        className="h-9"
      />
      <CommandEmpty>No record found.</CommandEmpty>
      <CommandList>
        <CommandGroup className="h-min">
          {recordSearchQuery.data?.map((record) => (
            <CommandItem
              key={record.id}
              onSelect={() => {
                onSelect(record);
                setQuery('');
              }}
            >
              <div className="flex w-full flex-row items-center gap-2">
                <Avatar
                  id={record.id}
                  name={record.attributes.name}
                  avatar={record.attributes.avatar}
                  className="size-4"
                />
                <p className="text-sm flex-grow">{record.attributes.name}</p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
