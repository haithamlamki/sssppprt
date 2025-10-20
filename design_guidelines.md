# Design Guidelines: لجنة الرياضية - أبراج لخدمات الطاقة

## Design Approach

**Reference-Based Strategy**: Drawing inspiration from modern sports community platforms (Strava, Nike Run Club, TeamSnap) combined with corporate wellness aesthetics. The design celebrates athletic achievement while maintaining professional credibility suitable for a corporate environment.

## Color Palette

**Primary Colors:**
- Brand Energy Blue: 210 85% 45% (vibrant, trustworthy, energetic)
- Victory Orange: 25 95% 55% (celebration, achievement, warmth)
- Deep Navy: 220 40% 15% (professionalism, stability)

**Neutral Foundation:**
- Light mode backgrounds: 0 0% 98%, 0 0% 95%
- Dark mode backgrounds: 220 15% 8%, 220 15% 12%
- Text: Light mode 220 15% 20%, Dark mode 0 0% 95%

**Accent (Use Sparingly):**
- Success Green: 145 70% 45% (achievements, wins)
- Gold Trophy: 45 90% 55% (championships only)

## Typography

**Font Families:**
- Primary: 'IBM Plex Sans Arabic' (Google Fonts) - clean, modern, excellent Arabic support
- Display/Headers: 'Tajawal' (Google Fonts) - bold, impactful for headlines
- Numbers/Stats: 'Rubik' - for scores and statistics

**Scale:**
- Hero Headlines: text-5xl md:text-7xl font-bold
- Section Titles: text-3xl md:text-4xl font-bold
- Event Cards: text-xl font-semibold
- Body: text-base md:text-lg
- Captions: text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units: 4, 6, 8, 12, 16, 20, 24, 32
- Component padding: p-6 md:p-8
- Section spacing: py-16 md:py-24
- Card gaps: gap-6 md:gap-8
- Container max-width: max-w-7xl

**Grid Systems:**
- Events: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Featured Athletes: grid-cols-2 md:grid-cols-4
- Gallery: Masonry-style grid-cols-2 md:grid-cols-3 lg:grid-cols-4

## Component Library

**Navigation (Arabic RTL):**
- Fixed header with logo (right), navigation links (center), CTA button (left)
- Mobile: Hamburger menu (left side for RTL)
- Sticky on scroll with subtle shadow

**Hero Section:**
- Full-width dynamic sports imagery (team celebrating, action shots)
- Overlaid text with gradient overlay (from navy to transparent)
- Bold Arabic headline + supporting text
- Primary CTA button with backdrop-blur

**Event Cards:**
- Rounded corners (rounded-xl), shadow-lg
- Image top (16:9 ratio), content below
- Sport icon badge (absolute positioned)
- Countdown timer component for upcoming events
- Gradient border on hover

**Stats Counter:**
- Large numbers with animated count-up
- Icon + label below each stat
- 4-column grid on desktop, 2-column mobile

**Achievement Badges:**
- Circular design with trophy/medal icons
- Gold/silver/bronze color variations
- Player photo with achievement overlay

**Gallery Cards:**
- Hover overlay with event name + date
- Lightbox modal for full view
- Filter tabs by sport type

**News Ticker:**
- Horizontal auto-scroll marquee
- Pause on hover
- Sport emoji + news text format

**Footer:**
- 3-column layout (about, quick links, contact)
- Social media icons
- Company logo + tagline

## Images

**Hero Section:** Large, dynamic sports photography - ideally showing company employees in action during events (football match, family sports day, marathon). Landscape orientation, 1920x1080 minimum. Should convey energy, teamwork, and joy.

**Event Cards:** Each event type needs representative imagery:
- Football tournaments: Action shots on pitch
- Family days: Mixed groups enjoying activities  
- Marathons: Runners in company jerseys
- Gym activities: Indoor sports facilities

**Gallery:** Authentic photos from past company events, showing real employees participating, celebrating, and enjoying activities. Mix of action shots and group celebrations.

**Featured Athletes:** Professional headshots or action portraits of standout employee-athletes with trophy/achievement context.

## Animations

**Minimal & Purposeful:**
- Stats counter: Count-up animation on scroll into view
- Event cards: Subtle lift on hover (transform scale-105)
- News ticker: Smooth auto-scroll
- Gallery images: Fade-in overlay on hover
- **No** page transitions, parallax, or complex scroll effects

## RTL Considerations

- All layouts use `dir="rtl"` on root
- Icons/arrows flip appropriately
- Text alignment: text-right by default
- Navigation order: logo right, links center, CTA left
- Card layouts maintain natural RTL flow

## Accessibility

- Consistent dark mode with proper contrast ratios
- All interactive elements have focus states (ring-2 ring-offset-2)
- Images have descriptive alt text in Arabic
- Countdown timers show both visual and text representations
- Color is never the only indicator (use icons + text)