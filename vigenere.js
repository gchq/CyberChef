/**
 * Cleans the input text by removing spaces and ensuring it contains only alphanumeric characters.
 * @param {string} text - The input text to be cleaned.
 * @returns {string} The cleaned text without spaces or special characters.
 * @throws Will throw an error if special characters are found.
 */
function cleanText(text) {
    const textNoSpaces = text.replace(/ /g, "");
    if (/[^A-Za-z0-9]/.test(textNoSpaces)) {
        throw new Error("Special characters detected. They must be removed.");
    }
    return textNoSpaces;
}

/**
 * Encrypts a message using a key with a substitution cipher.
 * @param {string} message - The message to encrypt.
 * @param {string} key - The encryption key.
 * @returns {string} The encrypted message.
 */
function encrypt(message, key) {
    message = message.toLowerCase();
    key = key.toLowerCase();
    const combinedAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const n = combinedAlphabet.length;
    const encrypted = [];
    let keyIndex = 0;

    for (const char of message) {
        if (combinedAlphabet.includes(char)) {
            const mIndex = combinedAlphabet.indexOf(char);
            const keyChar = key[keyIndex % key.length];
            const shift = combinedAlphabet.indexOf(keyChar);
            const newIndex = (mIndex + shift) % n;
            encrypted.push(combinedAlphabet[newIndex]);
            keyIndex++;
        }
    }
    return encrypted.join("");
}

/**
 * Decrypts an encrypted message using a key with a substitution cipher.
 * @param {string} cipherText - The encrypted message to decrypt.
 * @param {string} key - The decryption key.
 * @returns {string} The decrypted message.
 */
function decrypt(cipherText, key) {
    cipherText = cipherText.toLowerCase();
    key = key.toLowerCase();
    const combinedAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const n = combinedAlphabet.length;
    const decrypted = [];
    let keyIndex = 0;

    for (const char of cipherText) {
        if (combinedAlphabet.includes(char)) {
            const cIndex = combinedAlphabet.indexOf(char);
            const keyChar = key[keyIndex % key.length];
            const shift = combinedAlphabet.indexOf(keyChar);
            const originalIndex = (cIndex - shift + n) % n;
            decrypted.push(combinedAlphabet[originalIndex]);
            keyIndex++;
        }
    }
    return decrypted.join("");
}

/**
 * The main function to clean, encrypt, and decrypt messages.
 */
function main() {
    try {
        const rawMessage = prompt("Enter the message: ");
        const rawKey = prompt("Enter the key: ");
        const cleanedMessage = cleanText(rawMessage);
        const cleanedKey = cleanText(rawKey);
        
        if (!cleanedMessage) throw new Error("Message is empty after cleaning!");
        if (!cleanedKey) throw new Error("Key is empty after cleaning!");

        const encryptedMsg = encrypt(cleanedMessage, cleanedKey);
        alert(`Encrypted Message: ${encryptedMsg}`);
        const decryptedMsg = decrypt(encryptedMsg, cleanedKey);
        alert(`Decrypted Message: ${decryptedMsg}`);
    } catch (e) {
        alert(`An error occurred: ${e.message}`);
    }
}

main();
