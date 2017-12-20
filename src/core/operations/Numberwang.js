/**
 * Numberwang operations.
 *
 * @author Unknown Male 282
 * @namespace
 */
const Numberwang = {

    /**
     * Numberwang operation. Remain indoors.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run: function(input, args) {
        let output;
        if (!input) {
            output = "Let's play Wangernumb!";
        } else {
            const match = input.match(/(f0rty-s1x|shinty-six|filth-hundred and neeb|-?√?\d+(\.\d+)?i?([a-z]?)%?)/i);
            if (match) {
                if (match[3]) output = match[0] + "! That's AlphaNumericWang!";
                else output = match[0] + "! That's Numberwang!";
            } else {
                // That's a bad miss!
                output = "Sorry, that's not Numberwang. Let's rotate the board!";
            }
        }

        const rand = Math.floor(Math.random() * Numberwang._didYouKnow.length);
        return output + "\n\nDid you know: " + Numberwang._didYouKnow[rand];
    },


    /**
     * Taken from http://numberwang.wikia.com/wiki/Numberwang_Wikia
     *
     * @private
     * @constant
     */
    _didYouKnow: [
        "Numberwang, contrary to popular belief, is a fruit and not a vegetable.",
        "Robert Webb once got WordWang while presenting an episode of Numberwang.",
        "The 6705th digit of pi is Numberwang.",
        "Numberwang was invented on a Sevenday.",
        "Contrary to popular belief, Albert Einstein always got good grades in Numberwang at school. He once scored ^4$ on a test.",
        "680 asteroids have been named after Numberwang.",
        "Archimedes is most famous for proclaiming \"That's Numberwang!\" during an epiphany about water displacement he had while taking a bath.",
        "Numberwang Day is celebrated in Japan on every day of the year apart from June 6.",
        "Biologists recently discovered Numberwang within a strand of human DNA.",
        "Numbernot is a special type of non-Numberwang number. It is divisible by 3 and the letter \"y\".",
        "Julie once got 612.04 Numberwangs in a single episode of Emmerdale.",
        "In India, it is traditional to shout out \"Numberwang!\" instead of checkmate during games of chess.",
        "There is a rule on Countdown which states that if you get Numberwang in the numbers round, you automatically win. It has only ever been invoked twice.",
        "\"Numberwang\" was the third-most common baby name for a brief period in 1722.",
        "\"The Lion King\" was loosely based on Numberwang.",
        "\"A Numberwang a day keeps the doctor away\" is how Donny Cosy, the oldest man in the world, explained how he was in such good health at the age of 136.",
        "The \"number lock\" button on a keyboard is based on the popular round of the same name in \"Numberwang\".",
        "Cambridge became the first university to offer a course in Numberwang in 1567.",
        "Schrödinger's Numberwang is a number that has been confusing dentists for centuries.",
        "\"Harry Potter and the Numberwang of Numberwang\" was rejected by publishers -41 times before it became a bestseller.",
        "\"Numberwang\" is the longest-running British game show in history; it has aired 226 seasons, each containing 19 episodes, which makes a grand total of 132 episodes.",
        "The triple Numberwang bonus was discovered by archaeologist Thomas Jefferson in Somerset.",
        "Numberwang is illegal in parts of Czechoslovakia.",
        "Numberwang was discovered in India in the 12th century.",
        "Numberwang has the chemical formula Zn4SO2(HgEs)3.",
        "The first pack of cards ever created featured two \"Numberwang\" cards instead of jokers.",
        "Julius Caesar was killed by an overdose of Numberwang.",
        "The most Numberwang musical note is G#.",
        "In 1934, the forty-third Google Doodle promoted the upcoming television show \"Numberwang on Ice\".",
        "A recent psychology study found that toddlers were 17% faster at identifying numbers which were Numberwang.",
        "There are 700 ways to commit a foul in the television show \"Numberwang\". All 700 of these fouls were committed by Julie in one single episode in 1473.",
        "Astronomers suspect God is Numberwang.",
        "Numberwang is the official beverage of Canada.",
        "In the pilot episode of \"The Price is Right\", if a contestant got the value of an item exactly right they were told \"That's Numberwang!\" and immediately won ₹5.7032.",
        "The first person to get three Numberwangs in a row was Madonna.",
        "\"Numberwang\" has the code U+46402 in Unicode.",
        "The musical note \"Numberwang\" is between D# and E♮.",
        "Numberwang was first played on the moon in 1834.",
    ],

};

export default Numberwang;
