// Adapted from https://blog.logrocket.com/programmatic-file-downloads-in-the-browser-9a5186298d5c/
// at 2022-09-27
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = filename;

  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.removeEventListener('click', clickHandler);
    }, 150);
  };

  a.addEventListener('click', clickHandler, false);

  a.click();
}
