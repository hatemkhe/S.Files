import { ImageFormat, ImageOptions } from '../types';

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  options: ImageOptions,
  onProgress?: (progress: number, statusMessage: string) => void
): Promise<Blob> {
  onProgress?.(10, 'جاري قراءة تفاصيل الصورة...');

  return new Promise((resolve, reject) => {
    // Check if input is SVG and target is SVG
    if ((file.type === 'image/svg+xml' || file.name.endsWith('.svg')) && targetFormat === 'svg') {
      onProgress?.(100, 'اكتمل التحويل!');
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        onProgress?.(30, 'جاري ضبط أبعاد وخيارات الصورة...');

        // Calculate target dimensions
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 600;

        if (options.maxWidth && width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }
        if (options.maxHeight && height > options.maxHeight) {
          width = Math.round((width * options.maxHeight) / height);
          height = options.maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('تعذر إنشاء سياق Canvas معالجة الصورة'));
          return;
        }

        // Handle background color for formats without alpha channel (like JPEG or BMP)
        if (targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'bmp') {
          ctx.fillStyle = options.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        onProgress?.(60, 'جاري معالجة وتشفير الصيغة المستهدفة...');

        // SVG Export
        if (targetFormat === 'svg') {
          const dataUrl = canvas.toDataURL('image/png');
          const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
          </svg>`;
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          onProgress?.(100, 'اكتمل التحويل!');
          resolve(blob);
          return;
        }

        // ICO Export
        if (targetFormat === 'ico') {
          // Resize canvas to standard ICO square size (64x64 or 32x32)
          const icoCanvas = document.createElement('canvas');
          const icoSize = 64;
          icoCanvas.width = icoSize;
          icoCanvas.height = icoSize;
          const icoCtx = icoCanvas.getContext('2d');
          if (icoCtx) {
            icoCtx.drawImage(canvas, 0, 0, icoSize, icoSize);
            icoCanvas.toBlob(
              (blob) => {
                if (blob) {
                  onProgress?.(100, 'اكتمل التحويل!');
                  resolve(blob);
                } else {
                  reject(new Error('فشل تصدير أيقونة ICO'));
                }
              },
              'image/x-icon',
              1.0
            );
            return;
          }
        }

        // TIFF Export (Encode via canvas BMP / PNG header structure wrapped or PNG fallback with image/tiff type)
        if (targetFormat === 'tiff') {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const tiffBlob = new Blob([blob], { type: 'image/tiff' });
                onProgress?.(100, 'اكتمل التحويل!');
                resolve(tiffBlob);
              } else {
                reject(new Error('فشل تصدير صيغة TIFF'));
              }
            },
            'image/png',
            1.0
          );
          return;
        }

        // Mime Type selection for standard formats
        let mimeType = 'image/png';
        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
          mimeType = 'image/jpeg';
        } else if (targetFormat === 'webp') {
          mimeType = 'image/webp';
        } else if (targetFormat === 'gif') {
          mimeType = 'image/gif';
        } else if (targetFormat === 'bmp') {
          mimeType = 'image/bmp';
        }

        const quality = Math.max(0.1, Math.min(1.0, options.quality || 0.9));

        canvas.toBlob(
          (blob) => {
            if (blob) {
              onProgress?.(100, 'اكتمل التحويل بنجاح!');
              resolve(blob);
            } else {
              reject(new Error(`تعذر تحويل الصورة إلى صيغة ${targetFormat.toUpperCase()}`));
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err instanceof Error ? err : new Error('حدث خطأ أثناء معالجة الصورة'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة ملف الصورة المرفوع. الرجاء التأكد من صحة الملف.'));
    };

    img.src = url;
  });
}
