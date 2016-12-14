/**
 * Flow Control operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const FlowControl = {

    /**
     * @constant
     * @default
     */
    FORK_DELIM: "\\n",
    /**
     * @constant
     * @default
     */
    MERGE_DELIM: "\\n",
    
    /**
     * Fork operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.op_list - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    run_fork: function(state) {
        var op_list     = state.op_list,
            input_type  = op_list[state.progress].input_type,
            output_type = op_list[state.progress].output_type,
            input       = state.dish.get(input_type),
            ings        = op_list[state.progress].get_ing_values(),
            split_delim = ings[0],
            merge_delim = ings[1],
            sub_op_list = [],
            inputs      = [];
        
        if (input)
            inputs = input.split(split_delim);
        
        // Create sub_op_list for each tranche to operate on
        // (all remaining operations unless we encounter a Merge)
        for (var i = state.progress + 1; i < op_list.length; i++) {
            if (op_list[i].name === "Merge" && !op_list[i].is_disabled()) {
                break;
            } else {
                sub_op_list.push(op_list[i]);
            }
        }
        
        var recipe = new Recipe(),
            output = "",
            progress;
            
        recipe.add_operations(sub_op_list);
        
        // Run recipe over each tranche
        for (i = 0; i < inputs.length; i++) {
            var dish = new Dish(inputs[i], input_type);
            progress = recipe.execute(dish, 0);
            output += dish.get(output_type) + merge_delim;
        }
        
        state.dish.set(output, output_type);
        state.progress += progress;
        return state;
    },
    
    
    /**
     * Merge operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.op_list - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    run_merge: function(state) {
        // No need to actually do anything here. The fork operation will
        // merge when it sees this operation.
        return state;
    },
    
    
    /**
     * @constant
     * @default
     */
    JUMP_NUM: 0,
    /**
     * @constant
     * @default
     */
    MAX_JUMPS: 10,
    
    /**
     * Jump operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.op_list - The list of operations in the recipe.
     * @param {number} state.num_jumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    run_jump: function(state) {
        var ings      = state.op_list[state.progress].get_ing_values(),
            jump_num  = ings[0],
            max_jumps = ings[1];
        
        if (state.num_jumps >= max_jumps) {
            throw "Reached maximum jumps, sorry!";
        }
        
        state.progress += jump_num;
        state.num_jumps++;
        return state;
    },
    
    
    /**
     * Conditional Jump operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.op_list - The list of operations in the recipe.
     * @param {number} state.num_jumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    run_cond_jump: function(state) {
        var ings      = state.op_list[state.progress].get_ing_values(),
            dish      = state.dish,
            regex_str = ings[0],
            jump_num  = ings[1],
            max_jumps = ings[2];
        
        if (state.num_jumps >= max_jumps) {
            throw "Reached maximum jumps, sorry!";
        }
        
        if (regex_str !== "" && dish.get(Dish.STRING).search(regex_str) > -1) {
            state.progress += jump_num;
            state.num_jumps++;
        }
        
        return state;
    },
    
    
    /**
     * Return operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.op_list - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    run_return: function(state) {
        state.progress = state.op_list.length;
        return state;
    },
    
};
