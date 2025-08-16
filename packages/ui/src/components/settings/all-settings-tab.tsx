import { Settings } from 'lucide-react';

export const AllSettingsTab = () => {
  return (
    <div className="flex items-center gap-2">
      <Settings className="size-4 text-muted-foreground" />
      <span>Settings</span>
    </div>
  );
};