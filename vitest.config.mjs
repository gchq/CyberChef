import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: [
            "tests/**/*.test.mjs",
            "tests/**/*.spec.mjs",
        ],
        testTimeout: 30000,
        globals: true,
    },
});
