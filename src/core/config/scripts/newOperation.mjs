/**
 * Interactive script for generating a new operation template.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/*eslint no-console: ["off"] */

import prompt from "prompt";
import colors from "colors";
import process from "process";
import fs from "fs";
import path from "path";
import EscapeString from "../../operations/EscapeString";


const dir = path.join(process.cwd() + "/src/core/operations/");
if (!fs.existsSync(dir)) {
    console.log("\nCWD: " + process.cwd());
    console.log("Error: newOperation.mjs should be run from the project root");
    console.log("Example> node --experimental-modules src/core/config/scripts/newOperation.mjs");
    process.exit(1);
}

const ioTypes = ["string", "byteArray", "number", "html", "ArrayBuffer", "BigNumber", "JSON", "File", "List<File>"];

const schema = {
    properties: {
        opName: {
            description: "The operation name should be short but descriptive.",
            example: "URL Decode",
            prompt: "Operation name",
            type: "string",
            pattern: /^[\w\s-/().]+$/,
            required: true,
            message: "Operation names should consist of letters, numbers or the following symbols: _-/()."
        },
        module: {
            description: `Modules are used to group operations that rely on large libraries. Any operation that is not in the Default module will be loaded in dynamically when it is first called. All operations in the same module will also be loaded at this time. This system prevents the CyberChef web app from getting too bloated and taking a long time to load initially.
If your operation does not rely on a library, just leave this blank and it will be added to the Default module. If it relies on the same library as other operations, enter the name of the module those operations are in. If it relies on a new large library, enter a new module name (capitalise the first letter).`,
            example: "Crypto",
            prompt: "Module",
            type: "string",
            pattern: /^[A-Z][A-Za-z\d]+$/,
            message: "Module names should start with a capital letter and not contain any spaces or symbols.",
            default: "Default"
        },
        description: {
            description: "The description should explain what the operation is and how it works. It can describe how the arguments should be entered and give examples of expected input and output. HTML markup is supported. Use <code> tags for examples. The description is scanned during searches, so include terms that are likely to be searched for when someone is looking for your operation.",
            example: "Converts URI/URL percent-encoded characters back to their raw values.<br><br>e.g. <code>%3d</code> becomes <code>=</code>",
            prompt: "Description",
            type: "string"
        },
        inputType: {
            description: `The input type defines how the input data will be presented to your operation. Check the project wiki for a full description of each type. The options are: ${ioTypes.join(", ")}.`,
            example: "string",
            prompt: "Input type",
            type: "string",
            pattern: new RegExp(`^(${ioTypes.join("|")})$`),
            required: true,
            message: `The input type should be one of: ${ioTypes.join(", ")}.`
        },
        outputType: {
            description: `The output type tells CyberChef what sort of data you are returning from your operation. Check the project wiki for a full description of each type. The options are: ${ioTypes.join(", ")}.`,
            example: "string",
            prompt: "Output type",
            type: "string",
            pattern: new RegExp(`^(${ioTypes.join("|")})$`),
            required: true,
            message: `The output type should be one of: ${ioTypes.join(", ")}.`
        },
        highlight: {
            description: "If your operation does not change the length of the input in any way, we can enable highlighting. If it does change the length in a predictable way, we may still be able to enable highlighting and calculate the correct offsets. If this is not possible, we will disable highlighting for this operation.",
            example: "true/false",
            prompt: "Enable highlighting",
            type: "boolean",
            default: "false",
            message: "Enter true or false to specify if highlighting should be enabled."
        },
        authorName: {
            description: "Your name or username will be added to the @author tag for this operation.",
            example: "n1474335",
            prompt: "Username",
            type: "string"
        },
        authorEmail: {
            description: "Your email address will also be added to the @author tag for this operation.",
            example: "n1474335@gmail.com",
            prompt: "Email",
            type: "string"
        }
    }
};

// Build schema
for (const prop in schema.properties) {
    const p = schema.properties[prop];
    p.description = "\n" + colors.white(p.description) + colors.cyan("\nExample: " + p.example) + "\n" + colors.green(p.prompt);
}

console.log("\n\nThis script will generate a new operation template based on the information you provide. These values can be changed manually later.".yellow);

prompt.message = "";
prompt.delimiter = ":".green;

prompt.start();

prompt.get(schema, (err, result) => {
    if (err) {
        console.log("\nExiting build script.");
        process.exit(0);
    }

    const moduleName = result.opName.replace(/\w\S*/g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
    }).replace(/[\s-()/./]/g, "");


    const template = `/**
 * @author ${result.authorName} [${result.authorEmail}]
 * @copyright Crown Copyright ${(new Date()).getFullYear()}
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * ${result.opName} operation
 */
class ${moduleName} extends Operation {

    /**
     * ${moduleName} constructor
     */
    constructor() {
        super();

        this.name = "${result.opName}";
        this.module = "${result.module}";
        this.description = "${(new EscapeString).run(result.description, ["Special chars", "Double"])}";
        this.inputType = "${result.inputType}";
        this.outputType = "${result.outputType}";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * @param {${result.inputType}} input
     * @param {Object[]} args
     * @returns {${result.outputType}}
     */
    run(input, args) {
        // const [firstArg, secondArg] = args;

        throw new OperationError("Test");
    }
${result.highlight ? `
    /**
     * Highlight ${result.opName}
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight ${result.opName} in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }
` : ""}
}

export default ${moduleName};
`;

    //console.log(template);

    const filename = path.join(dir, `./${moduleName}.mjs`);
    if (fs.existsSync(filename)) {
        console.log(`${filename} already exists. It has NOT been overwritten.`.red);
        console.log("Choose a different operation name to avoid conflicts.");
        process.exit(0);
    }
    fs.writeFileSync(filename, template);

    console.log(`\nOperation template written to ${colors.green(filename)}`);
    console.log(`\nNext steps:
1. Add your operation to ${colors.green("src/core/config/Categories.json")}
2. Write your operation code.
3. Write tests in ${colors.green("test/tests/operations/")}
4. Run ${colors.cyan("npm run lint")} and ${colors.cyan("npm run test")}
5. Submit a Pull Request to get your operation added to the official CyberChef repository.`);

});

