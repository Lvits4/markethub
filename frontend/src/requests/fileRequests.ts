import { apiPaths } from '../config/apiPaths';
import { fetchDefault, fetchFormData } from './fetchDefault';

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

export async function uploadFilesMultiple(
  token: string,
  files: File[],
  folder?: string,
): Promise<UploadFileResult[]> {
  const fd = new FormData();
  for (const f of files) {
    fd.append('files', f);
  }
  const path =
    folder != null && folder !== ''
      ? `${apiPaths.filesUploadMultiple}?folder=${encodeURIComponent(folder)}`
      : apiPaths.filesUploadMultiple;
  return fetchFormData<UploadFileResult[]>(path, { token, formData: fd });
}

export async function deleteFile(token: string, pathParam: string) {
  const q = new URLSearchParams({ path: pathParam });
  return fetchDefault<{ message: string }>(`${apiPaths.filesDelete}?${q}`, {
    token,
    method: 'DELETE',
  });
}
