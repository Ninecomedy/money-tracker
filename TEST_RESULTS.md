# Money Tracker verification — 2026-10-17

## Savings Wallet — local release candidate (not deployed)

- Resumed existing working-tree changes; no production accounts or data were changed or deleted.
- `npm test`: all 8 syntax, identity and wallet calculation tests passed.
- `npm run test:savings-emulator`: passed using local Auth and Firestore emulators and project `demo-money-tracker`.
- Deposit and withdrawal update savings and available funds while preserving total funds; excessive transfers and invalid amounts are rejected.
- Two independent authenticated SDK clients attempted concurrent deposits exceeding combined available funds: exactly one succeeded, with one matching history record and no lost update.
- Existing income 100 and expense 40 documents were unchanged after deposit 25 and withdrawal 10. Total remained 310, savings 215 and available 95.
- Rules rejected anonymous history reads, cross-UID settings reads/writes and savings access, forged non-atomic history, and history update/delete. Expected PERMISSION_DENIED log lines are successful negative tests.
- Decimal transfer 0.1 + 0.2 produced 0.3. Existing settings without a new migration flag remain supported.
- Browser in emulator mode: first Save immediately replaced setup with the savings panel; deposit 25 gave savings 75 / available 175; withdrawal 10 gave savings 65 / available 185; total stayed 250 and income/expense stayed zero.
- Browser rejected deposit 186 with only 185 available. Reload restored the savings panel and history. Edit initial settings and Cancel returned to the correct panels without changing balances.
- Mobile viewport 390 x 844 had no horizontal document overflow. Local screenshots: `test-results/savings-desktop.png` and `test-results/savings-mobile.png`.
- `git diff --check` passed. Ready for an approved deployment of rules and static assets, followed by online smoke testing; no deployment performed.

### Savings limitations

- Concurrency was tested using independent SDK clients, not physical devices. Refresh all open devices after deployment so entry mutations use the updated transaction coordination.
- Available-funds validation is performed by the application transaction. Rules enforce UID isolation, nonnegative savings and atomic history consistency, but do not aggregate the income/expense collection to independently enforce available funds against a modified client.
- The most recent 20 transfers are displayed. JSON backup includes balances and income/expense entries, not savings transfer history.

## Confirm Password and Remember Login release

- Registration now requires matching Password and Confirm Password; login shows Username and Password only.
- Firebase internal identity mapping, UID paths and security rules are unchanged.
- Explicit Firebase persistence: local when Remember Login is selected, session otherwise. Application code does not store passwords.
- Removed Forgot Password control; retained the account recovery warning.
- Browser tests: mismatch rejected, matching confirmation creates an account, uppercase duplicate rejected, remembered login restored after closing and reopening a tab, and logout clears authentication.
- Automated identity and live Firebase isolation/CRUD suites passed again.
- With Remember Login unchecked, closing the signed-in tab and opening a fresh tab returned to the login gate.
- The disposable Confirm Password UI test account was removed after testing.
- No existing accounts were changed. Deployment explicitly approved on 2026-10-17.

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
