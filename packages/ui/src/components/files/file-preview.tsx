import { DownloadStatus, LocalFileNode } from '@brainbox/client/types';
import { FileDownloadProgress } from '@brainbox/ui/components/files/file-download-progress';
import { FileNoPreview } from '@brainbox/ui/components/files/file-no-preview';
import { FilePreviewAudio } from '@brainbox/ui/components/files/previews/file-preview-audio';
import { FilePreviewImage } from '@brainbox/ui/components/files/previews/file-preview-image';
import { FilePreviewVideo } from '@brainbox/ui/components/files/previews/file-preview-video';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface FilePreviewProps {
  file: LocalFileNode;
}

export const FilePreview = ({ file }: FilePreviewProps) => {
  const workspace = useWorkspace();
  const localFileQuery = useLiveQuery({
    type: 'local.file.get',
    fileId: file.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    autoDownload: true,
  });

  if (localFileQuery.isPending) {
    return null;
  }

  const localFile = localFileQuery.data?.localFile;
  if (localFile) {
    if (file.attributes.subtype === 'image') {
      return (
        <FilePreviewImage url={localFile.url} name={file.attributes.name} />
      );
    }

    if (file.attributes.subtype === 'video') {
      return <FilePreviewVideo url={localFile.url} />;
    }

    if (file.attributes.subtype === 'audio') {
      return (
        <FilePreviewAudio url={localFile.url} name={file.attributes.name} />
      );
    }
  }

  const download = localFileQuery.data?.download;
  if (download && download.status !== DownloadStatus.Completed) {
    return <FileDownloadProgress progress={download.progress} />;
  }

  return <FileNoPreview mimeType={file.attributes.mimeType} />;
};
