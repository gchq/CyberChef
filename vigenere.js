function cleanText(text) {
    const textNoSpaces = text.replace(/ /g, "");
    if (/[^A-Za-z0-9]/.test(textNoSpaces)) {
        throw new Error("Special characters detected. They must be removed.");
    }
    return textNoSpaces;
}

function encrypt(message, key) {
    message = message.toLowerCase();
    key = key.toLowerCase();
    const combinedAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const n = combinedAlphabet.length;
    const encrypted = [];
    let keyIndex = 0;

    try {
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
    } catch (e) {
        throw new Error("Encryption error: " + e.message);
    }
}

function decrypt(cipherText, key) {
    cipherText = cipherText.toLowerCase();
    key = key.toLowerCase();
    const combinedAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const n = combinedAlphabet.length;
    const decrypted = [];
    let keyIndex = 0;

    try {
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
    } catch (e) {
        throw new Error("Decryption error: " + e.message);
    }
}

function main() {
    try {
        const rawMessage = prompt("Enter the message: ");
        const rawKey = prompt("Enter the key: ");
        try {
            const cleanedMessage = cleanText(rawMessage);
            const cleanedKey = cleanText(rawKey);
            if (!cleanedMessage) {
                throw new Error("Message is empty after cleaning!");
            }
            if (!cleanedKey) {
                throw new Error("Key is empty after cleaning!");
            }
            const encryptedMsg = encrypt(cleanedMessage, cleanedKey);
            console.log("\nEncrypted Message:");
            console.log(encryptedMsg);
            const decryptedMsg = decrypt(encryptedMsg, cleanedKey);
            console.log("\nDecrypted Message:");
            console.log(decryptedMsg);
        } catch (ve) {
            console.log("Input error:", ve.message);
            return;
        }
    } catch (e) {
        console.log("An error occurred:", e.message);
    }
}

main();

