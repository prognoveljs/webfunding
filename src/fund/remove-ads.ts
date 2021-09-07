interface WMDocument extends Document {
  monetization: any;
}

export function removeAdsOnWebMonetization(elements: string) {
  if (!(document as WMDocument).monetization) return;
  console.log("trying to remove ads");
  (document as WMDocument).monetization.addEventListener(
    "monetizationprogress",
    () => {
      console.log("remove ads elements");
      document.querySelectorAll(elements).forEach((el) => el.remove());
    },
    { once: true },
  );
}
