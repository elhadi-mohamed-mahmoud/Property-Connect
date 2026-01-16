# Real Estate Listings Platform - Design Guidelines

## Design Approach

**Reference-Based Design** drawing from modern property marketplaces (Airbnb, Zillow) combined with clean SaaS aesthetics (Linear, Notion). This platform prioritizes visual trust, content discovery, and seamless property browsing across devices.

---

## Typography System

**Font Families:**
- Primary: Inter (headings, UI elements, body text)
- Arabic: Cairo (for RTL language support)

**Type Scale:**
- Hero Headlines: text-5xl (48px) font-bold
- Page Titles: text-3xl (30px) font-bold
- Section Headers: text-2xl (24px) font-semibold
- Card Titles: text-xl (20px) font-semibold
- Body Text: text-base (16px) font-normal
- Labels/Meta: text-sm (14px) font-medium
- Captions: text-xs (12px) font-normal

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm.

**Container Widths:**
- Max content width: max-w-7xl (1280px)
- Property detail content: max-w-6xl (1152px)
- Forms: max-w-2xl (672px)

**Grid Systems:**
- Property listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Filter sidebar: Two-column layout (sidebar + main content)
- Property detail: Single column with full-width image gallery

**Section Padding:**
- Desktop: py-20, px-8
- Tablet: py-16, px-6
- Mobile: py-12, px-4

---

## Component Library

### Navigation Header
- Fixed header with logo left, navigation center, user actions right
- Height: h-16 (64px)
- Language switcher with flag icons
- User menu dropdown on avatar click
- Mobile: Hamburger menu with slide-out drawer

### Property Cards (Grid View)
- Aspect ratio: 4:3 for main image
- Card structure: Image → Badge overlay → Content section
- Badges: Absolute positioned top-2 left-2 (Sale/Rent, Category)
- Heart icon: Absolute positioned top-2 right-2
- Content padding: p-4
- Hover: Subtle lift (shadow-lg transform scale-[1.02])
- Sold badge: Diagonal ribbon across image corner

### Property Detail Page Layout
**Image Gallery:**
- Full-width hero gallery (h-96 lg:h-[600px])
- Thumbnail strip below main image (h-20, scrollable)
- Fullscreen lightbox modal with navigation arrows
- Image counter overlay (e.g., "3/10")

**Information Layout:**
- Two-column desktop: 2/3 property info, 1/3 contact card (sticky)
- Mobile: Single column stack
- Badges row: flex gap-2, mb-4
- Price: Prominent display (text-4xl font-bold)

### Map Components
**Map View Toggle:**
- Floating button group (Grid/Map icons)
- Position: Sticky top-20 right-4

**Map Popup:**
- Compact card (w-64)
- Image thumbnail (h-32)
- Title, price, "View Details" button

**Map Marker Clusters:**
- Show property count when multiple markers overlap
- Expand on click

### Search & Filter Interface
**Desktop Filters:**
- Left sidebar (w-72, sticky)
- Collapsible sections with chevron icons
- Active filter badges above results

**Mobile Filters:**
- Bottom sheet drawer (slides up)
- Full-screen overlay on trigger
- Apply/Clear buttons fixed at bottom

**Search Bar:**
- Prominent position (h-12)
- Search icon left, clear icon right
- Debounced input (300ms)

### Forms (Create/Edit Listing)
**Layout:**
- Single column, max-w-2xl
- Grouped sections with section headers (text-lg font-semibold, mb-4)
- Multi-step progress indicator at top (for mobile)

**Image Upload:**
- Drag-and-drop zone (border-dashed, min-h-48)
- Preview grid for uploaded images (grid-cols-2 md:grid-cols-4, gap-4)
- Image cards with remove button overlay on hover

**Map Picker:**
- Embedded map (h-96)
- Click-to-place marker interaction
- Coordinates display below map

### Buttons
- Primary: Solid fill, rounded-lg, px-6 py-3
- Secondary: Border outline, same sizing
- Icon buttons: Square (w-10 h-10), rounded-full
- CTAs on images: Backdrop blur background (backdrop-blur-sm bg-white/90)

### Badges & Tags
- Rounded-full px-3 py-1 text-sm
- Category badges: Outlined style
- Status badges: Solid fill
- Filter tags: Removable with × icon

### Contact Actions
- Large touch targets (min-h-12)
- Icon + text layout
- WhatsApp button: Distinctive green treatment
- Phone button: Tap-to-call on mobile, shows number on desktop

---

## Page-Specific Layouts

### Homepage
**Hero Section (h-[500px]):**
- Full-width background: Subtle gradient overlay on city skyline image
- Centered search bar (max-w-3xl)
- Headline above search: "Find Your Perfect Property"
- Quick filter chips below search (Sale/Rent, Property Type)

**Featured Listings:**
- Section title: "Recently Added Properties"
- 4-column grid on desktop
- View All button aligned right

### Listings Page
- Sticky filter sidebar (desktop)
- Results header: Count, sort dropdown, view toggle (Grid/Map)
- 12 items per page
- Pagination centered at bottom

### Profile Pages
- Header section: Avatar (large), name, edit button
- Tab navigation: "My Listings" | "Account Settings"
- Listings grid below tabs

### Favorites Page
- Same grid layout as main listings
- Empty state: Large icon, "No favorites yet", browse button

---

## Images

**Hero Image:**
- Modern city skyline or upscale residential neighborhood
- Sunset/golden hour lighting
- Subtle gradient overlay (from transparent to semi-dark at bottom)

**Property Placeholder Images:**
- Use high-quality real estate photography
- Variety: houses, apartments, land plots, commercial buildings
- Professional, well-lit interior and exterior shots

**Empty States:**
- Illustration of a house with magnifying glass (search)
- Heart icon for favorites empty state
- Document icon for no listings

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, bottom sheets, stacked filters)
- Tablet: 768px - 1024px (2-column grids, collapsible sidebar)
- Desktop: > 1024px (full multi-column layouts, sticky sidebars)

**Mobile Optimizations:**
- Bottom navigation bar (fixed)
- Collapsible map on listings (toggle to expand)
- Swipeable image galleries
- Floating action button for "Create Listing"

---

## Interactions & States

**Loading States:**
- Skeleton loaders for property cards (pulsing rectangles)
- Spinner for form submissions (centered, overlay)

**Hover States:**
- Cards: Lift effect (translateY -2px, shadow increase)
- Images: Slight zoom on property card images
- Buttons: Darken by 10%

**Empty States:**
- Centered icon + message + action button
- Friendly, encouraging tone

**Error States:**
- Toast notifications (top-right, slide in)
- Inline form validation (red text below fields)

**Success States:**
- Green checkmark toast notifications
- Confirmation modals with success icon

---

## RTL (Arabic) Support

**Layout Mirroring:**
- Flip horizontal layouts (sidebar moves to right)
- Reverse grid order where appropriate
- Mirror navigation patterns

**Typography:**
- Use Cairo font for Arabic text
- Maintain same type scale
- Right-align Arabic text blocks