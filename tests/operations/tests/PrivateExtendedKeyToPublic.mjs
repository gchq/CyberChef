/**
 * Private Extended Key to Public Version Extended Key Tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Private Extended Key To Public (xprv)",
        input: "xprv9yoUuSwPzquxGY9ZsqizskpbKBbthhTpj5w4k2o8cxoFKigDAhUV3GCHtKL4CFuUCHvwGt9bo1DRnavubpiiS2wJ9AN9bbnipT95qKyda6r",
        expectedOutput: "xpub6CnqJxUHqDUFV2E2ysG1EtmKsDSP7ABg6JrfYRCkBJLECX1MiEnjb4WmjYnUvYjzvnrygmcVMH2vSuZMNUWozhrDpqr8fpEZfxAune2FYPX",
        recipeConfig: [
            {
                "op": "Private Extended Key To Public",
                "args": []
            }
        ]
    },
    {
        name: "Private Extended Key To Public (yprv)",
        input: "yprvAJEHhwPWiVEbr18CDkhzPRm3ywbJCCuVV7Q8UzLtE4t75hajmN7DvjeS3BWbQGPdAANzyPmhUZitHEqyLX8KoBBnRqitj2Kvisw6dgmVwBH",
        expectedOutput: "ypub6XDe7SvQYrnu4VCfKnEzkZhnXyRnbfdLrLKjHNkVnQR5xVutJuRUUXxutSgRgjRaJKHKHW1WXLqCmbgQgapdwsx98NnRDXwhZFkavU6ojct",
        recipeConfig: [
            {
                "op": "Private Extended Key To Public",
                "args": []
            }
        ]
    },
    {
        name: "Private Extended Key To Public (zprv)",
        input: "zprvAdjAKuQajRu4ptst29FzkcB18fyZuHCKJhe51m38ejMcjW5P4frUffXMYfwLiTs4UrFD5m41So3VhAWGyrb4YV4gFRwYuLom8psLoW252Xd",
        expectedOutput: "zpub6riWjQwUZoTN3NxM8Ao17k7jghp4JjvAfvZfp9SkD4tbcJQXcDAjDTqqPxywFFvD1BHiMMKvW3EjwMvuc7k2YcQbF1v2R42gxac4k3qq3sc",
        recipeConfig: [
            {
                "op": "Private Extended Key To Public",
                "args": []
            }
        ]
    },
    {
        name: "Private Extended Key To Public (blank)",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Private Extended Key To Public",
                "args": []
            }
        ]
    }

]);
