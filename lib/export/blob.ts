/** Strip `data:image/png;base64,` prefix for JSZip `base64: true`. */
export function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) throw new Error("Invalid data URL");
  return dataUrl.slice(comma + 1);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
