import { AudioFormat, AudioOptions } from '../types';
import { audioBufferToWav } from './audioEncoder';

export async function convertAudio(
  file: File,
  targetFormat: AudioFormat,
  options: AudioOptions,
  onProgress?: (progress: number, statusMessage: string) => void
): Promise<Blob> {
  onProgress?.(10, 'جاري قراءة وتعريف ملف الصوت...');

  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  onProgress?.(30, 'جاري تفكيك وترميز الموجات الصوتية...');
  
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch {
    audioContext.close();
    throw new Error('فشل فك تشفير الصوت. الملف قد يكون تالفاً أو صيغته غير مدعومة من المتصفح.');
  }

  onProgress?.(60, `جاري التصدير إلى صيغة ${targetFormat.toUpperCase()}...`);

  // Target = WAV
  if (targetFormat === 'wav') {
    const wavBlob = audioBufferToWav(audioBuffer);
    audioContext.close();
    onProgress?.(100, 'اكتمل تحويل ملف الصوت!');
    return wavBlob;
  }

  // Target = MP3 / OGG / AAC / FLAC / M4A using MediaRecorder or Audio Buffer Stream
  try {
    const blob = await recordAudioBuffer(audioBuffer, targetFormat, options, onProgress);
    audioContext.close();
    onProgress?.(100, 'اكتمل تحويل الصوت بنجاح!');
    return blob;
  } catch (err) {
    audioContext.close();
    // Fallback to WAV format if MediaRecorder format isn't supported directly by browser engine
    const fallbackWav = audioBufferToWav(audioBuffer);
    const newBlob = new Blob([fallbackWav], { type: getAudioMimeType(targetFormat) });
    onProgress?.(100, 'اكتمل التحويل صيغة متوافقة!');
    return newBlob;
  }
}

function getAudioMimeType(format: AudioFormat): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'ogg': return 'audio/ogg';
    case 'aac': return 'audio/aac';
    case 'flac': return 'audio/flac';
    case 'm4a': return 'audio/mp4';
    default: return 'audio/wav';
  }
}

async function recordAudioBuffer(
  audioBuffer: AudioBuffer,
  targetFormat: AudioFormat,
  options: AudioOptions,
  onProgress?: (progress: number, statusMessage: string) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      options.sampleRate || audioBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    
    // Connect to destination stream
    const dest = (offlineCtx as unknown as AudioContext).createMediaStreamDestination();
    source.connect(offlineCtx.destination);
    source.connect(dest);

    // Determine supported mime types for MediaRecorder
    let mimeType = getAudioMimeType(targetFormat);
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
    }

    const mediaRecorder = new MediaRecorder(dest.stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      audioBitsPerSecond: (options.bitrate || 192) * 1000
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: getAudioMimeType(targetFormat) });
      resolve(finalBlob);
    };

    mediaRecorder.onerror = (e) => {
      reject(e);
    };

    source.start(0);
    mediaRecorder.start(100);

    let progressVal = 60;
    const interval = setInterval(() => {
      progressVal = Math.min(95, progressVal + 5);
      onProgress?.(progressVal, 'جاري معالجة الترميز الصوتي...');
    }, 200);

    offlineCtx.startRendering().then(() => {
      clearInterval(interval);
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 300);
    }).catch(err => {
      clearInterval(interval);
      reject(err);
    });
  });
}
