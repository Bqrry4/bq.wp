import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Reference: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "../tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL,
        trace: "on-first-retry",
    },

    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                launchOptions: {
                    args: [
                        "--allow-file-access-from-files",
                        "--disable-web-security",
                        "--disable-site-isolation-trials",
                    ],
                },
            },
        },

        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                launchOptions: {
                    firefoxUserPrefs: {
                        "privacy.file_unique_origin": false,
                    },
                },
            },
        },
    ],

    webServer: {
        //Serve files only needed in testing
        command: `pnpm exec http-server tests/static -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
    },
});
