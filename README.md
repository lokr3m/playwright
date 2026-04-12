# Playwright Test Automation – Kriso.ee Webshop

E2E test automation for [Kriso.ee](https://www.kriso.ee) bookshop using [Playwright](https://playwright.dev).

**Slides:** https://tanjaq.github.io/playwright-kriso/slides/

Your task is to create automated tests based on the test cases described below.

---

## ⚠️ How to Submit

> **You must do both of these — missing either means your work won't be graded.**

1. **Open a Pull Request** to the original repository: [github.com/tanjaq/playwright-kriso](https://github.com/tanjaq/playwright-kriso)
2. **Paste the link to a passing CI run** in the PR description (GitHub Actions → your workflow run → copy the URL)

---

## How to Get Started

1. **Fork** this repository into your own GitHub account
2. **Clone** the forked repository to your local machine:
   ```bash
   git clone <your-repo-url>
   ```
3. **Install dependencies:**
   ```bash
   npm install
   npx playwright install
   ```
4. **Write tests** based on the test case descriptions below
5. **Run tests** locally to confirm they pass:
   ```bash
   npx playwright test
   ```
6. **Commit and push** your changes to your fork
7. **Open a Pull Request** to `tanjaq/playwright-kriso` ← do not skip this
8. **Add the CI link** to your PR description ← do not skip this

---

## Project Structure

```
tests/
  kriso.spec.ts       ← Part I: flat tests (no POM)
  kriso-pom.spec.ts   ← Part II: same tests using Page Object Model
  fixtures.ts         ← Part II: injects page objects into tests

pages/                ← Part II: Page Object Model classes
  HomePage.ts
  SearchPage.ts
  ProductPage.ts
  CartPage.ts

.github/workflows/
  playwright.yml      ← CI pipeline (runs on push and pull request)
```

### Useful commands

```bash
# Interactive UI mode (recommended during development)
npx playwright test --ui

# Headed mode — watch the browser
npx playwright test --headed

# Record new tests against Kriso
npx playwright codegen https://www.kriso.ee

# View the HTML report after a run
npx playwright show-report
```

> **Tip:** Use only semantic selectors — `getByRole`, `getByText`, `getByPlaceholder`, `getByLabel`. No CSS class selectors. No XPath.

---

## Test Cases

### Part I — Flat Tests (`tests/kriso.spec.ts`)

#### Search for Books by Keywords

| Steps | Expected Result (Assertions) |
|-------|------------------------------|
| Open https://www.kriso.ee | Confirm the page has a Kriso title/logo |
| Search for keyword "harry potter" | Confirm multiple products are shown |
| | All listed items contain the searched keyword in their title or description |
| | Products can be sorted |
| Sort results by price | Verify products are sorted in the expected order (e.g., low to high or high to low) |
| Filter by language (e.g., English) | Verify only products in that language appear |
| Filter by format (e.g., "Kõvakaaneline" / hardback) | Confirm fewer items are listed and all match the selected format |

#### Add Books to Shopping Cart

| Steps | Expected Result (Assertions) |
|-------|------------------------------|
| Open https://www.kriso.ee | Confirm the page has a Kriso title/logo |
| Search for any keyword | Confirm multiple results are shown |
| | Products can be added to the shopping cart |
| Add one book to the cart | Confirm the cart shows 1 item |
| Add a second book | Confirm the cart updates to show 2 items |
| Click the cart/checkout icon | Confirm the user is navigated to the cart view |
| | Verify cart contains 2 correct items |
| | Verify the total price is accurate |
| Remove the first item from cart | Confirm the cart now shows 1 item |
| | Confirm the correct item was removed |
| | Verify the total price updates accordingly |

#### Navigate Products via Filters

| Steps | Expected Result (Assertions) |
|-------|------------------------------|
| Open https://www.kriso.ee | Confirm the page has a Kriso title/logo |
| Scroll down to find a section like "Muusikaraamatud ja noodid" | Confirm the section is visible |
| Click the "Õppematerjalid" category | Verify that there are more than 1 products found |
| | Confirm URL or page title reflects navigation correctly |
| Click on a category ("Bänd ja ansambel") | Confirm active filters show the selected category |
| | Verify products list now contains less items |
| Click on a format category ("CD") | Confirm active filters show the selected category |
| | Verify products list now contains less items |

---

### Part II — Page Object Model (`tests/kriso-pom.spec.ts`)

Refactor your Part I tests to use the Page Object Model:

- Create page classes in `pages/` (already scaffolded)
- Use `tests/fixtures.ts` to inject page objects automatically
- No raw selectors in test files — all locators live in page classes
- The CI pipeline in `.github/workflows/playwright.yml` is already set up — push your code and confirm the run goes green

> **Reminder:** Open a PR and paste the passing CI link in the description. That's how you submit.
