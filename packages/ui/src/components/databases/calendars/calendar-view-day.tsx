import { Plus } from 'lucide-react';

import { LocalRecordNode } from '@brainbox/client/types';
import { extractNodeRole, isSameDay } from '@brainbox/core';
import { CalendarViewRecordCard } from '@brainbox/ui/components/databases/calendars/calendar-view-record-card';
import { RecordProvider } from '@brainbox/ui/components/records/record-provider';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { cn } from '@brainbox/ui/lib/utils';

interface CalendarViewDayProps {
  date: Date;
  records: LocalRecordNode[];
  isOutside: boolean;
  onCreate?: () => void;
}

export const CalendarViewDay = ({
  date,
  records,
  isOutside,
  onCreate,
}: CalendarViewDayProps) => {
  const workspace = useWorkspace();
  const database = useDatabase();

  const isToday = isSameDay(date, new Date());

  return (
    <div className="animate-fade-in group/calendar-day flex w-full flex-col gap-1 h-40 p-2 border-r first:border-l border-gray-100 overflow-auto">
      <div
        className={cn(
          'flex w-full justify-end text-sm',
          isOutside ? 'text-muted-foreground' : ''
        )}
      >
        {onCreate && (
          <div className="flex-grow">
            <Plus
              className="size-4 cursor-pointer opacity-0 group-hover/calendar-day:opacity-100"
              onClick={onCreate}
            />
          </div>
        )}
        <p
          className={
            isToday ? 'rounded-md bg-red-500 py-1 px-2 text-white' : ''
          }
        >
          {date.getDate()}
        </p>
      </div>
      {records.map((record) => {
        const role = extractNodeRole(record, workspace.userId) ?? database.role;

        return (
          <RecordProvider key={record.id} record={record} role={role}>
            <CalendarViewRecordCard />
          </RecordProvider>
        );
      })}
    </div>
  );
};
