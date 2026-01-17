# Dari.com - Real Estate Marketplace Design Guidelines

## Design Approach

**Reference-Based Design** combining Airbnb's visual trust with Linear's clean typography and Zillow's property-focused layouts. Mauritanian cultural identity through rich green and gold color palette creates a distinctive, welcoming marketplace for Arabic-speaking users.

---

## Color System

**Primary Colors:**
- Rich Green: `#006233` (navigation, CTAs, active states)
- Deep Forest: `#004D28` (hover states, headers)
- Soft Green: `#E8F5E9` (backgrounds, subtle highlights)

**Accent Colors:**
- Gold: `#FFD700` (premium badges, highlights)
- Warm Gold: `#F5C842` (secondary actions)
- Light Gold: `#FFF9E6` (notification backgrounds)

**Neutrals:**
- Text Primary: `#1A1A1A`
- Text Secondary: `#666666`
- Border: `#E0E0E0`
- Background: `#FAFAFA`
- White: `#FFFFFF`

**Semantic:**
- Success: `#2E7D32`
- Warning: `#F57C00`
- Error: `#D32F2F`
- Info: `#1976D2`

---

## Typography System

**Font Families:**
- Arabic (Primary): Cairo - all weights (300, 400, 600, 700)
- English (Fallback): Inter for LTR content

**Type Scale:**
- Hero: text-5xl (48px) font-bold
- Page Titles: text-4xl (36px) font-bold
- Section Headers: text-2xl (24px) font-semibold
- Card Titles: text-xl (20px) font-semibold
- Body: text-base (16px) font-normal
- Meta: text-sm (14px) font-medium
- Captions: text-xs (12px) font-normal

**RTL Implementation:**
- Default direction: RTL for all layouts
- Mirror horizontal spacing and positioning
- Right-align all text blocks
- Flip icons and navigation patterns

---

## Layout System

**Spacing Units:** 2, 4, 6, 8, 12, 16, 20, 24 (Tailwind primitives)

**Containers:**
- Max width: max-w-7xl
- Content: max-w-6xl
- Forms: max-w-2xl

**Grid Patterns:**
- Property cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Gap spacing: gap-6 (desktop), gap-4 (mobile)

**Section Rhythm:**
- Desktop: py-20 px-8
- Tablet: py-16 px-6
- Mobile: py-12 px-4

---

## Component Library

### Navigation
- Fixed header, h-16, green background with subtle shadow
- Logo right (RTL), navigation center, user menu left
- Gold underline for active nav items
- Language toggle with flags (Arabic/English)
- Mobile: Slide-in drawer from right

### Property Cards
- 4:3 aspect ratio images
- Green gradient overlay on hover
- Gold "مميز" (Featured) badge top-right corner
- Heart icon (outlined) top-left
- Content: p-4, white background
- Price in gold, text-2xl font-bold
- Location with green pin icon
- Specs row: beds/baths/area with icons
- Hover: lift effect with enhanced shadow

### Hero Section (Homepage)
- h-[600px] full-width background
- Professional architectural photography: modern Dubai/Riyadh skyline at golden hour
- Dark gradient overlay (bottom 60%)
- Centered content with gold accent line
- Headline: "ابحث عن بيتك المثالي" (Find Your Perfect Home)
- Search bar: white with green search button, h-14
- Quick filters below: rounded-full chips (للبيع/للإيجار)

### Search & Filters
**Desktop:**
- Right sidebar (RTL), w-80, sticky
- Green section headers
- White cards with subtle borders
- Gold checkboxes for active filters
- Price range slider with green fill

**Mobile:**
- Bottom sheet with green header
- Full-screen overlay
- Apply button: green, fixed bottom
- Active filter count badge in gold

### Property Detail Layout
**Image Gallery:**
- Hero gallery: h-[500px] lg:h-[650px]
- Thumbnail strip below: h-24, RTL scroll
- Fullscreen lightbox with green navigation arrows
- Image counter in gold circle

**Information Grid:**
- Two-column desktop: 2/3 details (right), 1/3 contact card (left, sticky)
- Mobile: stacked
- Price: text-5xl, gold color
- Green badges: status, category
- Specs grid: 2-column with green icons
- Description: prose text, right-aligned

### Contact Card (Sticky)
- White card with green border
- Agent avatar with gold verified badge
- Green WhatsApp button (primary)
- Outlined phone button
- Request viewing button: gold background
- All buttons: backdrop-blur on images

### Forms (Create Listing)
- Progressive sections with green step indicators
- Image upload: dashed green border, drag zone h-48
- Preview grid: 4 columns with remove overlay
- Map picker: h-96 with green marker
- Submit: large green button, full-width

### Badges & Status
- Featured: gold background, rounded-full
- Sale/Rent: green outlined
- Sold: diagonal red ribbon
- New: green badge with pulse animation
- All: px-3 py-1, text-sm font-medium

---

## Page Layouts

### Homepage
1. **Hero Section** (detailed above)
2. **Featured Properties**: 4-column grid, py-20, gold section title
3. **Categories**: 3-column cards with icons, green hover backgrounds
4. **Popular Locations**: Image cards with green overlays
5. **Statistics**: 4-column counters with gold numbers
6. **Trust Indicators**: Partner logos, centered
7. **CTA Section**: Green background, gold button, white text

### Listings Page
- Right sidebar filters (RTL)
- Results header: count (gold), sort dropdown, grid/map toggle
- Map view: Split screen with property markers (green pins)
- 12 items per page
- Load more button: green outlined

### Profile Dashboard
- Cover image: h-48, green gradient
- Avatar: large, -mt-16 overlap, gold border
- Tabs: underline style, gold active indicator
- Stats cards: white with green accents
- Listings grid below

### Favorites
- Same grid as main listings
- Empty state: gold heart icon, encouraging message

---

## Images

**Hero Image:**
- Modern Middle Eastern cityscape at sunset
- Luxury residential towers with warm lighting
- Clear sky with golden hour glow

**Property Images:**
- High-quality architectural photography
- Mix: villas, apartments, commercial spaces
- Professional staging and lighting
- Include Arabic architectural elements where appropriate

**Empty States:**
- Illustrated home with search glass
- Gold and green color scheme
- Friendly Arabic messaging

---

## Responsive Breakpoints

- Mobile: < 768px (single column, bottom nav with green background)
- Tablet: 768-1024px (2 columns, collapsible sidebar)
- Desktop: > 1024px (full layouts, sticky elements)

**Mobile Enhancements:**
- Floating green FAB for "إضافة عقار" (Add Property)
- Swipeable galleries
- Bottom sheet filters
- Tap-to-call with green highlight

---

## Interactions

**Loading:** Green pulsing skeleton loaders
**Hover:** Cards lift with shadow, images zoom slightly
**Success:** Gold toast notifications, top-left (RTL)
**Error:** Red toast, inline validation
**Transitions:** 200ms ease-in-out for all state changes