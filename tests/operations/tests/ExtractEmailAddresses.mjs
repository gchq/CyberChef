/**
 * extract email address tests.
 *
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "Extract email address",
        input: "email@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com email@example.name\nemail@example.museum email@example.co.jp firstname-lastname@example.com",
        expectedOutput: "email@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com\nemail@example.name\nemail@example.museum\nemail@example.co.jp\nfirstname-lastname@example.com\n",
        recipeConfig: [
            {
                "op": "Extract email addresses",
                "args": [false]
            },
        ],
    },
    {
        name: "Extract email address - Display total",
        input: "email@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com email@example.name\nemail@example.museum email@example.co.jp firstname-lastname@example.com",
        expectedOutput: "Total found: 11\n\nemail@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com\nemail@example.name\nemail@example.museum\nemail@example.co.jp\nfirstname-lastname@example.com\n",
        recipeConfig: [
            {
                "op": "Extract email addresses",
                "args": [true]
            },
        ],
    },
    {
        name: "Extract email address (Internationalized)",
        input: "\u4f0a\u662d\u5091@\u90f5\u4ef6.\u5546\u52d9 \u093e\u092e@\u092e\u094b\u0939\u0928.\u0908\u0928\u094d\u092b\u094b\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c \u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc Jos\u1ec5Silv\u1ec5@googl\u1ec5.com\nJos\u1ec5Silv\u1ec5@google.com and Jos\u1ec5Silva@google.com\nFoO@BaR.CoM, john@192.168.10.100\ng\xf3mez@junk.br and Abc.123@example.com.\nuser+mailbox/department=shipping@example.com\n\u7528\u6237@\u4f8b\u5b50.\u5e7f\u544a\n\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e@\u0909\u0926\u093e\u0939\u0930\u0923.\u0915\u0949\u092e\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c\n\u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc\nD\xf6rte@S\xf6rensen.example.com\n\u0430\u0434\u0436\u0430\u0439@\u044d\u043a\u0437\u0430\u043c\u043f\u043b.\u0440\u0443\u0441\ntest@xn--bcher-kva.com",
        expectedOutput: "\u4f0a\u662d\u5091@\u90f5\u4ef6.\u5546\u52d9\n\u093e\u092e@\u092e\u094b\u0939\u0928.\u0908\u0928\u094d\u092b\u094b\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c\n\u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc\nJos\u1ec5Silv\u1ec5@googl\u1ec5.com\nJos\u1ec5Silv\u1ec5@google.com\nJos\u1ec5Silva@google.com\nFoO@BaR.CoM\njohn@192.168.10.100\ng\xf3mez@junk.br\nAbc.123@example.com\nuser+mailbox/department=shipping@example.com\n\u7528\u6237@\u4f8b\u5b50.\u5e7f\u544a\n\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e@\u0909\u0926\u093e\u0939\u0930\u0923.\u0915\u0949\u092e\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c\n\u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc\nD\xf6rte@S\xf6rensen.example.com\n\u0430\u0434\u0436\u0430\u0439@\u044d\u043a\u0437\u0430\u043c\u043f\u043b.\u0440\u0443\u0441\ntest@xn--bcher-kva.com\n",
        recipeConfig: [
            {
                "op": "Extract email addresses",
                "args": [false]
            },
        ],
    },
    {
        name: "Extract email address - Display total (Internationalized)",
        input: "\u4f0a\u662d\u5091@\u90f5\u4ef6.\u5546\u52d9 \u093e\u092e@\u092e\u094b\u0939\u0928.\u0908\u0928\u094d\u092b\u094b\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c \u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc Jos\u1ec5Silv\u1ec5@googl\u1ec5.com\nJos\u1ec5Silv\u1ec5@google.com and Jos\u1ec5Silva@google.com\nFoO@BaR.CoM, john@192.168.10.100\ng\xf3mez@junk.br and Abc.123@example.com.\nuser+mailbox/department=shipping@example.com\n\u7528\u6237@\u4f8b\u5b50.\u5e7f\u544a\n\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e@\u0909\u0926\u093e\u0939\u0930\u0923.\u0915\u0949\u092e\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c\n\u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc\nD\xf6rte@S\xf6rensen.example.com\n\u0430\u0434\u0436\u0430\u0439@\u044d\u043a\u0437\u0430\u043c\u043f\u043b.\u0440\u0443\u0441\ntest@xn--bcher-kva.com",
        expectedOutput: "Total found: 19\n\n\u4f0a\u662d\u5091@\u90f5\u4ef6.\u5546\u52d9\n\u093e\u092e@\u092e\u094b\u0939\u0928.\u0908\u0928\u094d\u092b\u094b\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c\n\u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc\nJos\u1ec5Silv\u1ec5@googl\u1ec5.com\nJos\u1ec5Silv\u1ec5@google.com\nJos\u1ec5Silva@google.com\nFoO@BaR.CoM\njohn@192.168.10.100\ng\xf3mez@junk.br\nAbc.123@example.com\nuser+mailbox/department=shipping@example.com\n\u7528\u6237@\u4f8b\u5b50.\u5e7f\u544a\n\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e@\u0909\u0926\u093e\u0939\u0930\u0923.\u0915\u0949\u092e\n\u044e\u0437\u0435\u0440@\u0435\u043a\u0437\u0430\u043c\u043f\u043b.\u043a\u043e\u043c\n\u03b8\u03c3\u03b5\u03c1@\u03b5\u03c7\u03b1\u03bc\u03c0\u03bb\u03b5.\u03c8\u03bf\u03bc\nD\xf6rte@S\xf6rensen.example.com\n\u0430\u0434\u0436\u0430\u0439@\u044d\u043a\u0437\u0430\u043c\u043f\u043b.\u0440\u0443\u0441\ntest@xn--bcher-kva.com\n",
        recipeConfig: [
            {
                "op": "Extract email addresses",
                "args": [true]
            },
        ],
    },
]);
