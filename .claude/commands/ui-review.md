# UI Review — Sportsphere Design Audit

You are a senior UI/UX designer reviewing Sportsphere for production readiness. Run a systematic visual and interaction audit across the app.

## Design System Reference

- **Theme**: Dark-first (bg-black, text-white) with light sections on Login/Onboarding
- **Primary accent**: Red (red-600, red-700, red-900)
- **Radius**: rounded-xl (buttons), rounded-2xl (cards)
- **Font weights**: font-bold (buttons), font-semibold (labels), font-black (headings)
- **Spacing**: Tailwind scale — p-4/p-5 cards, gap-3 between elements
- **Component library**: Radix UI primitives + shadcn/ui (`@/components/ui/*`)
- **Animation**: Framer Motion for page transitions, Tailwind `transition-all` for micro-interactions
- **Icons**: Lucide React, 16-20px (w-4 h-4 to w-5 h-5)

## Audit Checklist

### 1. Color & Contrast
For each page file in `src/pages/`:
- [ ] Text is readable on its background (no white-on-white, no gray-on-black below AA contrast)
- [ ] Input fields have explicit `text-gray-900` on light backgrounds or `text-white` on dark
- [ ] Placeholder text uses `placeholder:text-gray-500` (not invisible)
- [ ] Buttons have clear hover/disabled states
- [ ] Links are distinguishable from body text

### 2. Responsive Layout
- [ ] All pages have `max-w-*` containers (no full-bleed content on ultrawide)
- [ ] Mobile bottom nav (h-16, pb-20 on main) — content doesn't hide behind it
- [ ] Desktop sidebar (w-64, pl-64 on main) — content doesn't overlap
- [ ] Cards stack vertically on mobile, grid on desktop (lg: breakpoint)
- [ ] No horizontal overflow / scrollbar on mobile viewport (< 390px)

### 3. Component Consistency
- [ ] All buttons use `<Button>` from `@/components/ui/button` (not raw `<button>` with custom styles)
- [ ] All inputs use `<Input>` from `@/components/ui/input`
- [ ] Avatar components use `<Avatar>` with `<AvatarFallback>` (never broken images)
- [ ] Cards follow consistent border/shadow pattern (border-gray-800 on dark, border-gray-100 on light)
- [ ] Modals/dialogs use Radix Dialog primitive (not custom absolute-positioned divs)

### 4. Loading & Empty States
- [ ] Every page with data fetching shows a skeleton or spinner during load
- [ ] Empty states have helpful messaging (not blank space)
- [ ] Error states are handled (not just console.error)
- [ ] Buttons show loading spinners when async actions are in progress

### 5. Navigation & Flow
- [ ] All nav links in Layout.jsx resolve to valid pages in pages.config.js
- [ ] Active page is highlighted in sidebar (bg-red-600)
- [ ] Back buttons work correctly (useNavigate or browser history)
- [ ] Mobile bottom nav has correct 5-item layout with center Create button

### 6. Typography
- [ ] Heading hierarchy is consistent (text-2xl font-black → text-lg font-bold → text-sm)
- [ ] No raw text without size/weight classes
- [ ] Long text truncates or wraps properly (truncate, line-clamp-*)
- [ ] Timestamps use relative format (formatDistanceToNow) with null guards

### 7. Accessibility Basics
- [ ] Interactive elements have aria-labels where icon-only
- [ ] Color is not the sole indicator of state (icons/text accompany color changes)
- [ ] Focus rings visible on keyboard navigation
- [ ] Form inputs have associated `<Label>` elements

## How to Run

1. **Scope**: Run against the page or area specified by the user. If no scope given, audit the 10 most critical pages: Feed, Login, Onboarding, Profile, Messages, Live, Reels, Search, CreatePost, Notifications.
2. **Method**: Read each page file + its imported components. Check against the checklist above.
3. **Output**: For each issue found, report:
   - **File**: path + line number
   - **Issue**: what's wrong
   - **Fix**: exact code change needed
   - **Severity**: Critical (breaks usability) / High (ugly but usable) / Low (polish)
4. **Fix**: After reporting, apply all Critical and High fixes automatically. Low fixes should be listed for user approval.

## Known Design Decisions (don't flag these)
- Login page uses split-screen (dark left panel + white right form) — intentional dual-theme
- Onboarding is full-screen white (no Layout wrapper) — intentional
- Global `body { @apply text-white }` in index.css — intentional for dark theme, but inputs on light pages MUST override
- Admin pages use standalone layout (no sidebar) — intentional
