/**
 * @author h345983745 []
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import jpath from "jsonpath";
import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * HTTPS Over DNS operation
 */
class HTTPSOverDNS extends Operation {

    /**
     * HTTPSOverDNS constructor
     */
    constructor() {
        super();

        this.name = "DNS over HTTPS";
        this.module = "Code";
        this.description = ["Takes a single domain name and performs a DNS lookup using DNS vver HTTPS.",
        "<br><br>",
        "By default, <a href='https://developers.cloudflare.com/1.1.1.1/dns-over-https/'>Cloudflare</a> and <a href='https://developers.google.com/speed/public-dns/docs/dns-over-https'>Google</a> DNS over HTTPS services are supported.",
        "<br><br>",
        "Can be used with any service that supports the GET paramaters <code>name</code> and <code>type</code>."].join('\n');
        this.infoURL = "https://en.wikipedia.org/wiki/DNS_over_HTTPS";
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
                    "TXT",
                    "MX"
                ]
            },
            {
                name: "Show Just Answer Data",
                type: "boolean",
                value: false
            },
            {
                name: "Validate DNSSEC",
                type: "boolean",
                value: true
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
        try{
            var url = new URL(resolver);
        } catch (error) {
            throw new OperationError(error.toString() + 
            "\n\nThis error could be caused by one of the following:\n" +
            " - An invalid Resolver URL\n" )
        }
        var params = {name:input, type:requestType, cd:DNSSEC};
        url.search = new URLSearchParams(params)

        
        return fetch(url, {headers:{'accept': 'application/dns-json'}}).then(response => {return response.json()})
        .then(data => {
            if(justAnswer){
                return jpath.query(data, "$.Answer[*].data")
            }
            return data;

        }).catch(e => {throw new OperationError("Error making request to :" + url + e.toString())})

    }

}

export default HTTPSOverDNS;
