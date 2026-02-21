/**
 * Deobfuscate tests
 *
 * @author dolphinau [me@dawl.fr]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Deobfuscate: Powershell empty deobfuscation",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Deobfuscate",
                args: ["Powershell"],
            },
        ],
    },
    {
        name: "Deobfuscate: Powershell deobfuscation",
        input: "${Pop-pKkAp}=1;${Clear-OK3Emf}=4;${Push-Jh8ps}=9;${Format-qqM9C}=16;${Redo-kSQuo}=86;${Format-LyC}=51;${Pop-ASPJ}=74;${Join-pIuV}=112;${Hide-Rhpet}=100;${Copy-TWaj}=71;${Set-yYE}=85;${Exit-shq}=116;${Skip-5qa}=83;${Push-bAik}=57;${Split-f7hDr6}=122;${Open-YGi}=65;${Open-LPQk}=61;${Select-YUyq}=84;${Move-sS6mJ}=87;${Search-wa0}=108;${Join-YJq}=117;${Hide-iQ5}=88;${Select-iV0F7}=78;${Select-cI9j}=80;${Open-Hec}=98;${Reset-4QePz}=109;${Format-4e7UHy}=103;${Lock-UyaF}=97;${Select-ZGdxB}=77;${Move-FtkTLt}=104;${Push-VUUQsE}=73;${Add-LHgggw}=99;${Reset-sc3}=81;${Format-AlmdYS}=50;${Resize-mYqZ}=121;${Reset-hp9}=66;${Reset-qC3Yd}=48;${Find-6QywvV}=120;${Select-v7sja}=110;${Step-7WvUL}=82;$DJ2=[System.Text.Encoding];$1Ro=[System.Convert];${Step-xE2}=-join'8FTU'[-${Pop-pKkAp}..-${Clear-OK3Emf}];${Unlock-Zdbkvh}=-join'gnirtSteG'[-${Pop-pKkAp}..-${Push-Jh8ps}];${Close-yjy}=-join'gnirtS46esaBmorF'[-${Pop-pKkAp}..-${Format-qqM9C}];. ($DJ2::${Step-xE2}.${Unlock-Zdbkvh}($1Ro::${Close-yjy}(([char]${Redo-kSQuo}+[char]${Format-LyC}+[char]${Pop-ASPJ}+[char]${Join-pIuV}+[char]${Hide-Rhpet}+[char]${Copy-TWaj}+[char]${Set-yYE}+[char]${Exit-shq}+[char]${Skip-5qa}+[char]${Copy-TWaj}+[char]${Push-bAik}+[char]${Split-f7hDr6}+[char]${Hide-Rhpet}+[char]${Open-YGi}+[char]${Open-LPQk}+[char]${Open-LPQk})))) ($DJ2::${Step-xE2}.${Unlock-Zdbkvh}($1Ro::${Close-yjy}(([char]${Select-YUyq}+[char]${Move-sS6mJ}+[char]${Search-wa0}+[char]${Join-YJq}+[char]${Hide-Rhpet}+[char]${Hide-iQ5}+[char]${Select-iV0F7}+[char]${Select-cI9j}+[char]${Open-Hec}+[char]${Reset-4QePz}+[char]${Set-yYE}+[char]${Format-4e7UHy}+[char]${Lock-UyaF}+[char]${Hide-iQ5}+[char]${Select-ZGdxB}+[char]${Format-4e7UHy}+[char]${Hide-Rhpet}+[char]${Copy-TWaj}+[char]${Move-FtkTLt}+[char]${Search-wa0}+[char]${Push-VUUQsE}+[char]${Copy-TWaj}+[char]${Pop-ASPJ}+[char]${Search-wa0}+[char]${Add-LHgggw}+[char]${Format-LyC}+[char]${Reset-sc3}+[char]${Format-4e7UHy}+[char]${Add-LHgggw}+[char]${Format-AlmdYS}+[char]${Select-iV0F7}+[char]${Resize-mYqZ}+[char]${Lock-UyaF}+[char]${Hide-iQ5}+[char]${Reset-hp9}+[char]${Reset-qC3Yd}+[char]${Push-VUUQsE}+[char]${Copy-TWaj}+[char]${Find-6QywvV}+[char]${Join-pIuV}+[char]${Open-Hec}+[char]${Select-v7sja}+[char]${Step-7WvUL}+[char]${Search-wa0}+[char]${Add-LHgggw}+[char]${Format-4e7UHy}+[char]${Open-LPQk}+[char]${Open-LPQk}))))",
        expectedOutput: '\n& "write-host" "MinusOne is the best script linter"',
        recipeConfig: [
            {
                op: "Deobfuscate",
                args: ["Powershell"],
            },
        ],
    },
]);
