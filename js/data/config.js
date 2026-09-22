export const config = {
  businessName: { ar: "الدببة الثلاثة", en: "Three Bears Drinks" },
  whatsappNumber: "<BUSINESS_TO_PROVIDE>",
  messengerUrl: "<BUSINESS_TO_PROVIDE>",
  address: "<BUSINESS_TO_PROVIDE>",
  openingHours: "<BUSINESS_TO_PROVIDE>",
  currency: { ar: "جنيه", en: "EGP" },
  phonePattern: /^0\d{9,14}$/,
  social: [
    { id: "instagram", label: "Instagram", url: "<BUSINESS_TO_PROVIDE>" },
    { id: "tiktok", label: "TikTok", url: "<BUSINESS_TO_PROVIDE>" },
    { id: "facebook", label: "Facebook", url: "<BUSINESS_TO_PROVIDE>" }
  ]
};

export const isProvided = (value) =>
  typeof value === "string" && value.trim() !== "" && !value.includes("<BUSINESS_TO_PROVIDE>");
