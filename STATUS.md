# Renewal Radar — MVP Status

## Step plan

| Step | Status | Description |
|------|--------|-------------|
| 0 | ✅ | Scaffold: dependencies, configs, folder skeleton |
| 1 | ✅ | Design system: tokens + base components |
| 2 | ✅ | Data layer + renewal engine |
| 3 | ✅ | Dashboard screen |
| 4 | ✅ | Add/edit flow |
| 5 | ✅ | Detail + cancel flow |
| 6 | ✅ | Notifications |
| 7 | ✅ | Settings + export + polish |

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

### STEP 3 — Dashboard (committed)

**Deliverables:**
- [x] Dashboard screen (src/app/index.tsx) with pull-to-refresh
- [x] SpendSummary component (monthly + yearly totals with loading state)
- [x] ActionNeeded component (cancellation windows open/opening-soon)
- [x] UpcomingRenewals component (next 60 days with empty state)
- [x] SubscriptionRow reusable component (category dot, name, amount, cycle)
- [x] Zustand store (useDashboardStore) managing loading/data/error
- [x] format utility (currency, relative dates, category labels)
- [x] Loading, error, and empty states for every section

### STEP 4 — Add/edit flow (committed)

**Deliverables:**
- [x] Add subscription form (`src/app/add.tsx`) with full field set: name, provider, amount, currency, category, billing cycle, custom cycle days, next renewal date, cancellation notice period, notes, URL
- [x] Live preview card — dynamically shows next renewal date, cancellation deadline (with status color), and normalized monthly cost
- [x] Currency picker with 14 common currencies (INR default)
- [x] Category picker (14 subscription categories)
- [x] Billing cycle picker (weekly/monthly/quarterly/yearly/custom) with conditional custom days input
- [x] Cancellation notice period presets (0/1/3/7/14/30/60/90 days)
- [x] Edit mode via optional `?id=` search param — loads existing item, pre-fills form, saves as update
- [x] Form validation: required fields, positive amount, valid YYYY-MM-DD date, URL format check
- [x] States: loading (edit prefetch), saving spinner, validation errors inline, save error alert
- [x] Navigation: header title switches between "Add" / "Edit", save navigates back on success

### STEP 5 — Detail + cancel flow (committed)

**Deliverables:**
- [x] Detail screen (`src/app/item/[id].tsx`) with all subscription info
- [x] Large amount display with per-cycle label
- [x] Info card: provider, category, billing cycle, currency, renewal dates, following renewal
- [x] Cancellation window card with color-coded left border (red/orange/green) and status badge
- [x] Deadline countdown hint — days remaining or "deadline passed" warning
- [x] Cancel/Reactivate with confirmation Alert dialog (soft-delete via `isCanceled`)
- [x] Delete permanently with destructive confirmation Alert
- [x] Edit navigates to `/add?id=` for pre-filled editing
- [x] URL linking via `Linking.openURL` with error fallback
- [x] Timeline card showing created/updated/canceled dates
- [x] States: loading spinner, not found error, error with back button
- [x] Canceled items show "Canceled" badge, cancel date, and Reactivate button

### STEP 6 — Notifications (committed)

**Deliverables:**
- [x] Notification service (`src/services/notifications.ts`): setup, schedule, cancel, reschedule
- [x] Foreground notification handler in `_layout.tsx`
- [x] `scheduleCancellationReminder` — fires before cancellation deadline (default 3 days ahead)
- [x] `scheduleRenewalReminder` — fires before next renewal (default 7 days ahead)
- [x] `cancelItemNotifications` — removes all scheduled notifications for an item
- [x] `rescheduleForItem` — cancel + reschedule for create/update/reactivate
- [x] `rescheduleAll` — mass reschedule for lead-time setting changes
- [x] Wired into add screen — schedules on create and update
- [x] Wired into detail screen — cancels on cancel/delete, reschedules on reactivate
- [x] Past-date notifications skipped automatically
- [x] Notifications fire at 9 AM local time
- [x] Permission request on first subscription create (non-blocking)
- [x] Unique notification identifiers per item and type (`cancel-{id}`, `renew-{id}`)

### STEP 7 — Settings + export + polish (committed)

**Deliverables:**
- [x] Settings screen (`src/app/settings.tsx`) with notification lead-time controls
- [x] Cancellation window reminder days input (default 3)
- [x] Pre-renewal reminder days input (default 7)
- [x] Save + reschedule all notifications with new lead times
- [x] Reset to defaults button with confirmation dialog
- [x] JSON export — writes to cache via `expo-file-system` (File/Paths API), shares via `expo-sharing`
- [x] Database migration v2: settings table (key/value)
- [x] Zustand settings store backed by SQLite
- [x] Dashboard: gear icon ⚙️ navigates to /settings
- [x] About card: app version, on-device data, no-account info
- [x] All checks pass: tsc, eslint, 40 jest tests
