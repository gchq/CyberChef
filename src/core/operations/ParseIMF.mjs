/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

 import Operation from "../Operation";
 import OperationError from "../errors/OperationError";
 import cptable from "../vendor/js-codepage/cptable.js";
 import {fromBase64} from "../lib/Base64";
 import {MIME_FORMAT} from "../lib/ChrEnc";


 //TODO: fix function header
 /**
  * Return the conetent encoding for a mime section from a header object.
  * CONTENT_TYPE returns the content type of a mime header from a header object.
  * Returns the filename from a mime header object.
  * Returns the boundary value for the mime section from a header object.
  * @constant
  * @default
  */
 const FIELD_ITEM = {
     FILENAME: [/filename=".*?([^~#%&*\][\\:<>?/|]+)"/, "content-disposition"],
     CONTENT_TYPE: [/\s*([^;\s]+)/, "content-type"],
     BOUNDARY: [/boundary="(.+?)"/, "content-type"],
     CHARSET: [/charset=([a-z0-9-]+)/, "content-type"],
     TRANSER_ENCODING: [/\s*([A-Za-z0-9-]+)\s*/, "content-transfer-encoding"],
 }

 /**
  * @constant
  * @default
  */
 //TODO: should 8 bit and 7 bit be treated the same?
 const DECODER = {
     "base64": function (input) {
         return Utils.fromBase64(input, Base64.ALPHABET, "string", true);
     },
     "quoted-printable": function (input) {
         return QuotedPrintable.mimeDecode(input);
     },
     "7bit": function (input) {
         return input;
     },
     "8bit": function (input) {
         return input;
     },
 }


 class ParseIMF extends Operation {

   /**
    * Internet MessageFormat constructor
    */
  constructor() {
    super();
    this.name = "Parse Internet Message Format";
    this.module = "Default";
    this.description = ["Parser an IMF formatted messages following RFC5322.",
      "<br><br>",
      "Parses an IMF formated message. These often have the file extention &quot;.eml&quote; and contain the email headers and body. The output will be a file list of the headers and mime parts.",
    ].join("\n");
    this.infoURL = "https://tools.ietf.org/html/rfc5322";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    }

    /**
      * Basic Email Parser that displays the header and mime sections as files.
      *
      * @param {string} input
      * @param {Object[]} args
      * @returns {string}
      */
  run(input, args) {
    if (!input) {
        return;
    }
    let headerBody = Email._splitHeaderFromBody(input);
    let header = headerBody[0];
    let headerArray = Email._parseHeader(header);
    if (args[0]) {
        header = Email._replaceDecodeWord(header);
    }
    return JSON.stringify(headerArray);
  }

  /**
   * Breaks the header from the body and returns [header, body]
   *
   * @param {string} input
   * @returns {string[]}
   */
  splitHeaderFromBody(input) {
      const emlRegex = /^([\x20-\x7e\n\r\t]+?)(?:\r?\n){2}([\x20-\x7e\t\n\r]*)/;
      let splitEmail = emlRegex.exec(input);
      if (splitEmail) {
          //TODO: Array splice vs shift?
          splitEmail.shift();
          return splitEmail;
      }
  }

  /**
   * Takes a string and decodes quoted words inside them
   * These take the form of =?utf-8?Q?Hello?=
   *
   * @param {string} input
   * @returns {string}
   */
  replaceDecodeWord(input) {
      return input.replace(/=\?([^?]+)\?(Q|B)\?([^?]+)\?=/g, function (a, charEnc, contEnc, input) {
          //TODO fix Q encoding as it isn't identical to quoted-printable. ie _=" "
          contEnc = (contEnc === "B") ? "base64" : "quoted-printable";
          return this.decodeMimeData(input, charEnc, contEnc);
      });
  }

  /**
   * Breaks a header into a object to be used by other functions.
   * It removes any line feeds or carriage returns from the values and
   * replaces it with a space.
   *
   * @param {string} input
   * @returns {object}
   */
  parseHeader(input) {
      const sectionRegex = /([A-Z-]+):\s+([\x20-\x7e\r\n\t]+?)(?=$|\r?\n\S)/gi;
      let header = {}, section;
      while ((section = sectionRegex.exec(input))) {
          let fieldName = section[1].toLowerCase();
          let fieldValue = section[2].replace(/\n|\r/g, " ");
          if (header[fieldName]) {
              header[fieldName].push(fieldValue);
          } else {
              header[fieldName] = [fieldValue];
          }
      }
      return header;
  }

  /**
   * Return decoded MIME data given the character encoding and content encoding.
   *
   * @param {string} input
   * @param {string} charEnc
   * @param {string} contEnc
   * @returns {string}
   */
  decodeMimeData(input, charEnc, contEnc) {
      //TODO: make exceptions for unknown charEnc and contEnc?
      input = this.DECODER[contEnc](input);
      if (charEnc) {
          input = cptable.utils.decode(this.MIME_FORMAT[charEnc.toLowerCase()], input);
      }
      return input;
  }

  /**
   * Returns a header item given a header object, itemName, and index number.
   *
   * @param {object} header
   * @param {object} FIELD_ITEM
   * @param {integer} fieldNum
   * @returns {string}
   */
  getHeaderItem(header, fieldItem, fieldNum = 0){
      if (fieldItem[1] in header && header[fieldItem[1]].length > fieldNum) {
          let field = header[fieldItem[1]][fieldNum], item;
          if ((item = fieldItem[0].exec(field))) {
              return item[1];
          }
      }
  }

}

export default ParseIMF
