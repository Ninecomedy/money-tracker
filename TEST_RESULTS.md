# Money Tracker verification — 2026-10-17

Live site: https://ninecomedy.github.io/money-tracker/

## Automated tests

- `npm test`: 4 passing tests for script syntax, username mapping, case normalization, invalid input rejection and collision avoidance.
- `npm run test:cloud`: passed against real Firebase Authentication and Firestore, using temporary accounts and synthetic data.
- Firebase accepted internal `@money-tracker.invalid` addresses.
- Duplicate usernames differing only in case were rejected.
- Wrong passwords were rejected; logout cleared authentication; subsequent login retained the same UID.
- Settings, create/read/update/delete and realtime updates between independent SDK clients passed.
- Other accounts and unauthenticated clients could not read, list, write or delete another UID's entries or settings.
- Public username collection reads, negative amounts and a password field were rejected.
- Automated test accounts were removed after the runs.
- `npm audit`: zero vulnerabilities after updating the test dependency gRPC through an override.

## Browser verification

- Registered a disposable account through the local UI connected to the production Firebase project.
- Default balance 250, spendable 200 and reserve 50 were displayed.
- Added expense 40: balance 210, spendable 160 and reserve 50.
- Edited expense to 45: balance 205, spendable 155 and reserve 50.
- Logged in on GitHub Pages with uppercase username; the existing expense appeared.
- Added income 100 on GitHub Pages: balance 305 and spendable 255; the local window updated automatically.
- Logout on the live site hid the app and removed all history rows from the DOM.
- The disposable UI test account and its entries were removed after verification.
- Forgot-password control displayed the lack of email recovery without sending a reset email.
- Layout inspected at 390 × 844 and 1280 × 900. The mobile document did not overflow horizontally.
- Screenshots are stored locally in ignored `test-results/mobile.png` and `test-results/desktop.png`.

## Limits

- Responsive layout was tested with browser viewport sizes, not physical phones.
- Cross-account authorization was tested with independent SDK clients; the browser test used one disposable account across two origins.
- Large imports, interrupted multi-batch clears and quota exhaustion were not tested end to end.
- Internal email accounts have no self-service email password recovery. No administrator recovery UI is provided.
- This new Firebase project had no pre-existing linked email accounts; no accounts or data from other Firebase projects were migrated or modified.
