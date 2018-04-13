/**
 * Wrap operations in a
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Dish from "../core/Dish";
import log from "loglevel";

/**
 * 
 */
export default class Wrapper {

    /**
     * 
     * @param arg 
     */
    extractArg(arg) {
        if (arg.type === "option" || arg.type === "editableOption") {
            return arg.value[0];
        }

        return arg.value;
    }

    /**
     * 
     */
    wrap(operation) {
        this.operation = new operation();
        // This for just exposing run function:
        // return this.run.bind(this);

        /**
         * 
         * @param input 
         * @param args 
         */
        const _run = async(input, args=null) => {
            const dish = new Dish(input);

            try {
                dish.findType();
            } catch (e) {
                log.debug(e);
            }
    
            if (!args) {
                args = this.operation.args.map(this.extractArg);
            } else {
                // Allows single arg ops to have arg defined not in array
                if (!(args instanceof Array)) {
                    args = [args];
                }
            }
            const transformedInput = await dish.get(Dish.typeEnum(this.operation.inputType));
            return this.operation.innerRun(transformedInput, args);
        };

        // There's got to be a nicer way to do this!
        this.operation.innerRun = this.operation.run;
        this.operation.run = _run;

        return this.operation;
    }

    /**
     *
     * @param input
     */
    async run(input, args = null) {
        const dish = new Dish(input);

        try {
            dish.findType();
        } catch (e) {
            log.debug(e);
        }

        if (!args) {
            args = this.operation.args.map(this.extractArg);
        } else {
            // Allows single arg ops to have arg defined not in array
            if (!(args instanceof Array)) {
                args = [args];
            }
        }

        const transformedInput = await dish.get(Dish.typeEnum(this.operation.inputType));
        return this.operation.run(transformedInput, args);




    }
}
