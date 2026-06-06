/**
 * Cron Expression tests.
 *
 * @author skyswordw
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Cron Expression: explain list and step expression",
        input: "0 0,12 1 */2 *",
        expectedOutput: `At minute 0 past hour 0 and hour 12 on day-of-month 1 in every 2nd month.

Minute: at minute 0
Hour: at hour 0 and hour 12
Day of month: on day-of-month 1
Month: in every 2nd month
Day of week: on every day-of-week`,
        recipeConfig: [
            {
                op: "Cron Expression",
                args: ["Explain expression", "YYYY-MM-DD HH:mm"]
            }
        ]
    },
    {
        name: "Cron Expression: explain range expression",
        input: "*/15 9-17 * * 1-5",
        expectedOutput: `At every 15th minute past hours 9 through 17 on every day-of-month in every month on days-of-week 1 through 5.

Minute: at every 15th minute
Hour: at hours 9 through 17
Day of month: on every day-of-month
Month: in every month
Day of week: on days-of-week 1 through 5`,
        recipeConfig: [
            {
                op: "Cron Expression",
                args: ["Explain expression", "YYYY-MM-DD HH:mm"]
            }
        ]
    },
    {
        name: "Cron Expression: generate from date",
        input: "2026-06-06 13:45",
        expectedOutput: "45 13 6 6 *",
        recipeConfig: [
            {
                op: "Cron Expression",
                args: ["Generate expression", "YYYY-MM-DD HH:mm"]
            }
        ]
    },
    {
        name: "Cron Expression: invalid field count",
        input: "* * *",
        expectedOutput: "Cron expressions must contain five fields: minute hour day-of-month month day-of-week",
        recipeConfig: [
            {
                op: "Cron Expression",
                args: ["Explain expression", "YYYY-MM-DD HH:mm"]
            }
        ]
    },
    {
        name: "Cron Expression: invalid bounds",
        input: "60 * * * *",
        expectedOutput: "Minute values must be between 0 and 59",
        recipeConfig: [
            {
                op: "Cron Expression",
                args: ["Explain expression", "YYYY-MM-DD HH:mm"]
            }
        ]
    }
]);
