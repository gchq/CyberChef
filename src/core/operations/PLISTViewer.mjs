/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * PLIST Viewer operation
 */
class PLISTViewer extends Operation {

    /**
     * PLISTViewer constructor
     */
    constructor() {
        super();

        this.name = "PLIST Viewer";
        this.module = "Other";
        this.description = "Converts PLISTXML file into a human readable format.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
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
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        const reserved = [["<string>","</string>",8],
                    ["<real>","</real>",6],
                    ["<integer>","</integer>",9],
                    ["<date>","</date>", 6],
                    ["<data>","</data>",6],
                    ["<array>","</array>",7],
                    ["<dict>","</dict>",6],
                    ["<key>","</key>",5],
                    ["<false/>",false,8],
                    ["<true/>",true,7]];
        
        function the_viewer(input, dictionary_flag){
            var new_dict = new Array();
            var result = new Array();
            var new_key = null;
            while(dictionary_flag ? input.slice(0,7) != "</dict>" : input.slice(0,8) != "</array>"){
                reserved.forEach( function (elem, index){
                    var element = elem[0];
                    var endelement = elem[1];
                    var length = elem[2];
                    let temp = input.slice(0,length);
                    if(temp == element){
                        input = input.slice(length);
                        if(temp == "<dict>"){
                            var returned = the_viewer(input, true);
                            input = returned[1];
                            if(new_key)
                                new_dict[new_key] = returned[0];
                            else
                                new_dict["plist"] = returned[0];
                            new_key = null;
                        }else if(temp == "<array>"){
                            var returned = the_viewer(input, false);
                            if(dictionary_flag)
                                new_dict[new_key] = returned[0];
                            else
                                result.push(returned[0]);
                            input = returned[1];
                            new_key = null;
                        }else if(temp == "<key>"){
                            var end = input.indexOf(endelement);
                            new_key = input.slice(0, end);
                            input = input.slice(end+length+1);
                        }else if(temp == "<true/>" || temp == "<false/>"){
                            new_dict[new_key] = endelement;
                            new_key = null;
                        }else{
                            var end = input.indexOf(endelement);
                            var toadd = input.slice(0, end);
                            if(temp == "<integer>")
                                toadd = parseInt(toadd);
                            else if(temp == "<real>")
                                toadd = parseFloat(toadd);
                            if(dictionary_flag){
                                new_dict[new_key] = toadd;
                                new_key = null;
                            }else{
                                result.push(toadd);
                            }
                            input = input.slice(end+length+1);
                        }
                    }
                });
            }
            if(dictionary_flag){
                input = input.slice(7);
                return [new_dict, input];
            }else{
                input = input.slice(8);
                return [result, input];
            }
        }
        
        let result = "";
        function print_it(input, depth) {
            Object.keys(input).forEach((key, index) => {
                if(typeof(input[key]) == "object") {
                    result += (("\t".repeat(depth)) + key + ": {\n");
                    print_it(input[key], depth+1);
                    result += (("\t".repeat(depth)) + "}\n");
                } else {
                    result += (("\t".repeat(depth)) + key + " : " + input[key] + "\n");
                }
            });
        }

        while (input.indexOf("<plist") !== -1){
            input = input.replace(/<plist.+>/, "<dict>");
        }
        while (input.indexOf("</plist>") !== -1){
            input = input.replace(/<\/plist>/, "</dict>");
        }
        console.log(input);
        while(input.indexOf("\n") !== -1)
            input = input.replace("\n", "");
        while(input.indexOf("\t") !== -1)
            input = input.replace("\t", "");
        while(input.indexOf(" ") !== -1)
            input = input.replace(" ", "");
        console.log(input);
        input = input.slice(input.indexOf("<dict>")+6);
        //return input
        var other = the_viewer(input, 1);
        print_it(other[0],1);
        result = "{\n" + result;
        result += "}";
        return result;
    }
}

export default PLISTViewer;
