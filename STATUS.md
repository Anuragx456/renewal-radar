# Renewal Radar — MVP Status

## Step plan

| Step | Status | Description |
|------|--------|-------------|
| 0 | ✅ | Scaffold: dependencies, configs, folder skeleton |
| 1 | ⬜ | Design system: tokens + base components |
| 2 | ⬜ | Data layer + renewal engine |
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

### STEP 1 — Design system (not started)

### STEP 2 — Data layer + renewal engine (not started)

### STEP 3 — Dashboard (not started)

### STEP 4 — Add/edit flow (not started)

### STEP 5 — Detail + cancel flow (not started)

### STEP 6 — Notifications (not started)

### STEP 7 — Settings + export + polish (not started)
