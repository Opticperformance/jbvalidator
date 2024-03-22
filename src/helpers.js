function formatBytes(bytes) {
  if (bytes === 0) return '0 octet';
  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isMimeTypeMatching(mimeType, mimeTypes) {
    for (let i = 0; i < mimeTypes.length; i++) {
        const currentType = mimeTypes[i];
        if (currentType === mimeType) {
            return true;
        }
        if (currentType.endsWith('/*')) {
            const wildcardPrefix = currentType.slice(0, -2);
            if (mimeType.startsWith(wildcardPrefix)) {
                return true;
            }
        }
    }
    return false;
}

function getFileExtensionsFromMimeTypes(mimeTypes) {
  const extensions = [];
  const mimeToExtMap = {
      // Image MIME types
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/bmp': ['bmp'],
      'image/webp': ['webp'],
      'image/svg+xml': ['svg'],
      'image/tiff': ['tiff', 'tif'],
      
      // Video MIME types
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/ogg': ['ogv', 'ogg'],
      
      // Common application MIME types
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'application/vnd.ms-powerpoint': ['ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
      'application/zip': ['zip'],
      'application/x-rar-compressed': ['rar'],
      'application/octet-stream': ['bin'],
      'application/json': ['json'],
      'application/xml': ['xml'],
      'application/xhtml+xml': ['xhtml'],
      'application/javascript': ['js'],
      'application/xhtml+xml': ['xhtml'],
      'application/x-shockwave-flash': ['swf'],
      'application/rtf': ['rtf'],
      'application/octet-stream': ['bin'],
      'application/vnd.android.package-archive': ['apk'],
      
      // Audio MIME types
      'audio/mpeg': ['mp3'],
      'audio/wav': ['wav'],
      'audio/ogg': ['ogg'],
      'audio/midi': ['midi', 'mid'],
      'audio/aac': ['aac'],
      'audio/flac': ['flac'],
      'audio/webm': ['weba'],
      'audio/x-ms-wma': ['wma']
  };

  mimeTypes.forEach(mimeType => {
      const extensionsForType = mimeToExtMap[mimeType];
      if (extensionsForType) {
          extensions.push(...extensionsForType);
      } else {
          // Handle wildcard MIME types
          Object.keys(mimeToExtMap).forEach(key => {
              if (key.startsWith(mimeType.split('/')[0])) {
                  extensions.push(...mimeToExtMap[key]);
              }
          });
      }
  });

  return extensions;
}

export { formatBytes, getFileExtensionsFromMimeTypes, isMimeTypeMatching };
