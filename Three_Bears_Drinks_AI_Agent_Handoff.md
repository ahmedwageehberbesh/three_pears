# THREE BEARS DRINKS — AI AGENT MASTER CONTEXT

Version: 1.0
Date: 2026-09-22
Status: Project discovery / design-to-build handoff

---

## 0. READ THIS FIRST

You are an AI product/design/development agent working on a website for a real drinks business.

Do NOT treat this as a generic cartoon landing page.

The business already has a visual identity and an existing menu. The uploaded reference image shows the current menu. The website must evolve that identity into a modern interactive ordering experience.

The business idea is based on the three bear characters:
- قطبي (Qotbi / Ice Bear)
- باندا (Panda)
- شهاب (Shihab)

Each character has a different personality/taste direction and a dedicated group of drinks.

The first release is NOT a full e-commerce/payment platform.

The first release is:
Brand Experience + Menu + Product Details + Cart + Customer Information + WhatsApp/Messenger Order Handoff.

---

# 1. WHERE THE PROJECT STANDS RIGHT NOW

The project is currently at the product-definition/design stage.

Known facts:
1. The business already has a menu.
2. The current menu is visually organized around the three bears.
3. The menu uses a natural/forest background and illustrated bear characters.
4. Products are separated by character.
5. The website should be inspired by the cartoon world, but should NOT look like a cheap children's website.
6. The desired direction is modern, playful, immersive, and premium.
7. The site should allow customers to build an order.
8. When the customer presses order, the site should prepare the order as a message and send/open WhatsApp or Messenger.
9. Mobile is the primary device.
10. The menu image is a reference, not the final data source. Before launch, the actual product list, prices, options, and approved assets must be entered as structured data.

---

# 2. IMPORTANT: DO NOT INVENT BUSINESS DATA

Never invent:
- product names
- prices
- ingredients
- sizes
- add-ons
- opening hours
- address
- phone numbers
- WhatsApp number
- Messenger URL

If a value is not provided, use a clearly marked placeholder during development and create a TODO.

Example:
WHATSAPP_NUMBER = "<BUSINESS_TO_PROVIDE>"

Do not silently guess.

---

# 3. PRODUCT VISION

The customer should feel:

"I entered the world of the three bears."

The website should guide the customer through:

OPEN WEBSITE
→ discover the bears
→ choose/explore a bear
→ see its drinks
→ open product
→ add to cart
→ review order
→ enter customer details
→ choose WhatsApp/Messenger
→ hand off the prepared order

The core idea is:

"Which bear matches your drink today?"

---

# 4. BRAND / VISUAL DIRECTION

The reference menu already establishes a visual language.

Use it as the starting point:
- forest/nature atmosphere
- illustrated bear characters
- warm brown/cream tones
- dark sections
- character-specific color treatments
- rounded shapes
- friendly typography
- premium but playful composition

Do NOT:
- replace the identity with a random generic palette
- use glassmorphism everywhere
- make it look like a corporate SaaS dashboard
- make it look like a children's school website
- overload every section with animations
- make animation more important than ordering

Desired feeling:
Modern Playful Brand
+
Immersive Cartoon World
+
Premium Drinks UI

---

# 5. CHARACTER DIRECTION

## قطبي / Ice Bear

Concept:
Cold, ice, refreshing, unique.

Visual direction:
- white
- ice blue
- cyan accents
- snow/ice particles
- frost transitions
- subtle cool motion

Important:
The exact products must come from the approved business menu.

## باندا / Panda

Concept:
Soft, calm, cozy, sweet/stylish.

Visual direction:
- dark/black
- white
- warm neutral/brown
- optional soft accent

Motion:
- smooth
- floating
- calm transitions

## شهاب / Shihab

Concept:
Warm, energetic, playful.

Visual direction:
- brown
- warm orange
- cream
- playful motion

Motion:
- bounce
- quick but controlled transitions
- playful micro-interactions

---

# 6. WEBSITE STRUCTURE

Recommended:

Home
1. Hero
2. Meet the Bears
3. Featured Drinks
4. Character Worlds
   - Qotbi
   - Panda
   - Shihab
5. Full Menu
6. Optional "Which Bear Are You?" interaction
7. Cart
8. Order Form
9. Footer

The exact order can be changed if UX testing suggests a better flow.

---

# 7. HERO

Hero should communicate:
- this is a drinks brand
- the brand is based on three bears
- the website is interactive
- the user can explore/order immediately

Possible copy direction:
"Welcome to the Bears' World"
"Three bears. Three personalities. Your drink."

Do not lock copy until the business approves it.

Hero media:
- short loop video OR optimized image
- muted video
- poster image
- fallback image
- no huge video that blocks first paint

Primary CTA:
Explore Menu

Secondary CTA:
Order Now

---

# 8. MENU

The menu must be real structured data.

Example:

bear
  ↓
products
  ↓
product details
  ↓
options
  ↓
cart

Do not implement the whole menu as one JPG/PNG.

The reference image is for visual understanding only.

---

# 9. PRODUCT CARD

Minimum:
- product image
- product name
- short description
- price
- Add button

Optional:
- bear badge
- category badge
- "popular" badge, ONLY if business provides that information

Do not create fake ratings/reviews.

---

# 10. PRODUCT DETAILS

Should support:
- name
- description
- image
- price
- quantity
- size if applicable
- add-ons if applicable
- notes if applicable

If there are no options for a product, do not display an empty options section.

---

# 11. CART

Cart should support:
- list items
- quantity +/-
- remove
- subtotal/total
- notes
- customer details
- order CTA

Mobile:
Use a bottom/floating cart indicator.

Desktop:
Drawer or side panel is acceptable.

---

# 12. ORDER HANDOFF

The website does not need to process payment in v1.

When the user submits:

1. Validate customer information.
2. Validate cart.
3. Calculate total from structured product data.
4. Generate a clean Arabic/English order message according to business language.
5. URL encode the message.
6. Open WhatsApp or Messenger.
7. Do not claim that the order is completed unless the external channel confirms it.

Example message:

🐻 طلب جديد — الدببة الثلاثة

الاسم: {name}
الهاتف: {phone}

الطلب:
• {qty} × {product}
• {qty} × {product}

الإجمالي: {total} جنيه

العنوان/الملاحظات:
{notes}

---

# 13. DATA MODEL

Suggested:

Bear
- id
- name
- slug
- description
- theme
- hero_media

Product
- id
- bear_id
- category_id
- name
- slug
- description
- price
- image
- video
- active
- sort_order

ProductOption
- id
- product_id
- name
- price_delta
- active

OrderDraft
- customer_name
- phone
- address
- notes
- items
- total
- channel
- created_at

For v1, OrderDraft may remain client-side if the business does not need backend storage.

---

# 14. TECHNICAL DIRECTION

Preferred web stack can be:

- Next.js / React
- TypeScript
- Tailwind CSS
- Framer Motion
- optional GSAP only when genuinely needed

Do not introduce heavy libraries without a reason.

Architecture should be componentized.

Example:

src/
  app/
  components/
    layout/
    hero/
    bears/
    menu/
    product/
    cart/
    order/
    shared/
  data/
  lib/
  types/
  public/
    images/
    videos/

Keep business data separated from presentation.

---

# 15. RESPONSIVE DESIGN

Mobile is priority.

Test:
- 320px
- 360px
- 390px
- 430px
- tablet
- desktop

Requirements:
- touch-friendly buttons
- no hover-only functionality
- readable Arabic text
- fast menu access
- persistent/obvious cart
- video fallback
- no horizontal overflow

---

# 16. ANIMATION RULES

Animations should support the story.

Use:
- fade
- slide
- scale
- parallax
- character reveal
- subtle floating
- character-specific effects

Avoid:
- constant bouncing
- excessive particles
- long intro animations
- blocking loaders
- animations that make text unreadable

Respect:
prefers-reduced-motion

---

# 17. PERFORMANCE

This is important because the website may contain videos.

Requirements:
- lazy load below-the-fold media
- compressed images
- WebP/AVIF when possible
- video poster
- mobile-friendly video sizes
- do not autoplay multiple large videos simultaneously
- use intersection observer where appropriate
- optimize fonts
- avoid layout shift

---

# 18. ACCESSIBILITY

Minimum:
- semantic HTML
- keyboard navigation
- visible focus
- alt text
- sufficient contrast
- proper labels
- buttons should have clear names
- reduced-motion support

Arabic RTL must be correctly implemented.

---

# 19. RTL / LANGUAGE

Primary language is expected to be Arabic.

The implementation should be ready for:
Arabic RTL
English LTR

Do not mix directionality incorrectly.

Numbers, prices, and product names should remain visually stable.

---

# 20. SEO / SOCIAL

Prepare:
- title
- description
- Open Graph image
- favicon
- social sharing metadata
- structured headings

The site should be shareable from social media.

---

# 21. WHAT THE AI AGENT MUST DO BEFORE CODING

Do not immediately start generating the entire codebase.

First:
1. Restate the understanding of the project.
2. Identify missing business data.
3. Propose the information architecture.
4. Propose component architecture.
5. Propose the data model.
6. Identify media requirements.
7. Identify risks.
8. Create an implementation plan.
9. Wait for approval before major implementation if the workflow requires human approval.

---

# 22. MISSING INPUTS / TODO

Business must provide:
- final product list
- final prices
- descriptions
- sizes
- add-ons
- product images
- approved videos
- logo in high resolution
- exact WhatsApp number
- Messenger page/link
- location/address
- opening hours
- delivery policy
- pickup/delivery distinction
- order minimum, if any
- final language/copy
- social media links

---

# 23. ACCEPTANCE CRITERIA

The build is not considered ready until:

[ ] Menu data is real
[ ] Prices are real
[ ] WhatsApp number is real
[ ] Messenger link is real
[ ] Product cards work
[ ] Product details work
[ ] Cart works
[ ] Quantity updates work
[ ] Total is correct
[ ] Order message is correct
[ ] WhatsApp handoff works
[ ] Mobile UI works
[ ] Desktop UI works
[ ] RTL works
[ ] Videos have fallbacks
[ ] Images are optimized
[ ] No placeholder data remains
[ ] Basic accessibility checks pass
[ ] Social sharing metadata exists

---

# 24. IMPORTANT PRODUCT DECISION

Do not overbuild v1.

The business currently needs a beautiful, fast, easy ordering website.

Do NOT add:
- authentication
- payment gateway
- loyalty
- inventory
- complex admin dashboard
- advanced backend
unless the business explicitly asks for them.

Build the foundation so those can be added later.

---

# 25. FINAL PRODUCT STATEMENT

This is not:
"an online menu with a cartoon background."

It is:

"An interactive digital world for a drinks brand where the three bear personalities guide the customer to the right drink and make ordering through WhatsApp/Messenger simple."

The website should balance:

Brand identity
+
Storytelling
+
Product discovery
+
Fast ordering
+
Performance

That balance is the main success condition.
