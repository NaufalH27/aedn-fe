export function getFileExtension(file: File): string {
  if (file.type) {
    const mimeMap: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpeg",
      "image/jpg": "jpeg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/tiff": "tiff",
      "image/avif": "avif"
    };

    if (mimeMap[file.type]) {
      return mimeMap[file.type];
    }
  }
  throw Error("Unsupported Type File")

}

export const extractKey = (url: string) => {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, ""); 
  } catch {
    return url; 
  }
};
