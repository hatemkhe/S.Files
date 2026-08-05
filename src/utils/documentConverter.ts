import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import { DocumentFormat, DocumentOptions } from '../types';

export async function convertDocument(
  file: File,
  targetFormat: DocumentFormat,
  options: DocumentOptions,
  onProgress?: (progress: number, statusMessage: string) => void
): Promise<Blob> {
  onProgress?.(10, 'جاري قراءة محتوى المستند...');

  const textContent = await file.text();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

  onProgress?.(40, `جاري المعالجة والتحويل إلى صيغة ${targetFormat.toUpperCase()}...`);

  // Target: PDF
  if (targetFormat === 'pdf') {
    onProgress?.(60, 'جاري إنشاء ملف PDF وتنسيق الصفحات...');
    const pdfBlob = createPdfFromText(textContent, fileExt, options);
    onProgress?.(100, 'اكتمل إنشاء ملف PDF!');
    return pdfBlob;
  }

  // Target: HTML
  if (targetFormat === 'html') {
    let bodyHtml = '';
    if (fileExt === 'md' || fileExt === 'markdown') {
      bodyHtml = await marked.parse(textContent);
    } else if (fileExt === 'html' || fileExt === 'htm') {
      bodyHtml = textContent;
    } else {
      // Plain text or PDF text
      const escapedText = textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; white-space: pre-wrap;">${escapedText}</div>`;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace(/\.[^/.]+$/, '')}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 2rem; background: #fafafa; color: #111827; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    h1, h2, h3 { color: #1e1b4b; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    ${bodyHtml}
  </div>
</body>
</html>`;

    onProgress?.(100, 'اكتمل تحويل المستند إلى HTML!');
    return new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  }

  // Target: TXT
  if (targetFormat === 'txt') {
    let cleanText = textContent;
    if (fileExt === 'html' || fileExt === 'htm') {
      const doc = new DOMParser().parseFromString(textContent, 'text/html');
      cleanText = doc.body.textContent || doc.body.innerText || '';
    } else if (fileExt === 'md') {
      cleanText = textContent
        .replace(/#+\s/g, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`{1,3}(.*?)(`{1,3})/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1');
    }

    onProgress?.(100, 'اكتمل التحويل إلى نص TXT!');
    return new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
  }

  // Target: MD (Markdown)
  if (targetFormat === 'md') {
    let mdContent = textContent;
    if (fileExt === 'html' || fileExt === 'htm') {
      const doc = new DOMParser().parseFromString(textContent, 'text/html');
      // Simple HTML to Markdown
      mdContent = convertHtmlToMarkdown(doc.body);
    } else if (fileExt === 'txt') {
      const lines = textContent.split('\n');
      mdContent = lines.map((line, idx) => (idx === 0 && line.trim() ? `# ${line.trim()}\n` : line)).join('\n');
    }

    onProgress?.(100, 'اكتمل التحويل إلى Markdown!');
    return new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  }

  onProgress?.(100, 'اكتمل التحويل!');
  return new Blob([textContent], { type: 'text/plain;charset=utf-8' });
}

function createPdfFromText(text: string, sourceExt: string, options: DocumentOptions): Blob {
  const doc = new jsPDF({
    orientation: options.pageOrientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const fontSize = options.fontSize || 12;
  doc.setFont('helvetica');
  doc.setFontSize(fontSize);

  // Margins & Dimensions
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;

  let cleanText = text;
  if (sourceExt === 'html' || sourceExt === 'htm') {
    const parsed = new DOMParser().parseFromString(text, 'text/html');
    cleanText = parsed.body.textContent || '';
  }

  const lines = doc.splitTextToSize(cleanText, maxLineWidth);
  let cursorY = margin + 10;
  const lineHeight = fontSize * 0.5;

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin + 10;
    }
    doc.text(lines[i], margin, cursorY);
    cursorY += lineHeight;
  }

  return doc.output('blob');
}

function convertHtmlToMarkdown(element: HTMLElement): string {
  let md = '';
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      md += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      switch (tag) {
        case 'h1': md += `\n# ${el.textContent}\n\n`; break;
        case 'h2': md += `\n## ${el.textContent}\n\n`; break;
        case 'h3': md += `\n### ${el.textContent}\n\n`; break;
        case 'p': md += `\n${el.textContent}\n\n`; break;
        case 'strong':
        case 'b': md += `**${el.textContent}**`; break;
        case 'em':
        case 'i': md += `*${el.textContent}*`; break;
        case 'code': md += `\`${el.textContent}\``; break;
        case 'pre': md += `\n\`\`\`\n${el.textContent}\n\`\`\`\n\n`; break;
        case 'ul': md += `\n${convertHtmlToMarkdown(el)}\n`; break;
        case 'li': md += `- ${el.textContent}\n`; break;
        default: md += convertHtmlToMarkdown(el); break;
      }
    }
  }
  return md;
}
