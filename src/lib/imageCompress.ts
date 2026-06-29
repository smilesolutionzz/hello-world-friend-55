// Lightweight client-side image resize/compress for landing uploads.
// Reduces upload size & storage cost; max longest side 1600px, JPEG q≈0.85.

export interface CompressOptions {
  maxSide?: number;
  quality?: number;
  mime?: "image/jpeg" | "image/webp";
}

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<Blob> {
  const maxSide = opts.maxSide ?? 1600;
  const quality = opts.quality ?? 0.85;
  const mime = opts.mime ?? "image/jpeg";

  const bitmap = await createImageBitmap(file).catch(async () => {
    // Safari fallback
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      return await createImageBitmap(c);
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("compress failed"))), mime, quality)
  );
  // If compression actually made it bigger (small original), keep original.
  if (blob.size > file.size && /^image\//.test(file.type)) {
    return file;
  }
  return blob;
}

export function extFromMime(mime: string): string {
  if (mime.includes("webp")) return "webp";
  if (mime.includes("png")) return "png";
  return "jpg";
}
