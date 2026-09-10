/**
 * Cron Schedule Decoder tests.
 *
 * @author mmustafasenoglu
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Cron Schedule Decoder: every minute",
        input: "* * * * *",
        expectedOutput: "Every minute.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: every day at midnight",
        input: "0 0 * * *",
        expectedOutput: "At minute 0 past hour 0.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: issue example",
        input: "0 0,12 1 */2 *",
        expectedOutput: "At minute 0 past hour 0 and 12 on day-of-month 1 in every 2nd month.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: weekdays at 9:30",
        input: "30 9 * * 1-5",
        expectedOutput: "At minute 30 past hour 9 on Monday, Tuesday, Wednesday, Thursday and Friday.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: every 15 minutes",
        input: "*/15 * * * *",
        expectedOutput: "At minute 0, 15, 30 and 45 past every hour.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: specific months",
        input: "0 12 1 3,6,9,12 *",
        expectedOutput: "At minute 0 past hour 12 on day-of-month 1 in March, June, September and December.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: single day of week",
        input: "0 0 * * 0",
        expectedOutput: "At minute 0 past hour 0 on Sunday.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: range in minutes",
        input: "0-10 8 * * *",
        expectedOutput: "At minute 0-10 past hour 8.",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: invalid - too few fields",
        input: "* * *",
        expectedOutput: "Invalid cron expression: expected 5 fields, got 3. Format: minute hour day-of-month month day-of-week",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
    {
        name: "Cron Schedule Decoder: invalid - letter in field",
        input: "a * * * *",
        expectedOutput: "Invalid value 'a' in minute field",
        recipeConfig: [
            {
                op: "Cron Schedule Decoder",
                args: [],
            },
        ],
    },
]);
