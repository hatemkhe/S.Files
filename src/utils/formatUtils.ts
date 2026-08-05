import { FileCategory, TargetFormat, ImageFormat, VideoFormat, AudioFormat, DocumentFormat } from '../types';

export const IMAGE_FORMATS: ImageFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico'];
export const VIDEO_FORMATS: VideoFormat[] = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif'];
export const AUDIO_FORMATS: AudioFormat[] = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
export const DOCUMENT_FORMATS: DocumentFormat[] = ['pdf', 'txt', 'html', 'md'];

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()!.toLowerCase();
  }
  return '';
}

export function detectCategory(file: File): Exclude<FileCategory, 'all'> {
  const type = file.type.toLowerCase();
  const ext = getFileExtension(file.name);

  if (type.startsWith('image/') || IMAGE_FORMATS.includes(ext as ImageFormat)) {
    return 'image';
  }
  if (type.startsWith('video/') || VIDEO_FORMATS.includes(ext as VideoFormat)) {
    return 'video';
  }
  if (type.startsWith('audio/') || AUDIO_FORMATS.includes(ext as AudioFormat)) {
    return 'audio';
  }
  if (
    type.includes('pdf') ||
    type.includes('text') ||
    type.includes('html') ||
    DOCUMENT_FORMATS.includes(ext as DocumentFormat) ||
    ['doc', 'docx', 'txt', 'md', 'html', 'htm'].includes(ext)
  ) {
    return 'document';
  }

  return 'image'; // default fallback
}

export function getAvailableFormats(category: Exclude<FileCategory, 'all'>): TargetFormat[] {
  switch (category) {
    case 'image':
      return IMAGE_FORMATS;
    case 'video':
      return VIDEO_FORMATS;
    case 'audio':
      return AUDIO_FORMATS;
    case 'document':
      return DOCUMENT_FORMATS;
  }
}

export function getDefaultTargetFormat(category: Exclude<FileCategory, 'all'>, currentExt: string): TargetFormat {
  const formats = getAvailableFormats(category);
  const normalizedCurrent = currentExt === 'jpg' ? 'jpeg' : currentExt;
  // Pick a format different from current if possible
  const different = formats.find(f => f !== normalizedCurrent && f !== currentExt);
  return different || formats[0];
}

export function getFormatLabel(format: string): string {
  return format.toUpperCase();
}

export function getCategoryLabelArabic(category: FileCategory): string {
  switch (category) {
    case 'all':
      return 'جميع الملفات';
    case 'image':
      return 'الصور';
    case 'video':
      return 'الفيديوهات';
    case 'audio':
      return 'الصوتيات';
    case 'document':
      return 'المستندات';
  }
}

export function getMimeType(format: string): string {
  switch (format) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'bmp': return 'image/bmp';
    case 'tiff': return 'image/tiff';
    case 'svg': return 'image/svg+xml';
    case 'ico': return 'image/x-icon';

    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'avi': return 'video/x-msvideo';
    case 'mov': return 'video/quicktime';
    case 'mkv': return 'video/x-matroska';

    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'ogg': return 'audio/ogg';
    case 'aac': return 'audio/aac';
    case 'flac': return 'audio/flac';
    case 'm4a': return 'audio/mp4';

    case 'pdf': return 'application/pdf';
    case 'txt': return 'text/plain';
    case 'html': return 'text/html';
    case 'md': return 'text/markdown';

    default: return 'application/octet-stream';
  }
}
