import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { DocumentData } from './qr';

export type PdfResult =
  { ok: true; uri: string } | { ok: false; reason: string };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Builds a PDF on the phone with one row per field of the document object.
export async function createDocumentPdf(
  data: DocumentData,
): Promise<PdfResult> {
  const rows = Object.entries(data)
    .map(([key, value]) => {
      const shown = typeof value === 'string' ? value : JSON.stringify(value);
      return `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(shown)}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 22px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
  th { width: 35%; color: #555; font-weight: 600; }
  td { word-break: break-word; }
</style></head>
<body><h1>Document</h1><table>${rows}</table></body></html>`;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    return { ok: true, uri };
  } catch {
    return { ok: false, reason: 'The PDF could not be created.' };
  }
}

// Opens the share sheet for the PDF (save to Files, print, send...).
export async function sharePdf(uri: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  return true;
}
