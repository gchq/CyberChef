/**
 * From SHC tests.
 *
 * @author marx314 [shc_gchq@maubry.ca]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
*/

import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "From SHC generate a valid payload - https://spec.smarthealth.cards/examples/example-00-g-qr-code-0.svg",
        input: "shc:/5676290952432060346029243740446031222959532654603460292540772804336028702864716745222809286133314564376531415906402203064504590856435503414245413640370636654171372412363803043756220467374075323239254334433260573601064529355312367424324250386141547003645474640706331045282136072860542825105427697726093250225676655259316356503461275469226467100766377324775050503308771062272722220603303605756952660766226861633827043024066838764123257672116206447426227138617560582031575336767242635041383126644166696268442531360662320923586171121250327306267339703422210328126912354261621050632463101209293600406306445806532063392023630638036574455577123629535203100643075960247667074343454103300773274377565809580974292635034425330864000623563032087536276361602745763659562428054062116461320405212811272200694065743223742150627575092375063022055628332968367775070903583944691061662255030634332706503411304224104011225567732373452630424231113760046670645969647243613861436145774454503007082967612764723577582257642129686440556561717203753673713572622806274403756677501135734075734168403559076853695231723061435524402363621223403008600654742723724429704507112127437110062222297325296176257054126353532409312958427234374143715753230335102843684528356134750327287732554209723105103644452364076905355803103840252540667327670305590657213968733238772339535045443533006311067234303364554473016258627227424520202406236458553705005976557343442472214232334457607426612473586868254269402028434262110437672108247239395369110845362854715845203405243705290759637141296658",
        expectedOutput: `{
  "iss": "https://spec.smarthealth.cards/examples/issuer",
  "nbf": 1630616666.128,
  "vc": {
    "type": [
      "https://smarthealth.cards#health-card",
      "https://smarthealth.cards#immunization",
      "https://smarthealth.cards#covid19"
    ],
    "credentialSubject": {
      "fhirVersion": "4.0.1",
      "fhirBundle": {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
          {
            "fullUrl": "resource:0",
            "resource": {
              "resourceType": "Patient",
              "name": [
                {
                  "family": "Anyperson",
                  "given": [
                    "John",
                    "B."
                  ]
                }
              ],
              "birthDate": "1951-01-20"
            }
          },
          {
            "fullUrl": "resource:1",
            "resource": {
              "resourceType": "Immunization",
              "status": "completed",
              "vaccineCode": {
                "coding": [
                  {
                    "system": "http://hl7.org/fhir/sid/cvx",
                    "code": "207"
                  }
                ]
              },
              "patient": {
                "reference": "resource:0"
              },
              "occurrenceDateTime": "2021-01-01",
              "performer": [
                {
                  "actor": {
                    "display": "ABC General Hospital"
                  }
                }
              ],
              "lotNumber": "0000001"
            }
          },
          {
            "fullUrl": "resource:2",
            "resource": {
              "resourceType": "Immunization",
              "status": "completed",
              "vaccineCode": {
                "coding": [
                  {
                    "system": "http://hl7.org/fhir/sid/cvx",
                    "code": "207"
                  }
                ]
              },
              "patient": {
                "reference": "resource:0"
              },
              "occurrenceDateTime": "2021-01-29",
              "performer": [
                {
                  "actor": {
                    "display": "ABC General Hospital"
                  }
                }
              ],
              "lotNumber": "0000007"
            }
          }
        ]
      }
    }
  }
}`,
        recipeConfig: [
            {
                op: "From SHC",
                args: [false]
            }
        ],
    },
    {
        name: "From SHC empty",
        input: "",
        expectedOutput: "From SHC - Cannot read property '1' of null",
        recipeConfig: [
            {
                op: "From SHC",
                args: [false]
            }
        ],
    },
]);
