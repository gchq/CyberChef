/**
 * Modhex operation tests.
 * @author linuxgemini [ilteris@asenkron.com.tr]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "ASCII to Modhex stream",
        input: "aberystwyth",
        expectedOutput: "hbhdhgidikieifiiikifhj",
        recipeConfig: [
            {
                "op": "To Modhex",
                "args": [
                    "None",
                    0
                ]
            },
        ]
    },
    {
        name: "ASCII to Modhex with colon deliminator",
        input: "aberystwyth",
        expectedOutput: "hb:hd:hg:id:ik:ie:if:ii:ik:if:hj",
        recipeConfig: [
            {
                "op": "To Modhex",
                "args": [
                    "Colon",
                    0
                ]
            }
        ]
    },
    {
        name: "Modhex stream to UTF-8",
        input: "uhkgkbuhkgkbugltlkugltkc",
        expectedOutput: "救救孩子",
        recipeConfig: [
            {
                "op": "From Modhex",
                "args": [
                    "Auto"
                ]
            }
        ]

    },
    {
        name: "Mixed case Modhex stream to UTF-8",
        input: "uhKGkbUHkgkBUGltlkugltkc",
        expectedOutput: "救救孩子",
        recipeConfig: [
            {
                "op": "From Modhex",
                "args": [
                    "Auto"
                ]
            }
        ]

    },
    {
        name: "Mutiline Modhex with comma to ASCII (Auto Mode)",
        input: "fk,dc,ie,hb,ii,dc,ht,ik,ie,hg,hr,hh,dc,ie,hk,\n\
if,if,hk,hu,hi,dc,hk,hu,dc,if,hj,hg,dc,he,id,\n\
hv,if,he,hj,dc,hv,hh,dc,if,hj,hg,dc,if,hj,hk,\n\
ie,dc,hh,hk,hi,dc,if,id,hg,hg,dr,dc,ie,if,hb,\n\
id,ih,hk,hu,hi,dc,if,hv,dc,hf,hg,hb,if,hj,dr,\n\
dc,hl,ig,ie,if,dc,hd,hg,he,hb,ig,ie,hg,dc,fk,\n\
dc,he,hv,ig,hr,hf,hu,di,if,dc,ht,hb,hn,hg,dc,\n\
ig,ic,dc,ht,ik,dc,ht,hk,hu,hf,dc,ii,hj,hk,he,\n\
hj,dc,hv,hh,dc,if,hj,hg,dc,hh,hk,hi,ie,dc,fk,\n\
dc,ii,hv,ig,hr,hf,dc,he,hj,hv,hv,ie,hg,du",
        expectedOutput: "I saw myself sitting in the crotch of the this fig tree, starving to death, just because I couldn't make up my mind which of the figs I would choose.",
        recipeConfig: [
            {
                "op": "From Modhex",
                "args": [
                    "Auto"
                ]
            }
        ]

    },
    {
        name: "Mutiline Modhex with percent to ASCII (Percent Mode)",
        input: "fk%dc%ie%hb%ii%dc%ht%ik%ie%hg%hr%hh%dc%ie%hk%\n\
if%if%hk%hu%hi%dc%hk%hu%dc%if%hj%hg%dc%he%id%\n\
hv%if%he%hj%dc%hv%hh%dc%if%hj%hg%dc%if%hj%hk%\n\
ie%dc%hh%hk%hi%dc%if%id%hg%hg%dr%dc%ie%if%hb%\n\
id%ih%hk%hu%hi%dc%if%hv%dc%hf%hg%hb%if%hj%dr%\n\
dc%hl%ig%ie%if%dc%hd%hg%he%hb%ig%ie%hg%dc%fk%\n\
dc%he%hv%ig%hr%hf%hu%di%if%dc%ht%hb%hn%hg%dc%\n\
ig%ic%dc%ht%ik%dc%ht%hk%hu%hf%dc%ii%hj%hk%he%\n\
hj%dc%hv%hh%dc%if%hj%hg%dc%hh%hk%hi%ie%dc%fk%\n\
dc%ii%hv%ig%hr%hf%dc%he%hj%hv%hv%ie%hg%du",
        expectedOutput: "I saw myself sitting in the crotch of the this fig tree, starving to death, just because I couldn't make up my mind which of the figs I would choose.",
        recipeConfig: [
            {
                "op": "From Modhex",
                "args": [
                    "Percent"
                ]
            }
        ]

    },
    {
        name: "Mutiline Modhex with semicolon to ASCII (Semi-colon Mode)",
        input: "fk;dc;ie;hb;ii;dc;ht;ik;ie;hg;hr;hh;dc;ie;hk;\n\
if;if;hk;hu;hi;dc;hk;hu;dc;if;hj;hg;dc;he;id;\n\
hv;if;he;hj;dc;hv;hh;dc;if;hj;hg;dc;if;hj;hk;\n\
ie;dc;hh;hk;hi;dc;if;id;hg;hg;dr;dc;ie;if;hb;\n\
id;ih;hk;hu;hi;dc;if;hv;dc;hf;hg;hb;if;hj;dr;\n\
dc;hl;ig;ie;if;dc;hd;hg;he;hb;ig;ie;hg;dc;fk;\n\
dc;he;hv;ig;hr;hf;hu;di;if;dc;ht;hb;hn;hg;dc;\n\
ig;ic;dc;ht;ik;dc;ht;hk;hu;hf;dc;ii;hj;hk;he;\n\
hj;dc;hv;hh;dc;if;hj;hg;dc;hh;hk;hi;ie;dc;fk;\n\
dc;ii;hv;ig;hr;hf;dc;he;hj;hv;hv;ie;hg;du",
        expectedOutput: "I saw myself sitting in the crotch of the this fig tree, starving to death, just because I couldn't make up my mind which of the figs I would choose.",
        recipeConfig: [
            {
                "op": "From Modhex",
                "args": [
                    "Semi-colon"
                ]
            }
        ]

    },
    {
        name: "ASCII to Modhex with comma and line breaks",
        input: "aberystwyth",
        expectedOutput: "hb,hd,hg,id,\nik,ie,if,ii,\nik,if,hj",
        recipeConfig: [
            {
                "op": "To Modhex",
                "args": [
                    "Comma",
                    4
                ]
            }
        ]
    },
]);
