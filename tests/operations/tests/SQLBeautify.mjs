/**
 * SQLBeautify tests.
 *
 * @author GCHQDeveloper581
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "SQL Beautify - basic",
        input: "SELECT MONTH, ID, RAIN_I, TEMP_F FROM STATS;",
        expectedOutput:
`SELECT
  MONTH,
  ID,
  RAIN_I,
  TEMP_F
FROM
  STATS;`,
        recipeConfig: [
            {
                op: "SQL Beautify",
                args: ["  "],
            },
        ],
    },
    {
        name: "SQL Beautify - upsert",
        input: "INSERT INTO Table1 SELECT * FROM (SELECT :Bind1 as Field1, :Bind2 as Field2, :id as id) as new_data ON DUPLICATE KEY UPDATE Field1 = new_data.Field1, Field2 = new_data.Field2;",
        expectedOutput:
`INSERT INTO
  Table1
SELECT
  *
FROM
  (
    SELECT
      :Bind1 as Field1,
      :Bind2 as Field2,
      :id as id
  ) as new_data
ON DUPLICATE KEY UPDATE
  Field1 = new_data.Field1,
  Field2 = new_data.Field2;`,
        recipeConfig: [
            {
                op: "SQL Beautify",
                args: ["  "],
            },
        ],
    },
]);
