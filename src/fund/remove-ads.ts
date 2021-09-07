interface WMDocument extends Document {
  monetization: any;
}

export function removeAdsOnWebMonetization(elements: string) {
  if (!(document as WMDocument).monetization) return;
  (document as WMDocument).monetization.addEventListener(
    "monetizationprogress",
    () => {
      document.querySelectorAll(elements).forEach((el) => el.remove());
    },
    { once: true },
  );
}
