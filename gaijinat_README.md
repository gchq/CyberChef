# CyberChef

CyberChef is a simple, intuitive web app for carrying out all manner of "cyber" operations within a web browser. The tool is designed to enable both technical and non-technical analysts to manipulate data in complex ways without having to deal with complex tools or algorithms.

**This is the Gaijin.at version with additional operations not included in the original version.**

Get the source code for [Gaijin.at CyberChef on GitHub](https://github.com/gaijinat/CyberChef/) or get the original [GCHQ CyberChef on GitHub](https://github.com/gchq/CyberChef/).

#### More about CyberChef on Gaijin.at

- [**Gaijin.at version of CyberChef**](https://www.gaijin.at/CyberChef/) - have fun!

- [A brief overview of CyberChef](https://www.gaijin.at/en/infos/cyberchef) and a description of its main features

- [Ready to use CyberChef recipes](https://www.gaijin.at/en/infos/cyberchef-recipes)



## Gaijin.at Operations


### Byte Analyser

Analyses the bytes in the input and displays statistics about them. A histogram shows the distribution of the individual bytes.

This operation is very similar to the operation "*Frequency distribution*".

The main differences are:
- A full-width histogram with tool-tips showing byte information.
- All represented printable ASCII characters will be shown in one line.
- The characters are shown in a table, including their binary, hexadecimal and decimal representation, as well as the number and percentage of occurrences.


### Output

Outputs the entered text. This is useful to output text with stored registers.

Example: Assuming `$R0` is `12` and `$R1` is `Test`, the string `"$R1" was found $R0 times.` will output `"Test" was found 12 times.`.


### Pad

Fills the input with one or more characters until the specified length is reached. This is useful to align text left or right, or to center a text.

In contrast, the original operation "*Pad lines*" adds a certain number of characters to the input.

Example: Assuming `Position` is set to `Start`, `Length` is `3` and `String` is `0`, the input `5` will be output as `005`.


### Prepend / Append

Adds the specified text to the beginning and/or end of each line, character or the entire input.
Includes support for simple strings and extended strings (which support \\n, \\r, \\t, \\b, \\f and escaped hex bytes using \\x notation, e.g. \\x00 for a null byte).


### Store / Restore Input

Stores the input value and restores it later as output.

**Store** stores the input under the given name.
**Restore** restores the input with the given name as output.
**Clear** removes the stored input with the given name. Without a name, all stored inputs will be removed.

You should deactivate '*Auto Bake*' for this operation.

This operation can be useful if you need to process the original input - or any other value - with different operations. The inputs can be stored and restored inside and outside of a `Fork` or `Subsection`.


### Trim

Removes all white-spaces and line breaks from the beginning, end or both of the input data.



## Licencing

The Gaijin.at version of CyberChef is released under the [Apache 2.0 Licence](https://www.apache.org/licenses/LICENSE-2.0).

The [original version of CyberChef](https://github.com/gchq/CyberChef) is released under the [Apache 2.0 Licence](https://www.apache.org/licenses/LICENSE-2.0) and is covered by [Crown Copyright](https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/).
