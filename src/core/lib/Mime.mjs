/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError";
import cptable from "../vendor/js-codepage/cptable.js";
import {decodeQuotedPrintable} from "../lib/QuotedPrintable";
import {MIME_FORMAT} from "../lib/ChrEnc";
import Utils from "../Utils";

/**
 * NOTE: Liberties taken include:
 * No checks are made to verify quoted words are valid encodings e.g. underscore vs escape
 * This attempts to decode mime reguardless if it is \r\n (correct newline) or \n (incorrect)
 * Both Base64 and QuotedPrintable is used for decode. UUEncode is not available right now
 * and is a standardized encoding format.
 */
class Mime {
    /**
     * Internet MessageFormat constructor
     */
    constructor(input) {
        this.input = input;
        this.rn = input.indexOf("\r") >= 0;
    }

    /**
     * Basic Email Parser that displays the header and mime sections as files.
     * Args 0 boolean decode quoted words
     *
     * @param {string} input
     * @param {boolean} decodeWords
     * @returns {File[]}
     */
    decodeMime(decodeWords) {
        if (!this.input) {
            return [];
        }
        const emlObj = Mime._splitParseHead(this.input);
        if (!emlObj.body) {
            throw new OperationError("No body was found");
        }
        if (decodeWords) {
            emlObj.rawHeader = Mime.replaceEncodedWord(emlObj.rawHeader);
        }
        const retval = [new File([emlObj.rawHeader], "Header", {type: "text/plain"})];
        let testval = Mime._walkMime(this.input);
        console.log(JSON.stringify(testval));
        testval.forEach(function(fileObj){
            let name = fileObj.name;
            if (fileObj.name === null) {
                if (emlObj.header.hasOwnProperty("subject")) {
                    name = emlObj.header.subject[0];
                } else {
                    name = "Undefined";
                }
                name = name.concat(Mime.getFileExt(fileObj.type));
            }
            retval.push(new File([Uint8Array.from(fileObj.data)], name, {type: fileObj.type}));
        });
        return retval;
    }

    /**
    {
    	"rawHeader": "Message-ID: <39235FC5.276CCE00@example.com>\nDate: Wed, 17 May 2000 23:13:09 -0400\nFrom: Doug Sauder <dwsauder@example.com>\nX-Mailer: Mozilla 4.7 [en] (WinNT; I)\nX-Accept-Language: en\nMIME-Version: 1.0\nTo: Heinz =?iso-8859-1?Q?M=FCller?= <mueller@example.com>\nSubject: Die Hasen und die =?iso-8859-1?Q?Fr=F6sche?= (Netscape Messenger 4.7)\nContent-Type: multipart/mixed;\n boundary=\"------------A1E83A41894D3755390B838A\"",
    	"body": [
    		{
    			"rawHeader": "\nContent-Type: multipart/alternative;\n boundary=\"------------F03F94BA73D3B9E8C1B94D92\"",
    			"body": [
    				{
    					"rawHeader": "\nContent-Type: text/plain; charset=iso-8859-1\nContent-Transfer-Encoding: quoted-printable",
    					"body": "[blue ball]\n\nDie Hasen und die Fr=F6sche\n\nDie Hasen klagten einst =FCber ihre mi=DFliche Lage; \"wir leben\", sprach =\nein\nRedner, \"in steter Furcht vor Menschen und Tieren, eine Beute der Hunde,\nder Adler, ja fast aller Raubtiere! Unsere stete Angst ist =E4rger als de=\nr\nTod selbst. Auf, la=DFt uns ein f=FCr allemal sterben.\"\n\nIn einem nahen Teich wollten sie sich nun ers=E4ufen; sie eilten ihm zu;\nallein das au=DFerordentliche Get=F6se und ihre wunderbare Gestalt\nerschreckte eine Menge Fr=F6sche, die am Ufer sa=DFen, so sehr, da=DF sie=\n aufs\nschnellste untertauchten.\n\n\"Halt\", rief nun eben dieser Sprecher, \"wir wollen das Ers=E4ufen noch ei=\nn\nwenig aufschieben, denn auch uns f=FCrchten, wie ihr seht, einige Tiere,\nwelche also wohl noch ungl=FCcklicher sein m=FCssen als wir.\"\n\n[Image]\n\n\n",
    					"header": {
    						"content-type": [
    							"text/plain; charset=iso-8859-1"
    						],
    						"content-transfer-encoding": [
    							"quoted-printable"
    						]
    					}
    				},
    				{
    					"rawHeader": "\nContent-Type: multipart/related;\n boundary=\"------------C02FA3D0A04E95F295FB25EB\"",
    					"body": [
    						{
    							"rawHeader": "\nContent-Type: text/html; charset=us-ascii\nContent-Transfer-Encoding: 7bit",
    							"body": "<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<html>\n<img SRC=\"cid:part1.39235FC5.E71D8178@example.com\" ALT=\"blue ball\" height=27 width=27><b></b>\n<p><b>Die Hasen und die Fr&ouml;sche</b>\n<p>Die Hasen klagten einst &uuml;ber ihre mi&szlig;liche Lage; \"wir leben\",\nsprach ein Redner, \"in steter Furcht vor Menschen und Tieren, eine Beute\nder Hunde, der Adler, ja fast aller Raubtiere! Unsere stete Angst ist &auml;rger\nals der Tod selbst. Auf, la&szlig;t uns ein f&uuml;r allemal sterben.\"\n<p>In einem nahen Teich wollten sie sich nun ers&auml;ufen; sie eilten\nihm zu; allein das au&szlig;erordentliche Get&ouml;se und ihre wunderbare\nGestalt erschreckte eine Menge Fr&ouml;sche, die am Ufer sa&szlig;en, so\nsehr, da&szlig; sie aufs schnellste untertauchten.\n<p>\"Halt\", rief nun eben dieser Sprecher, \"wir wollen das Ers&auml;ufen\nnoch ein wenig aufschieben, denn auch uns f&uuml;rchten, wie ihr seht,\neinige Tiere, welche also wohl noch ungl&uuml;cklicher sein m&uuml;ssen\nals wir.\"\n<p><img SRC=\"cid:part2.39235FC5.E71D8178@example.com\" height=27 width=27>\n<br>&nbsp;\n<br>&nbsp;</html>\n",
    							"header": {
    								"content-type": [
    									"text/html; charset=us-ascii"
    								],
    								"content-transfer-encoding": [
    									"7bit"
    								]
    							}
    						},
    						{
    							"rawHeader": "\nContent-Type: image/png\nContent-ID: <part1.39235FC5.E71D8178@example.com>\nContent-Transfer-Encoding: base64\nContent-Disposition: inline; filename=\"C:\\TEMP\\nsmailEG.png\"",
    							"body": "iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAADAFBMVEX///8AAAgAABAAABgA\nAAAACCkAEEIAEEoACDEAEFIIIXMIKXsIKYQIIWsAGFoACDkIIWMQOZwYQqUYQq0YQrUQOaUQ\nMZQAGFIQMYwpUrU5Y8Y5Y84pWs4YSs4YQs4YQr1Ca8Z7nNacvd6Mtd5jlOcxa94hUt4YStYY\nQsYQMaUAACHO5+/n7++cxu9ShO8pWucQOa1Ke86tzt6lzu9ajO8QMZxahNat1ufO7++Mve9K\ne+8YOaUYSsaMvee15++Uve8AAClajOdzpe9rnO8IKYwxY+8pWu8IIXsAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB\nMg1VAAAAAXRSTlMAQObYZgAAABZ0RVh0U29mdHdhcmUAZ2lmMnBuZyAyLjAuMT1evmgAAAGI\nSURBVHicddJtV5swGAbgEk6AJhBSk4bMCUynBSLaqovbrG/bfPn/vyh70lbsscebL5xznTsh\n5BmNhgQoRChwo50EOIohUYLDj4zHhKYQkrEoQdvock4ne0IKMVUpKZLQDeqSTIsv+18PyqqW\nUw2IBsRM7307PPp+fDJrWtnpLDJvewYxnewfnvanZ+fzpmwXijC8KbqEa3Fx2ff91Y95U9XC\nUpaDeQwiMpHXP/v+1++bWVPWQoGFawtjury9vru/f/C1Vi7ezT0WWpQHf/7+u/G71aLThK/M\njRxmT6KdzZ9fGk9yatMsTgZLl3XVgFRAC6spj/13enssqJVtWVa3NdBSacL8+VZmYqKmdd1C\nSYoOiMOSGwtzlqqlFFIuOqv0a1ZEZrUkWICLLFW266y1KvWE1zV/iDAH1EopnVLCiygZCIom\nH3NCKX0lnI+B1iuuzCGTxwXjnDO4d7NpbX42YJJHkBwmAm2TxwAZg40J3+Xtbv1rgOAZwG0N\nxW62p+lT+Yi747sD/wEUVMzYmWkOvwAAACV0RVh0Q29tbWVudABjbGlwMmdpZiB2LjAuNiBi\neSBZdmVzIFBpZ3VldDZzO7wAAAAASUVORK5CYII=",
    							"header": {
    								"content-type": [
    									"image/png"
    								],
    								"content-id": [
    									"<part1.39235FC5.E71D8178@example.com>"
    								],
    								"content-transfer-encoding": [
    									"base64"
    								],
    								"content-disposition": [
    									"inline; filename=\"C:\\TEMP\\nsmailEG.png\""
    								]
    							}
    						},
    						{
    							"rawHeader": "\nContent-Type: image/png\nContent-ID: <part2.39235FC5.E71D8178@example.com>\nContent-Transfer-Encoding: base64\nContent-Disposition: inline; filename=\"C:\\TEMP\\nsmail39.png\"",
    							"body": "iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAADAFBMVEX///8AAAABAAALAAAV\nAAAaAAAXAAARAAAKAAADAAAcAAAyAABEAABNAABIAAA9AAAjAAAWAAAmAABhAAB7AACGAACH\nAAB9AAB0AABgAAA5AAAUAAAGAAAnAABLAABvAACQAAClAAC7AAC/AACrAAChAACMAABzAABb\nAAAuAAAIAABMAAB3AACZAAC0GRnKODjVPT3bKSndBQW4AACoAAB5AAAxAAAYAAAEAABFAACa\nAAC7JCTRYWHfhITmf3/mVlbqHx/SAAC5AACjAABdAABCAAAoAAAJAABnAAC6Dw/QVFTek5Pl\nrKzpmZntZWXvJSXXAADBAACxAACcAABtAABTAAA2AAAbAAAFAABKAACBAADLICDdZ2fonJzr\npqbtiorvUVHvFBTRAADDAAC2AAB4AABeAABAAAAiAABXAACSAADCAADaGxvoVVXseHjveHjv\nV1fvJibhAADOAAC3AACnAACVAABHAAArAAAPAACdAADFAADhBQXrKCjvPDzvNTXvGxvjAADQ\nAADJAAC1AACXAACEAABsAABPAAASAAACAABiAADpAADvAgLnAADYAADLAAC6AACwAABwAAAT\nAAAkAABYAADIAADTAADNAACzAACDAABuAAAeAAB+AADAAACkAACNAAB/AABpAABQAAAwAACR\nAACpAAC8AACqAACbAABlAABJAAAqAAAOAAA0AACsAACvAACtAACmAACJAAB6AABrAABaAAA+\nAAApAABqAACCAACfAACeAACWAACPAAB8AAAZAAAHAABVAACOAACKAAA4AAAQAAA/AAByAACA\nAABcAAA3AAAsAABmAABDAABWAAAgAAAzAAA8AAA6AAAfAAAMAAAdAAANAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8\nLtlFAAAAAXRSTlMAQObYZgAAABZ0RVh0U29mdHdhcmUAZ2lmMnBuZyAyLjAuMT1evmgAAAII\nSURBVHicY2CAg/8QwIABmJhZWFnZ2Dk4MaU5uLh5eHn5+LkFBDlQJf8zC/EIi4iKiUtI8koJ\nScsgyf5nlpWTV1BUUlZRVVPX4NFk1UJIyghp6+jq6RsYGhmbKJgK85mZW8Dk/rNaSlhZ29ja\n2Ts4Ojkr6Li4urFDNf53N/Ow8vTy9vH18w8IDAoWDQkNC4+ASP5ni4wKio6JjYtPSExKTnFW\nSE1LF4A69n9GZlZ2Tm5efkFhUXFySWlZlEd5RSVY7j+TkGRVdU1tXX1DY1Ozcktpa1t7h2Yn\nOAj+d7l1tyo79vT29SdNSJ44SbFVdHIo9xSIHNPUaWqTpifNSJrZnK00S0U1a/acUG5piNz/\nuXLzVJ2qm6dXz584S2WB1cJFi5cshZr539xVftnyFKUVTi2TVjqvyhJLXb1m7TqoHPt6F/HW\n0g0bN63crGqVtWXrtu07BJihcsw71+zanRW8Z89eq337RQ/Ip60xO3gIElX/LbikDm8T36Kw\nbNmRo7O3zpHkPSZwHBqL//8flz1x2OOkyKJTi7aqbzutfUZI2gIuF8F2lr/D5dw2+fZdwpl8\nYVOlI+CJ4/9/joOyYed5QzMvhGqnm2V0WiClm///D0lfXHtJ6vLlK9w7rx7vQk5SQJbFtSms\n1y9evXid7QZacgOxmSxktNzdtSwwU+J/VICaCPFIYU3XAJhIOtjf5sfyAAAAJXRFWHRDb21t\nZW50AGNsaXAyZ2lmIHYuMC42IGJ5IFl2ZXMgUGlndWV0NnM7vAAAAABJRU5ErkJggg==",
    							"header": {
    								"content-type": [
    									"image/png"
    								],
    								"content-id": [
    									"<part2.39235FC5.E71D8178@example.com>"
    								],
    								"content-transfer-encoding": [
    									"base64"
    								],
    								"content-disposition": [
    									"inline; filename=\"C:\\TEMP\\nsmail39.png\""
    								]
    							}
    						}
    					],
    					"header": {
    						"content-type": [
    							"multipart/related;  boundary=\"------------C02FA3D0A04E95F295FB25EB\""
    						]
    					}
    				}
    			],
    			"header": {
    				"content-type": [
    					"multipart/alternative;  boundary=\"------------F03F94BA73D3B9E8C1B94D92\""
    				]
    			}
    		},
    		{
    			"rawHeader": "\nContent-Type: image/png;\n name=\"redball.png\"\nContent-Transfer-Encoding: base64\nContent-Disposition: inline;\n filename=\"redball.png\"",
    			"body": "iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAADAFBMVEX///8AAAABAAALAAAV\nAAAaAAAXAAARAAAKAAADAAAcAAAyAABEAABNAABIAAA9AAAjAAAWAAAmAABhAAB7AACGAACH\nAAB9AAB0AABgAAA5AAAUAAAGAAAnAABLAABvAACQAAClAAC7AAC/AACrAAChAACMAABzAABb\nAAAuAAAIAABMAAB3AACZAAC0GRnKODjVPT3bKSndBQW4AACoAAB5AAAxAAAYAAAEAABFAACa\nAAC7JCTRYWHfhITmf3/mVlbqHx/SAAC5AACjAABdAABCAAAoAAAJAABnAAC6Dw/QVFTek5Pl\nrKzpmZntZWXvJSXXAADBAACxAACcAABtAABTAAA2AAAbAAAFAABKAACBAADLICDdZ2fonJzr\npqbtiorvUVHvFBTRAADDAAC2AAB4AABeAABAAAAiAABXAACSAADCAADaGxvoVVXseHjveHjv\nV1fvJibhAADOAAC3AACnAACVAABHAAArAAAPAACdAADFAADhBQXrKCjvPDzvNTXvGxvjAADQ\nAADJAAC1AACXAACEAABsAABPAAASAAACAABiAADpAADvAgLnAADYAADLAAC6AACwAABwAAAT\nAAAkAABYAADIAADTAADNAACzAACDAABuAAAeAAB+AADAAACkAACNAAB/AABpAABQAAAwAACR\nAACpAAC8AACqAACbAABlAABJAAAqAAAOAAA0AACsAACvAACtAACmAACJAAB6AABrAABaAAA+\nAAApAABqAACCAACfAACeAACWAACPAAB8AAAZAAAHAABVAACOAACKAAA4AAAQAAA/AAByAACA\nAABcAAA3AAAsAABmAABDAABWAAAgAAAzAAA8AAA6AAAfAAAMAAAdAAANAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8\nLtlFAAAAAXRSTlMAQObYZgAAABZ0RVh0U29mdHdhcmUAZ2lmMnBuZyAyLjAuMT1evmgAAAII\nSURBVHicY2CAg/8QwIABmJhZWFnZ2Dk4MaU5uLh5eHn5+LkFBDlQJf8zC/EIi4iKiUtI8koJ\nScsgyf5nlpWTV1BUUlZRVVPX4NFk1UJIyghp6+jq6RsYGhmbKJgK85mZW8Dk/rNaSlhZ29ja\n2Ts4Ojkr6Li4urFDNf53N/Ow8vTy9vH18w8IDAoWDQkNC4+ASP5ni4wKio6JjYtPSExKTnFW\nSE1LF4A69n9GZlZ2Tm5efkFhUXFySWlZlEd5RSVY7j+TkGRVdU1tXX1DY1Ozcktpa1t7h2Yn\nOAj+d7l1tyo79vT29SdNSJ44SbFVdHIo9xSIHNPUaWqTpifNSJrZnK00S0U1a/acUG5piNz/\nuXLzVJ2qm6dXz584S2WB1cJFi5cshZr539xVftnyFKUVTi2TVjqvyhJLXb1m7TqoHPt6F/HW\n0g0bN63crGqVtWXrtu07BJihcsw71+zanRW8Z89eq337RQ/Ip60xO3gIElX/LbikDm8T36Kw\nbNmRo7O3zpHkPSZwHBqL//8flz1x2OOkyKJTi7aqbzutfUZI2gIuF8F2lr/D5dw2+fZdwpl8\nYVOlI+CJ4/9/joOyYed5QzMvhGqnm2V0WiClm///D0lfXHtJ6vLlK9w7rx7vQk5SQJbFtSms\n1y9evXid7QZacgOxmSxktNzdtSwwU+J/VICaCPFIYU3XAJhIOtjf5sfyAAAAJXRFWHRDb21t\nZW50AGNsaXAyZ2lmIHYuMC42IGJ5IFl2ZXMgUGlndWV0NnM7vAAAAABJRU5ErkJggg==",
    			"header": {
    				"content-type": [
    					"image/png;  name=\"redball.png\""
    				],
    				"content-transfer-encoding": [
    					"base64"
    				],
    				"content-disposition": [
    					"inline;  filename=\"redball.png\""
    				]
    			}
    		},
    		{
    			"rawHeader": "\nContent-Type: image/png;\n name=\"greenball.png\"\nContent-Transfer-Encoding: base64\nContent-Disposition: inline;\n filename=\"greenball.png\"",
    			"body": "iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAADAFBMVEX///8AAAAAEAAAGAAA\nIQAACAAAMQAAQgAAUgAAWgAASgAIYwAIcwAIewAQjAAIawAAOQAAYwAQlAAQnAAhpQAQpQAh\nrQBCvRhjxjFjxjlSxiEpzgAYvQAQrQAYrQAhvQCU1mOt1nuE1lJK3hgh1gAYxgAYtQAAKQBC\nzhDO55Te563G55SU52NS5yEh3gAYzgBS3iGc52vW75y974yE71JC7xCt73ul3nNa7ykh5wAY\n1gAx5wBS7yFr7zlK7xgp5wAp7wAx7wAIhAAQtQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAp\n1fnZAAAAAXRSTlMAQObYZgAAABZ0RVh0U29mdHdhcmUAZ2lmMnBuZyAyLjAuMT1evmgAAAFt\nSURBVHicddJtV8IgFAdwD2zIgMEE1+NcqdsoK+m5tCyz7/+ZiLmHsyzvq53zO/cy+N9ery1b\nVe9PWQA9z4MQ+H8Yoj7GASZ95IHfaBGmLOSchyIgyOu22mgQSjUcDuNYcoGjLiLK1cHh0fHJ\naTKKOcMItgYxT89OzsfjyTTLC8UF0c2ZNmKquJhczq6ub+YmSVUYRF59GeDastu7+9nD41Nm\nkiJ2jc2J3kAWZ9Pr55fH18XSmRuKUTXUaqHy7O19tfr4NFle/w3YDrWRUIlZrL/W86XJkyJV\nG9EaEjIx2XyZmZJGioeUaL+2AY8TY8omR6nkLKhu70zjUKVJXsp3quS2DVSJWNh3zzJKCyex\nI0ZxBP3afE0ElyqOlZJyw8r3BE2SFiJCyxA434SCkg65RhdeQBljQtCg39LWrA90RDDG1EWr\nYUO23hMANUKRRl61E529cR++D2G5LK002dr/qrcfu9u0V3bxn/XdhR/NYeeN0ggsLAAAACV0\nRVh0Q29tbWVudABjbGlwMmdpZiB2LjAuNiBieSBZdmVzIFBpZ3VldDZzO7wAAAAASUVORK5C\nYII=",
    			"header": {
    				"content-type": [
    					"image/png;  name=\"greenball.png\""
    				],
    				"content-transfer-encoding": [
    					"base64"
    				],
    				"content-disposition": [
    					"inline;  filename=\"greenball.png\""
    				]
    			}
    		}
    	],
    	"header": {
    		"message-id": [
    			"<39235FC5.276CCE00@example.com>"
    		],
    		"date": [
    			"Wed, 17 May 2000 23:13:09 -0400"
    		],
    		"from": [
    			"Doug Sauder <dwsauder@example.com>"
    		],
    		"x-mailer": [
    			"Mozilla 4.7 [en] (WinNT; I)"
    		],
    		"x-accept-language": [
    			"en"
    		],
    		"mime-version": [
    			"1.0"
    		],
    		"to": [
    			"Heinz Müller <mueller@example.com>"
    		],
    		"subject": [
    			"Die Hasen und die Frösche (Netscape Messenger 4.7)"
    		],
    		"content-type": [
    			"multipart/mixed;  boundary=\"------------A1E83A41894D3755390B838A\""
    		]
    	}
    }
    */

    /**
     * Simple function to add a common file extention based on mime type string.
     *
     * @param {string} mimetype
     * @returns {string}
     */
    static getFileExt(mimetype) {
        switch (mimetype) {
            case "text/plain":
                return ".txt";
            case "text/html":
                return ".htm";
            case "application/rtf":
                return ".rtf";
        }
        return ".bin";
    }

    /**
     * Walks a MIME document and returns an array of Mime data.
     *
     * @param {string} mimeObj
     * @returns {object[]}
     */
    static _walkMime(mimeObj) {
        mimeObj = Mime._splitParseHead(mimeObj);
        const contType = Mime._decodeComplexField(mimeObj, "content-type");
        const boundary = Mime._decodeComplexField(mimeObj, "content-type", "boundary");
        if (contType && contType.startsWith("multipart/")) {
            if (!boundary) {
                throw new OperationError("Invalid mulitpart section no boundary");
            }
            const sections = [];
            //const mimeParts = Mime._splitMultipart(mimeObj.body, boundary);
            Mime._splitMultipart(mimeObj.body, boundary).forEach((mimePart) => {
                sections.push(Mime._walkMime(mimePart));
            }, sections);
            mimeObj.body = sections;
        }
        return mimeObj
    }

/**
    static parsestuff() {
    let contType = "text/plain",
        fileName = null,
        charEnc = null,
        contDispoObj = null,
        contTypeObj = null;
    if (parentObj.header.hasOwnProperty("content-type")) {
        contTypeObj = Mime._decodeComplexField(parentObj.header["content-type"][0]);
    }
    if (parentObj.header.hasOwnProperty("content-disposition")) {
        contDispoObj = Mime._decodeComplexField(parentObj.header["content-disposition"][0]);
        if (contDispoObj != null && contDispoObj.hasOwnProperty("filename")) {
            fileName = contDispoObj.filename;
        }
    }
    if (contTypeObj != null) {
        if (contTypeObj.hasOwnProperty("value")) {
            contType = contTypeObj.value[0];
        }
        if (contTypeObj.hasOwnProperty("charset")) {
            charEnc = contTypeObj.charset;
        } else {
            if (contType.startsWith("text/")) {
                charEnc = "us-ascii";
            }
        }
        if (fileName == null && contTypeObj.hasOwnProperty("name")) {
            fileName = contTypeObj.name;
        }
    }
    if (mimeObj) {
        this._walkMime(mimeObj).forEach(part => sections.push(part));
    }
    if (parentObj.header.hasOwnProperty("content-transfer-encoding")) {
        const contEncObj = Mime._decodeComplexField(parentObj.header["content-transfer-encoding"][0]);
        if (contEncObj != null && contEncObj.hasOwnProperty("value")) {
            parentObj.body = Mime._decodeMimeData(parentObj.body, charEnc, contEncObj.value[0]);
        }
    }
    return [{type: contType, data: parentObj.body, name: fileName}];
}
*/

    /**
     * Takes a string and decodes quoted words inside them
     * These take the form of:
     * input "=?utf-8?Q?Hello_World!?="
     * output "Hello World!"
     *
     * @param {string} input
     * @param {string} type
     * @returns {string}
     */
    static replaceEncodedWord(input) {
        return input.replace(/=\?([^?]+)\?(Q|B)\?([^?]+)\?=/g, function (a, charEnc, contEnc, input) {
            contEnc = (contEnc === "B") ? "base64" : "quoted-printable";
            if (contEnc === "quoted-printable") {
                input = input.replace(/_/g, " ");
            }
            return Utils.byteArrayToUtf8(Mime._decodeMimeData(input, charEnc, contEnc));
        });
    }


    /**
     * Breaks the header from the body and parses the header. The returns an
     * object or null. The object contains the raw header, decoded body, and
     * parsed header object.
     *
     * @param {string} input
     * @returns {object}
     */
    static _splitParseHead(input) {
        const emlRegex = /(?:\r?\n){2}/g;
        const matchObj = emlRegex.exec(input);
        if (matchObj) {
            const splitEmail = [input.substring(0, matchObj.index), input.substring(emlRegex.lastIndex)];
            const sectionRegex = /([A-Za-z-]+):\s+([\x00-\xff]+?)(?=$|\r?\n\S)/g;
            const headerObj = {};
            let section;
            while ((section = sectionRegex.exec(splitEmail[0]))) {
                const fieldName = section[1].toLowerCase();
                const fieldValue = Mime.replaceEncodedWord(section[2].replace(/\n|\r/g, " "));
                if (fieldName in headerObj) {
                    headerObj[fieldName].push(fieldValue);
                } else {
                    headerObj[fieldName] = [fieldValue];
                }
            }
            return {rawHeader: splitEmail[0], body: splitEmail[1], header: headerObj};
        }
        return null;
    }

    /**
     * Return decoded MIME data given the character encoding and content encoding.
     *
     * @param {string} input
     * @param {string} charEnc
     * @param {string} contEnc
     * @returns {string}
     */
    static _decodeMimeData(input, charEnc, contEnc) {
        switch (contEnc) {
            case "base64":
                input = Utils.convertToByteArray(input, "base64");
                break;
            case "quoted-printable":
                input = decodeQuotedPrintable(input);
        }
        if (charEnc && MIME_FORMAT.hasOwnProperty(charEnc.toLowerCase())) {
            input = Utils.strToByteArray(cptable.utils.decode(MIME_FORMAT[charEnc.toLowerCase()], input));

        }
        return input;
    }

    /**
     * Parses a complex header field and returns an object that contains
     * normalized keys with corresponding values along with single values under
     * a value array.
     *
     * @param {string} field
     * @returns {string}
     */
    static _decodeComplexField(mimeObj, field, subfield="value") {
        if (mimeObj.header.hasOwnProperty(field)) {
            const fieldSplit = mimeObj.header[field][0].split(/;\s+/g);
            for (let i = 0; i < fieldSplit.length; i++) {
                const eq = fieldSplit[i].indexOf("=");
                if (eq >= 0) {
                    if (fieldSplit[i].length > eq) {
                        const kv = [fieldSplit[i].substring(0, eq), fieldSplit[i].substring(eq + 1).trim()];
                        if ((kv[1].startsWith("'") && kv[1].endsWith("'")) || (kv[1].startsWith("\"") && kv[1].endsWith("\""))) {
                            kv[1] = (/(['"])(.+)\1/.exec(kv[1]))[2];
                        }
                        if (subfield.toLowerCase() === kv[0].toLowerCase()) {
                            return kv[1];
                        }
                    } else {
                        throw OperationError("Not a valid header entry");
                    }
                } else if (subfield == "value"){
                    return fieldSplit[i].trim().toLowerCase();
                }
            }
        }
        return null;
    }

    /**
     * Splits a Mime document by the current boundaries and attempts to account
     * for the current new line size which can be either the standard \r\n or \n.
     *
     * @param {string} input
     * @param {string} boundary
     * @return {string[]}
     */
    static _splitMultipart(input, boundary) {
        const output = [];
        const newline = input.indexOf("\r") >= 0 ? "\r\n" : "\n";
        const boundaryStr = newline.concat("--", boundary);
        const last = input.indexOf(newline.concat("--", boundary, "--"));
        for (;;) {
            let start = input.indexOf(boundaryStr, start);
            if (start < 0) {
                break;
            }
            start += boundaryStr.length;
            const end = input.indexOf(boundaryStr, start);
            if (end <= start) {
                break;
            }
            output.push(input.substring(start, end));
            if (end === last) {
                break;
            }
            start = end;
        }
        return output;
    }
}

export default Mime;
