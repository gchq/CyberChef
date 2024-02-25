/**
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * DNS over HTTPS operation
 */
class DNSOverHTTPS extends Operation {

    /**
     * DNSOverHTTPS constructor
     */
    constructor() {
        super();

        this.name = "DNS over HTTPS";
        this.module = "Default";
        this.description = [
            "Takes one or more FQDN(s) that are seperated by newlines, and performs a DNS lookup using DNS over HTTPS.",
            "<br><br>",
            "By default, <a href='https://developers.cloudflare.com/1.1.1.1/dns-over-https/'>Cloudflare</a> and <a href='https://developers.google.com/speed/public-dns/docs/dns-over-https'>Google</a> DNS over HTTPS services are supported.",
            "<br><br>",
            "Can be used with any service that supports the GET parameters <code>name</code> and <code>type</code>."
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/DNS_over_HTTPS";
        this.inputType = "string";
        this.outputType = "JSON";
        this.manualBake = true;
        this.args = [
            {
                name: "Resolver",
                type: "editableOption",
                value: [
                    {
                        name: "Google",
                        value: "https://dns.google.com/resolve"
                    },
                    {
                        name: "Cloudflare",
                        value: "https://cloudflare-dns.com/dns-query"
                    }
                ]
            },
            {
                name: "Request Type",
                type: "option",
                value: [
                    "A",
                    "AAAA",
                    "ANAME",
                    "CERT",
                    "CNAME",
                    "DNSKEY",
                    "HTTPS",
                    "IPSECKEY",
                    "LOC",
                    "MX",
                    "NS",
                    "OPENPGPKEY",
                    "PTR",
                    "RRSIG",
                    "SIG",
                    "SOA",
                    "SPF",
                    "SRV",
                    "SSHFP",
                    "TA",
                    "TXT",
                    "URI",
                    "ANY"
                ]
            },
            {
                name: "Answer Data Only",
                type: "boolean",
                value: false
            },
            {
                name: "Disable DNSSEC validation",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const [resolver, requestType, justAnswer, DNSSEC] = args;
        let url = URL;
        try {
            url = new URL(resolver);
        } catch (error) {
            throw new OperationError(error.toString() +
                "\n\nThis error could be caused by one of the following:\n" +
                " - An invalid Resolver URL\n");
        }

        let fqdns = processInput(input);

        let fqdnPromises = [];

        for (let index = 0; index < fqdns.length; index++) {

            const params = { name: fqdns[index], type: requestType, cd: DNSSEC };
            url.search = new URLSearchParams(params);

            let fqdnPromise = fetch(url, { headers: { "accept": "application/dns-json" } }).then(response => {
                return response.json();
            }).then(data => {
                if (justAnswer) {
                    if (data.Answer) {
                        return extractData(data.Answer);
                    } else {
                        if(data.Question.length > 0){
                            let r = {};
                            r[data.Question[0].name] = null;
                            return r;
                        } else {
                            return null;
                        }
                    }
                } else {
                    return data;
                }
            }).catch(e => {
                return `Error making request to ${url}\n${e.toString()}`;
            });

            fqdnPromises.push(fqdnPromise);
        }

        return Promise.all(fqdnPromises);
    }
}

/**
 * Construct an array of just data from a DNS Answer section
 *
 * @private
 * @param {JSON} data
 * @returns {JSON}
 */
function extractData(data) {
    if (typeof (data) == "undefined") {
        return [];
    } else {
        let dataValues = {};
        data.forEach(element => {
            if (!(element.name in dataValues)) {
                dataValues[element.name] = [];
            }

            if (!(element.data in dataValues[element.name])) {
                dataValues[element.name].push(element.data);
            }
        });
        return dataValues;
    }
}

/**
 * Process and clean input data
 *
 * @private
 * @param {string} input
 * @returns {Array[string]} list of fqdns
 */
function processInput(input) {
    let fqdns = [];
    let fqdnRegex = /[A-Za-z0-9\.]*/;

    input.split('\n').forEach((fqdn, index) => {
        let m = fqdn.match(fqdnRegex);
        if (m.length > 0) {
            if (m[0] !== '') {
                fqdns.push(m[0]);
            }
        }
    });
    return fqdns;
}

export default DNSOverHTTPS;
