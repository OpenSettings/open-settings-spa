import * as crypto from 'crypto-js';

export function isValidGuid(guid: string): boolean {
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    return regex.test(guid);
}

function hexToNumberArray(hexString: string): number[] {
    const numbers = [];

    for (let i = 0; i < hexString.length; i += 2) {
        numbers.push(parseInt(hexString.slice(i, i + 2), 16));
    }

    return numbers;
}

function numberArrayToGuid(numberArray: number[]): string {
    // Convert to a 2-digit hexadecimal string and concatenate them
    const hex = numberArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Formatting hexadecimal to guid
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

export function computeIdentifier(input: string): string {
    if (isValidGuid(input)) {
        return input;
    }

    const hash = crypto.MD5(input).toString(crypto.enc.Hex);
    const byteArray = hexToNumberArray(hash);

    const reversedByteArray = [
        byteArray[3], byteArray[2], byteArray[1], byteArray[0],
        byteArray[5], byteArray[4],
        byteArray[7], byteArray[6],
        byteArray[8], byteArray[9],
        byteArray[10], byteArray[11], byteArray[12], byteArray[13], byteArray[14], byteArray[15]
    ];

    const uuid = numberArrayToGuid(reversedByteArray);

    return uuid;
}
