# Renewal Radar — MVP Status

## Step plan

| Step | Status | Description |
|------|--------|-------------|
| 0 | ✅ | Scaffold: dependencies, configs, folder skeleton |
| 1 | ✅ | Design system: tokens + base components |
| 2 | ✅ | Data layer + renewal engine |
| 3 | ⬜ | Dashboard screen |
| 4 | ⬜ | Add/edit flow |
| 5 | ⬜ | Detail + cancel flow |
| 6 | ⬜ | Notifications |
| 7 | ⬜ | Settings + export + polish |

## Running log

### STEP 0 — Scaffold (committed)

**Assumptions:**
- Default currency: INR (Indian Rupee). A currency picker will be included in the add/edit form.
- Canceled items: stored with `isCanceled` flag, visible in a separate "Archived" section.
- Custom billing cycle: user enters next renewal date + N days; the engine adds N days to compute subsequent dates.
- Notification lead times: two separate settings (cancellation window reminder, pre-renewal reminder).
- Light theme built via design tokens for later dark mode addition.
- Web support: not a priority, but react-native-web is included by Expo default; web-specific paths won't be built.

**Deliverables for STEP 0:**
- [x] Expo SDK 55 with TypeScript strict
- [x] expo-sqlite, expo-notifications, expo-sharing, expo-file-system, zustand installed
- [x] eslint + prettier configured (flat config)
- [x] jest + @testing-library/react-native configured
- [x] Folder skeleton: app/, src/{components,lib,data,store,theme,types}/
- [x] Design tokens stub (colors, spacing, typography, shadows, borderRadius)
- [x] TypeScript types for domain model
- [x] Remote origin set to https://github.com/Anuragx456/renewal-radar.git

### STEP 1 — Design system (committed)

**Deliverables:**
- [x] Button component (3 variants, 3 sizes, loading state)
- [x] Card component (default/elevated, pressable, header/body/footer)
- [x] Input component (label, focus ring, error/hint, icons)
- [x] Select component (modal-based bottom sheet picker)
- [x] EmptyState component (icon, title, subtitle, action)
- [x] SectionHeader component (title + action label)

### STEP 2 — Data layer + renewal engine (committed)

**Deliverables:**
- [x] Pure renewal engine (40 unit tests): computeNextOccurrence, computeCancellationDeadline, getCancellationWindowStatus, normalizeToMonthly/Yearly, toISODate/fromISODate
- [x] Month-end edge cases (Jan 31 → Feb 28/29), DST, leap years
- [x] SQLite schema with migrations (subscriptions table + indexes)
- [x] SubscriptionRepository: CRUD, markCanceled, getUpcomingRenewals, getActionNeeded, getRenewalsWithin60Days, getSpendSummary
- [x] Dev seed script with 14 realistic sample items (Netflix, Spotify, Cult.fit, etc.)
- [x] jest-expo compatible with Jest 29

### STEP 3 — Dashboard (not started)

### STEP 4 — Add/edit flow (not started)

### STEP 5 — Detail + cancel flow (not started)

### STEP 6 — Notifications (not started)

### STEP 7 — Settings + export + polish (not started)
