import assert from "assert";
import it from "../assertionHandler";
import TestRegister from "../../lib/TestRegister";
import File from "../../../src/node/File";

TestRegister.addApiTests([
    it("File: should exist", () => {
        assert(File);
    }),

    it("File: Should have same properties as DOM File object", () => {
        const uint8Array = new Uint8Array(Buffer.from("hello"));
        const file = new File([uint8Array], "name.txt");
        assert.equal(file.name, "name.txt");
        assert(typeof file.lastModified, "number");
        assert(file.lastModifiedDate instanceof Date);
        assert.equal(file.size, uint8Array.length);
        assert.equal(file.type, "text/plain");
    }),
]);
