export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'all';

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'bmp' | 'tiff' | 'svg' | 'ico';
export type VideoFormat = 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv' | 'gif';
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' | 'm4a';
export type DocumentFormat = 'pdf' | 'txt' | 'html' | 'md';

export type TargetFormat = ImageFormat | VideoFormat | AudioFormat | DocumentFormat;

export interface ImageOptions {
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor: string; // e.g. '#ffffff' for jpg
}

export interface AudioOptions {
  bitrate: number; // e.g., 128, 192, 320 kbps
  sampleRate: number; // e.g., 44100, 48000
}

export interface VideoOptions {
  fps: number; // e.g. 15, 24, 30, 60
  scale: number; // 0.25 to 1.0
  quality: number; // 0.1 to 1.0
}

export interface DocumentOptions {
  fontSize: number; // 10, 12, 14, 16
  pageOrientation: 'portrait' | 'landscape';
}

export interface ConversionOptions {
  image?: ImageOptions;
  audio?: AudioOptions;
  video?: VideoOptions;
  document?: DocumentOptions;
}

export type ConversionStatus = 'idle' | 'converting' | 'completed' | 'error';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  category: Exclude<FileCategory, 'all'>;
  targetFormat: TargetFormat;
  status: ConversionStatus;
  progress: number;
  statusMessage?: string;
  convertedUrl: string | null;
  convertedBlob: Blob | null;
  convertedName: string | null;
  convertedSize: number | null;
  errorMsg: string | null;
  options: ConversionOptions;
  previewUrl?: string;
}
