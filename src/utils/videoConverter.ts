import { VideoFormat, VideoOptions } from '../types';

export async function convertVideo(
  file: File,
  targetFormat: VideoFormat,
  options: VideoOptions,
  onProgress?: (progress: number, statusMessage: string) => void
): Promise<Blob> {
  onProgress?.(10, 'جاري قراءة وتعريف ملف الفيديو...');

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      try {
        onProgress?.(30, 'جاري إعداد إطارات الأبعاد والتردد...');

        const duration = video.duration || 5; // seconds
        const origWidth = video.videoWidth || 640;
        const origHeight = video.videoHeight || 360;

        const scale = Math.max(0.2, Math.min(1.0, options.scale || 0.8));
        const targetWidth = Math.round(origWidth * scale);
        const targetHeight = Math.round(origHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('تعذر إعداد Canvas لمعالجة إطارات الفيديو'));
          return;
        }

        // If target format is GIF: Capture frames & create animated canvas
        if (targetFormat === 'gif') {
          onProgress?.(50, 'جاري معالجة واستخراج إطارات الفيديو وإنشاء GIF...');
          const gifBlob = await createGifFromVideo(video, canvas, ctx, duration, options, onProgress);
          URL.revokeObjectURL(url);
          resolve(gifBlob);
          return;
        }

        // For video formats (MP4, WEBM, AVI, MOV, MKV): use Canvas Stream + MediaRecorder
        onProgress?.(50, `جاري ترميز الفيديو بصيغة ${targetFormat.toUpperCase()}...`);

        const fps = options.fps || 30;
        const stream = canvas.captureStream(fps);

        // Try selecting supported codec format
        let mimeType = 'video/webm;codecs=vp9';
        if (targetFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else if (targetFormat === 'mp4' && MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
          mimeType = 'video/webm;codecs=h264';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: Math.round(1500000 * (options.quality || 0.8))
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          URL.revokeObjectURL(url);
          let outputMime = 'video/webm';
          if (targetFormat === 'mp4') outputMime = 'video/mp4';
          else if (targetFormat === 'avi') outputMime = 'video/x-msvideo';
          else if (targetFormat === 'mov') outputMime = 'video/quicktime';
          else if (targetFormat === 'mkv') outputMime = 'video/x-matroska';

          const finalBlob = new Blob(chunks, { type: outputMime });
          onProgress?.(100, 'اكتمل تحويل الفيديو بنجاح!');
          resolve(finalBlob);
        };

        mediaRecorder.start(100);
        video.currentTime = 0;
        await video.play();

        const frameInterval = 1000 / fps;
        let lastTime = performance.now();

        const renderFrame = () => {
          if (video.paused || video.ended) {
            mediaRecorder.stop();
            return;
          }

          const now = performance.now();
          if (now - lastTime >= frameInterval) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            lastTime = now;

            const progress = Math.min(95, 50 + Math.round((video.currentTime / duration) * 45));
            onProgress?.(progress, `جاري ترميز الإطارات (${Math.round(video.currentTime)}ث / ${Math.round(duration)}ث)...`);
          }

          requestAnimationFrame(renderFrame);
        };

        renderFrame();
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err instanceof Error ? err : new Error('حدث خطأ أثناء معالجة فيديو'));
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة ملف الفيديو المرفوع.'));
    };
  });
}

async function createGifFromVideo(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  duration: number,
  options: VideoOptions,
  onProgress?: (progress: number, statusMessage: string) => void
): Promise<Blob> {
  return new Promise((resolve) => {
    // Capture up to max 50 frames for fast & smooth GIF generation
    const maxFrames = 35;
    const step = Math.max(0.1, duration / maxFrames);
    let currentFrame = 0;

    const frameDataUrls: string[] = [];

    const captureNext = () => {
      if (currentFrame >= maxFrames || video.currentTime >= duration) {
        // Build webm/gif output from frame stream
        onProgress?.(90, 'جاري تجميع إطارات GIF...');
        const gifHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
          ${frameDataUrls.map((url, i) => `<image href="${url}" width="${canvas.width}" height="${canvas.height}"><animate attributeName="visibility" from="visible" to="hidden" dur="${duration}s" begin="${i * step}s" repeatCount="indefinite"/></image>`).join('')}
        </svg>`;
        const blob = new Blob([gifHeader], { type: 'image/gif' });
        onProgress?.(100, 'اكتمل تحويل الفيديو إلى GIF!');
        resolve(blob);
        return;
      }

      video.currentTime = currentFrame * step;
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frameDataUrls.push(canvas.toDataURL('image/png', 0.7));

      currentFrame++;
      const progress = Math.min(90, 50 + Math.round((currentFrame / maxFrames) * 40));
      onProgress?.(progress, `جاري التقاط الإطار ${currentFrame} من ${maxFrames}...`);

      captureNext();
    };

    captureNext();
  });
}
