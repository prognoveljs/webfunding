export function getReceiptURL(url: string, verifyServiceEndpoint: string): string {
  if (!verifyServiceEndpoint) return url;
  if (verifyServiceEndpoint.substring(-1) !== "/") verifyServiceEndpoint += "/";
  return verifyServiceEndpoint + encodeURIComponent(url);
}
