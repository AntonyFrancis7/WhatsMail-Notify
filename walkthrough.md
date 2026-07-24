# Walkthrough: Backend Intelligence Layer (Sprint 3 Part 2)

This document provides a comprehensive summary of the Backend Intelligence Layer implemented for MailPulse.

---

## 1. Project Folder Structure & Files Created

The backend has been modularized with the following directories and files:

```text
WhatsMail-Notify/
├── backend/
│   ├── constants/
│   │   ├── categories.js                     # 16 Supported Categories Enums
│   │   ├── priorityRules.js                  # Scoring Weights & Levels
│   │   └── defaultNotificationPreferences.js  # New User Default Mappings
│   ├── utils/
│   │   ├── keywordMatcher.js                 # Case-Insensitive Pattern Matcher
│   │   └── senderClassifier.js               # Sender Classification (Domains/Emails)
│   ├── services/
│   │   ├── preferenceService.js              # Lazy-Initialization & Settings Manager
│   │   ├── categoryService.js                # Rule-Based Email Categorizer
│   │   ├── priorityService.js                # Score Evaluator (0 - 100)
│   │   ├── notificationDecisionService.js    # Decider (Overrides & Summaries)
│   │   ├── rulesEngine.js                    # Orchestration Flow
│   │   └── emailProcessorService.js          # Fetcher and Analyzer
│   ├── controllers/
│   │   ├── preferenceController.js           # Settings HTTP Controller
│   │   └── processorController.js            # Sync & Automated Test Runner
│   └── routes/
│       ├── preferenceRoutes.js               # Settings API Routing
│       └── processorRoutes.js                # Analysis API Routing
```

---

## 2. Database schema & migrations

### Added Prisma Models
The Prisma database schema at `backend/prisma/schema.prisma` was extended with:
- `NotificationPreference`: Maps user settings for each category (enable toggles, minimum required priority thresholds).
- `CustomKeyword`: User custom search term overrides.
- `TrustedSender`: User whitelist filters (emails/domains).
- `BlockedSender`: User blacklist filters (emails/domains).

### Executed Database Migration
Database tables have been created on the Neon PostgreSQL instance, and the Prisma client generated:
```bash
npx prisma migrate dev --name add_intelligence_schema
npx prisma generate
```

---

## 3. Mounted API Endpoints

All routes are mounted under the `/api` namespace in `backend/routes/index.js` and protected via `authMiddleware` JWT cookie verification.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/preferences` | Fetches current settings and list parameters |
| **PUT** | `/api/preferences` | Updates category configurations |
| **GET** | `/api/preferences/default` | Returns defaults template layout |
| **POST** | `/api/preferences/keywords` | Adds custom keyword |
| **DELETE** | `/api/preferences/keywords/:id` | Deletes custom keyword |
| **POST** | `/api/preferences/trusted` | Adds trusted email/domain |
| **DELETE** | `/api/preferences/trusted/:id` | Deletes trusted sender |
| **POST** | `/api/preferences/blocked` | Adds blocked email/domain |
| **DELETE** | `/api/preferences/blocked/:id` | Deletes blocked sender |
| **GET** | `/api/processor/analyze/:messageId` | Processes and analyzes a real Gmail email |
| **POST** | `/api/processor/analyze` | Executes dry-run mock rules evaluation |
| **GET** | `/api/processor/test` | Runs the automated rules validation test suite |

---

## 4. Sample Processed Email Output

### Input payload
```json
{
  "sender": "HDFC Bank Alert <alerts@hdfcbank.com>",
  "subject": "Transaction Alert: ₹12,500 credited",
  "body": "Your savings account has been credited with INR 12,500.00.",
  "snippet": "credited ₹12,500",
  "labels": ["INBOX"],
  "unread": true
}
```

### Analysis Decision
```json
{
  "shouldNotify": true,
  "reason": "Matches default preferences for category \"BANKING\"",
  "category": "BANKING",
  "priority": "HIGH",
  "score": 70,
  "summary": "HDFC Bank Alert: ₹12,500 credited."
}
```

---

## 5. Verification & Testing

### Test Suite Execution
An automated test runner is exposed at the `/api/processor/test` route. When triggered (within a logged-in browser session), it dynamically evaluates 9 different mock email structures and database whitelists/blacklists:

1. **Bank Alert**: Verified as `BANKING` / `HIGH`.
2. **OTP Code**: Verified as `OTP` / `HIGH`.
3. **Google Security Alert**: Verified as `SECURITY` / `HIGH`.
4. **GitHub Pull Request**: Verified as `WORK` / `MEDIUM`.
5. **Amazon Order Confirmation**: Verified as `SHOPPING` / `MEDIUM`.
6. **Newsletter Coupon**: Verified as `PROMOTIONS` / `LOW`.
7. **Blocked Sender List Override**: Verified `shouldNotify = false`.
8. **Trusted Sender List Override**: Verified `shouldNotify = true`.
9. **Unknown Sender**: Verified as `UNKNOWN` / `shouldNotify = false` (disabled by default preference).

---

## 6. Frontend Notification Settings Dashboard (Sprint 3 Part 3)

The complete user-facing Notification Settings Dashboard is implemented and integrated.

### UI Component Framework (`frontend/src/components/settings/`)
* [SettingsCard.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/SettingsCard.jsx): A modular container component styling individual card dividers in line with the MailPulse dark theme.
* [ToggleSwitch.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/ToggleSwitch.jsx): Animated toggle switches mapping the boolean status (`enabled`) of notifications.
* [PriorityDropdown.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/PriorityDropdown.jsx): Custom dropdown elements to filter minimum required alerts priority levels (`LOW`, `MEDIUM`, `HIGH`).
* [CategoryRow.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/CategoryRow.jsx): Individual preference row items displaying category names, custom SVG icons, toggle switches, and priority limits.
* [CategoryCard.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/CategoryCard.jsx): Lists the 16 supported categories and houses the `Save Preferences` button.
* [TrustedSenderManager.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/TrustedSenderManager.jsx) & [BlockedSenderManager.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/BlockedSenderManager.jsx): Whitelist and blacklist managers validating formats (emails/domains) and handling API requests.
* [KeywordManager.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/KeywordManager.jsx): Allows user inputs for custom search keywords.
* [SaveBar.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/SaveBar.jsx): A floating bar that slides up when category settings are dirty, prompting users to save or discard.
* [LoadingOverlay.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/LoadingOverlay.jsx): Renders neat skeletons during API queries.
* [EmptyState.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/components/settings/EmptyState.jsx): Clean card fallback when list configurations are empty.

### Settings Page & Core Service
* [Settings.jsx](file:///d:/programs/WhatsMail-Notify/frontend/src/pages/Settings.jsx): The main coordinator page managing layout states, validations, loading indicators, and local success/error toast feeds.
* [preferenceService.js](file:///d:/programs/WhatsMail-Notify/frontend/src/services/preferenceService.js): Centralizes all API transactions (GET settings, PUT bulk categories, GET defaults template, POST/DELETE lists elements).

---

## 7. Compound Unique Constraints & Security Alignment Patches
* **Prisma Null Constraint Fix**: Redesigned `addTrustedSender` and `addBlockedSender` inside [preferenceService.js](file:///d:/programs/WhatsMail-Notify/backend/services/preferenceService.js) to query records via `findFirst` and execute updates/creations using singular row IDs. This decouples optional properties from composite index mappings and resolves `Argument email must not be null` crashes.
* **Security Brand Domain Classification**: Added direct matching mappings for Google Accounts security services inside [senderClassifier.js](file:///d:/programs/WhatsMail-Notify/backend/utils/senderClassifier.js) and applied category-level scoring boosts (+25) for the `SECURITY` tag inside [priorityRules.js](file:///d:/programs/WhatsMail-Notify/backend/constants/priorityRules.js) and [priorityService.js](file:///d:/programs/WhatsMail-Notify/backend/services/priorityService.js), ensuring security notification alerts rank as `HIGH` priority.
* **Uncategorized Sender Fallbacks**: Refined `classifyEmailCategory` inside [categoryService.js](file:///d:/programs/WhatsMail-Notify/backend/services/categoryService.js) by decoupling general `"INBOX"` labels from standard `"CATEGORY_PERSONAL"` routing, enabling unknown marketing/class alerts to fall back correctly to the `UNKNOWN` category.
