import { IconPickerItem } from '@brainbox/ui/components/icons/icon-picker-item';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface IconSearchProps {
  query: string;
}

export const IconSearch = ({ query }: IconSearchProps) => {
  const iconSearchQuery = useLiveQuery({
    type: 'icon.search',
    query,
    count: 100,
  });

  const icons = iconSearchQuery.data ?? [];

  return (
    <div className="grid w-full min-w-full grid-cols-10 gap-1">
      <div className="col-span-full flex items-center py-1 pl-1 text-sm text-muted-foreground">
        <p>Search results for &quot;{query}&quot;</p>
      </div>
      {icons.map((icon) => (
        <IconPickerItem key={icon.id} icon={icon} />
      ))}
    </div>
  );
};
