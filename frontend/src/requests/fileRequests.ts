import { apiPaths } from '../config/apiPaths';
import { fetchFormData } from './fetchDefault';

export type UploadFileResult = { url: string; originalName: string };

export async function uploadFile(
  token: string,
  file: File,
  folder?: string,
): Promise<UploadFileResult> {
  const fd = new FormData();
  fd.append('file', file);
  const path =
    folder != null && folder !== ''
      ? `${apiPaths.filesUpload}?folder=${encodeURIComponent(folder)}`
      : apiPaths.filesUpload;
  return fetchFormData<UploadFileResult>(path, { token, formData: fd });
}
