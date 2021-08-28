function getReceiptURL(url: string, verifyServiceEndpoint: string): string {
  if (!verifyServiceEndpoint) return url;
  return verifyServiceEndpoint + encodeURIComponent(url);
}
