import { FileItem } from '../types';
import { convertImage } from './imageConverter';
import { convertAudio } from './audioConverter';
import { convertDocument } from './documentConverter';
import { convertVideo } from './videoConverter';
import { getMimeType } from './formatUtils';

export async function processFileConversion(
  item: FileItem,
  onProgress: (progress: number, statusMessage: string) => void
): Promise<{ blob: Blob; url: string; convertedName: string; size: number }> {
  const { file, category, targetFormat, options } = item;

  onProgress(5, 'جاري تهيئة محرك التحويل المباشر...');

  let convertedBlob: Blob;

  switch (category) {
    case 'image':
      convertedBlob = await convertImage(
        file,
        targetFormat as any,
        options.image || { quality: 0.9, backgroundColor: '#ffffff' },
        onProgress
      );
      break;

    case 'audio':
      convertedBlob = await convertAudio(
        file,
        targetFormat as any,
        options.audio || { bitrate: 192, sampleRate: 44100 },
        onProgress
      );
      break;

    case 'document':
      convertedBlob = await convertDocument(
        file,
        targetFormat as any,
        options.document || { fontSize: 12, pageOrientation: 'portrait' },
        onProgress
      );
      break;

    case 'video':
      convertedBlob = await convertVideo(
        file,
        targetFormat as any,
        options.video || { fps: 30, scale: 0.8, quality: 0.8 },
        onProgress
      );
      break;

    default:
      throw new Error(`فئة الملف غير معروفة أو غير مدعومة: ${category}`);
  }

  // Ensure mime type is explicitly set
  const expectedMime = getMimeType(targetFormat);
  const finalBlob = new Blob([convertedBlob], { type: expectedMime || convertedBlob.type });

  const url = URL.createObjectURL(finalBlob);

  // Generate safe filename
  const rawBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const convertedName = `${rawBaseName}_sfiles.${targetFormat}`;

  return {
    blob: finalBlob,
    url,
    convertedName,
    size: finalBlob.size
  };
}
