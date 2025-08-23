import 'react-circular-progressbar/dist/styles.css';
import { Check, Clock, X } from 'lucide-react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

import { DownloadStatus } from '@brainbox/client/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@brainbox/ui/components/ui/tooltip';

interface WorkspaceDownloadStatusProps {
  status: DownloadStatus;
  progress: number;
}

export const WorkspaceDownloadStatus = ({
  status,
  progress,
}: WorkspaceDownloadStatusProps) => {
  switch (status) {
    case DownloadStatus.Pending:
      return (
        <Tooltip>
          <TooltipTrigger>
            <Clock className="text-muted-foreground animate-pulse size-6" />
          </TooltipTrigger>
          <TooltipContent className="flex flex-row items-center gap-2">
            Waiting to download...
          </TooltipContent>
        </Tooltip>
      );
    case DownloadStatus.Downloading:
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="size-6">
                <CircularProgressbar
                  value={progress}
                  strokeWidth={8}
                  styles={buildStyles({
                    pathColor: 'var(--color-blue-500)',
                  })}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {Math.round(progress)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-row items-center gap-2">
            Downloading ... {progress}%
          </TooltipContent>
        </Tooltip>
      );
    case DownloadStatus.Completed:
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="bg-green-600 rounded-full p-1 flex items-center justify-center size-6">
              <Check className="size-4 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-row items-center gap-2">
            Downloaded
          </TooltipContent>
        </Tooltip>
      );
    case DownloadStatus.Failed:
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="bg-destructive rounded-full p-1 flex items-center justify-center size-6">
              <X className="size-4 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-row items-center gap-2">
            Download failed
          </TooltipContent>
        </Tooltip>
      );
    default:
      return null;
  }
};
