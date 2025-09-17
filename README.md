# Playwright Visual Testing Demo

This project demonstrates visual regression testing using **Playwright** and **Percy**. It's configured to capture snapshots of a TodoMVC application across different states and viewports, and then upload them to Percy for visual comparison.

---

## 📑 Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Running Tests](#running-tests)
- [Understanding the Visual Tests](#understanding-the-visual-tests)
  - [`tests/visual/percy.test.ts`](#testsvisualpercytestts)
  - [`utils/percy.ts`](#utilspercyts)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```
Project Structure
.
├── .github
│   └── workflows
│       └── visual-testing.yml        # GitHub Actions workflow for visual testing
├── models
│   └── viewport.ts                   # Defines viewport configurations
├── pages
│   └── TodoPage.ts                   # Page Object Model for TodoMVC (if implemented)
├── playwright-report
│   └── index.html                    # Playwright test report
├── test-results                      # Playwright test artifacts (screenshots, videos, traces)
├── tests
│   └── visual
│       ├── percy.test.ts             # Main visual testing suite using Percy
│       └── ...                       # Other test files
├── utils
│   └── percy.ts                      # Utility functions for Percy integration (e.g., captureSnapshots)
├── .env                              # Environment variables (e.g., Percy token)
├── .env.example                      # Example .env file
├── .percy.yml                        # Percy configuration file
├── package.json                      # Project dependencies and scripts
├── playwright.config.ts              # Playwright configuration
├── tsconfig.json                     # TypeScript configuration
└── yarn.lock                         # Yarn dependency lock file
```

---

## Technologies Used

- **Playwright:** Automate Chromium, Firefox, and WebKit with a single API. Used for browser automation and test execution.  
- **Percy:** Visual testing platform that integrates with CI/CD pipelines to detect UI changes.  
- **TypeScript:** Type-safe and maintainable code.  
- **Yarn:** Package manager.

---

## Setup and Installation

1. **Clone the repository:**

```bash
git clone <your-repo-url>   # Replace with your actual repository URL
cd playwright-visual-testing-demo
```

2. **Install dependencies:**

```bash
yarn install
```

3. **Configure Percy Token:**

Create a `.env` file in the root of your project (you can copy from `.env.example`) and add your Percy token:

```bash
PERCY_TOKEN=YOUR_PERCY_TOKEN_HERE
```

You can obtain your Percy token from your Percy project settings.

---

## Running Tests

To run the visual tests locally and upload snapshots to Percy:

```bash
yarn percy exec -- yarn playwright test tests/visual/percy.test.ts
```

This command will:

- Start a Percy build.  
- Execute your Playwright tests.  
- Capture visual snapshots at defined points in your tests.  
- Upload these snapshots to your Percy dashboard for visual review.  

---

## Understanding the Visual Tests

### `tests/visual/percy.test.ts`

This file contains the main visual test suite. It uses the `captureSnapshots` utility function to take Percy snapshots at various states of the TodoMVC application.

### `utils/percy.ts`

Contains the `captureSnapshots` function, responsible for:

- Setting viewport sizes for different devices (desktop, tablet, mobile).  
- Waiting for the page or specific elements to be visible.  
- Taking a Percy snapshot with a unique name.

**Important:** Snapshot names include a timestamp to avoid "Ignored duplicate snapshot" errors.

Example snapshot name:  
`TodoMVC - Estado inicial - desktop - 2025-09-05T14-53-15-123Z`

---

## Common Issues and Troubleshooting

1. **Ignored duplicate snapshot errors**  
   - **Cause:** Percy requires unique snapshot names within a build.  
   - **Solution:** `captureSnapshots` now appends timestamps to snapshot names.

2. **strict mode violation: getByText('Completed') resolved to 2 elements**  
   - **Cause:** Playwright found multiple elements containing the text "Completed".  
   - **Solution:** Use a more specific locator:

```ts
page.getByRole('link', { name: 'Completed' })   // Filter link
page.getByRole('button', { name: 'Clear completed' }) // Clear button
```

- **Cause:** Playwright tests are timing out because an action (like `page.click()`) is not completing within the default 30-second timeout. This can happen if:
  - The element is not visible or interactive within the expected time.
  - The application under test is slow to respond.
  - There's a race condition or an unexpected state preventing the action.

- **Solution:**
  1. **Increase Timeout (Cautiously):** You can increase the timeout for a specific action or for the entire test. For example:
     ```ts
     await page.click('selector', { timeout: 60000 });
     test.setTimeout(60000);
     ```
     ⚠️ Increasing timeouts excessively can mask underlying performance issues.

  2. **Ensure Element Readiness:** Use robust waiting strategies before performing actions:
     ```ts
     await page.waitForSelector('selector', { state: 'visible' });
     await page.waitForLoadState('networkidle'); // Wait for network to be idle
     await page.click('selector');
     ```

  3. **Debug with Traces:** Use Playwright's trace viewer to analyze what happened during the timeout. This shows screenshots, network requests, and actions leading up to the failure:
     ```bash
     yarn playwright show-trace <path-to-trace.zip>
     ```

  4. **Review Application Performance:** Frequent timeouts may indicate performance bottlenecks in the application itself.

---

## Contributing

Feel free to contribute or raise issues if you encounter any problems! Pull requests are welcome.

## License

This project is licensed under the MIT License.
