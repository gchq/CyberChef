/**
 * Jsonata Query tests.
 *
 * @author Jon King [jon@ajarsoftware.com]
 *
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const INPUT_JSON_OBJECT_WITH_ARRAYS = `{
  "FirstName": "Fred",
  "Surname": "Smith",
  "Age": 28,
  "Address": {
    "Street": "Hursley Park",
    "City": "Winchester",
    "Postcode": "SO21 2JN"
  },
  "Phone": [
    {
      "type": "home",
      "number": "0203 544 1234"
    },
    {
      "type": "office",
      "number": "01962 001234"
    },
    {
      "type": "office",
      "number": "01962 001235"
    },
    {
      "type": "mobile",
      "number": "077 7700 1234"
    }
  ],
  "Email": [
    {
      "type": "work",
      "address": ["fred.smith@my-work.com", "fsmith@my-work.com"]
    },
    {
      "type": "home",
      "address": ["freddy@my-social.com", "frederic.smith@very-serious.com"]
    }
  ],
  "Other": {
    "Over 18 ?": true,
    "Misc": null,
    "Alternative.Address": {
      "Street": "Brick Lane",
      "City": "London",
      "Postcode": "E1 6RF"
    }
  }
}`;

const INPUT_ARRAY_OF_OBJECTS = `[
  { "ref": [ 1,2 ] },
  { "ref": [ 3,4 ] }
]`;

const INPUT_NUMBER_ARRAY = `{
  "Numbers": [1, 2.4, 3.5, 10, 20.9, 30]
}`;

TestRegister.addTests([
    {
        name: "Jsonata: Returns a JSON string (double quoted)",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"Smith"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Surname"],
            },
        ],
    },
    {
        name: "Jsonata: Returns a JSON number",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: "28",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Age"],
            },
        ],
    },
    {
        name: "Jsonata: Field references are separated by '.'",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"Winchester"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Address.City"],
            },
        ],
    },
    {
        name: "Jsonata: Matched the path and returns the null value",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: "null",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Other.Misc"],
            },
        ],
    },
    {
        name: "Jsonata: Path not found. Returns nothing",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '""',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Other.DoesntExist"],
            },
        ],
    },
    {
        name: "Jsonata: Field references containing whitespace or reserved tokens can be enclosed in backticks",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Other.`Over 18 ?`"],
            },
        ],
    },
    {
        name: "Jsonata: Returns the first item (an object)",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '{"type":"home","number":"0203 544 1234"}',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[0]"],
            },
        ],
    },
    {
        name: "Jsonata: Returns the second item",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '{"type":"office","number":"01962 001234"}',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[1]"],
            },
        ],
    },
    {
        name: "Jsonata: Returns the last item",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '{"type":"mobile","number":"077 7700 1234"}',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[-1]"],
            },
        ],
    },
    {
        name: "Jsonata: Negative indexed count from the end",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '{"type":"office","number":"01962 001235"}',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[-2]"],
            },
        ],
    },
    {
        name: "Jsonata: Doesn't exist - returns nothing",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '""',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[8]"],
            },
        ],
    },
    {
        name: "Jsonata: Selects the number field in the first item",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"0203 544 1234"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[0].number"],
            },
        ],
    },
    {
        name: "Jsonata: No index is given to Phone so it selects all of them (the whole array), then it selects all the number fields for each of them",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput:
            '["0203 544 1234","01962 001234","01962 001235","077 7700 1234"]',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone.number"],
            },
        ],
    },
    {
        name: "Jsonata: Might expect it to just return the first number, but it returns the first number of each of the items selected by Phone",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput:
            '["0203 544 1234","01962 001234","01962 001235","077 7700 1234"]',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone.number[0]"],
            },
        ],
    },
    {
        name: "Jsonata: Applies the index to the array returned by Phone.number.",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"0203 544 1234"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["(Phone.number)[0]"],
            },
        ],
    },
    {
        name: "Jsonata: Returns a range of items by creating an array of indexes",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput:
            '[{"type":"home","number":"0203 544 1234"},{"type":"office","number":"01962 001234"}]',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[[0..1]]"],
            },
        ],
    },
    // Predicates
    {
        name: "Jsonata: Select the Phone items that have a type field that equals 'mobile'",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '{"type":"mobile","number":"077 7700 1234"}',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[type='mobile']"],
            },
        ],
    },
    {
        name: "Jsonata: Select the mobile phone number",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"077 7700 1234"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[type='mobile'].number"],
            },
        ],
    },
    {
        name: "Jsonata: Select the office phone numbers - there are two of them",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '["01962 001234","01962 001235"]',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Phone[type='office'].number"],
            },
        ],
    },
    // Wildcards
    {
        name: "Jsonata: Select the values of all the fields of 'Address'",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '["Hursley Park","Winchester","SO21 2JN"]',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Address.*"],
            },
        ],
    },
    {
        name: "Jsonata: Select the 'Postcode' value of any child object",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"SO21 2JN"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["*.Postcode"],
            },
        ],
    },
    {
        name: "Jsonata: Select all Postcode values, regardless of how deeply nested they are in the structure",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '["SO21 2JN","E1 6RF"]',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["**.Postcode"],
            },
        ],
    },
    // String Expressions
    {
        name: "Jsonata: Concatenate 'FirstName' followed by space followed by 'Surname'",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"Fred Smith"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["FirstName & ' ' & Surname"],
            },
        ],
    },
    {
        name: "Jsonata: Concatenates the 'Street' and 'City' from the 'Address' object with a comma separator",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"Hursley Park, Winchester"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Address.(Street & ', ' & City)"],
            },
        ],
    },
    {
        name: "Jsonata: Casts the operands to strings, if necessary",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: '"50true"',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["5&0&true"],
            },
        ],
    },
    // Numeric Expressions
    {
        name: "Jsonata: Addition",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "3.4",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] + Numbers[1]"],
            },
        ],
    },
    {
        name: "Jsonata: Subtraction",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "-19.9",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] - Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Multiplication",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "30",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] * Numbers[5]"],
            },
        ],
    },
    {
        name: "Jsonata: Division",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "0.04784688995215311",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] / Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Modulus",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "3.5",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[2] % Numbers[5]"],
            },
        ],
    },
    {
        name: "Jsonata: Equality",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "false",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] = Numbers[5]"],
            },
        ],
    },
    {
        name: "Jsonata: Inequality",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] != Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Less than",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] < Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Less than or equal to",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] <= Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Greater than",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "false",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[0] > Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Greater than or equal to",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "false",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["Numbers[2] >= Numbers[4]"],
            },
        ],
    },
    {
        name: "Jsonata: Value is contained in",
        input: INPUT_JSON_OBJECT_WITH_ARRAYS,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ['"01962 001234" in Phone.number'],
            },
        ],
    },
    // Boolean Expressions
    {
        name: "Jsonata: and",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["(Numbers[2] != 0) and (Numbers[5] != Numbers[1])"],
            },
        ],
    },
    {
        name: "Jsonata: or",
        input: INPUT_NUMBER_ARRAY,
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["(Numbers[2] != 0) or (Numbers[5] = Numbers[1])"],
            },
        ],
    },
    // Array tests
    {
        name: "Jsonata: $ at the start of an expression refers to the entire input document, subscripting it with 0 selects the first item",
        input: INPUT_ARRAY_OF_OBJECTS,
        expectedOutput: '{"ref":[1,2]}',
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["$[0]"],
            },
        ],
    },
    {
        name: "Jsonata: .ref here returns the entire internal array",
        input: INPUT_ARRAY_OF_OBJECTS,
        expectedOutput: "[1,2]",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["$[0].ref"],
            },
        ],
    },
    {
        name: "Jsonata: returns element on first position of the internal array",
        input: INPUT_ARRAY_OF_OBJECTS,
        expectedOutput: "1",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["$[0].ref[0]"],
            },
        ],
    },
    {
        name: "Jsonata: $.field_reference flattens the result into a single array",
        input: INPUT_ARRAY_OF_OBJECTS,
        expectedOutput: "[1,2,3,4]",
        recipeConfig: [
            {
                op: "Jsonata Query",
                args: ["$.ref"],
            },
        ],
    },
]);
