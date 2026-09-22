export const config = {
  businessName: { ar: "الدببة الثلاثة", en: "Three Bears Drinks" },
  whatsappNumber: "201220021084",
  deliveryArea: "نوصل لكل المناطق المحيطة",
  openingHours: { ar: "متاح على مدار الساعة", en: "Open 24/7" },
  currency: { ar: "جنيه", en: "EGP" },
  phonePattern: /^0\d{9,14}$/,
  social: [
    { id: "instagram", label: "Instagram", url: "http://instagram.com/three_pears3?stkn=mtvuawmxoxpwcm9soa%3D%3D" },
    { id: "tiktok", label: "TikTok", url: "<BUSINESS_TO_PROVIDE>" },
    { id: "facebook", label: "Facebook", url: "https://www.facebook.com/share/1FZhvp5xBS/" }
  ]
};

export const isProvided = (value) =>
  typeof value === "string" && value.trim() !== "" && !value.includes("<BUSINESS_TO_PROVIDE>");
