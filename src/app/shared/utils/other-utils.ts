export function isNullOrWhiteSpace(input: string | null | undefined): boolean {
    return !input || input.trim().length === 0;
}

export function getDateTimeUtcNow(): Date {
    var date = new Date();

    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
}

export function convertToVersionScore(version?: string): bigint {
    if (!version) {
        return 281474976710656n;
    }

    const parts = version.split('-')[0].split('.').map(BigInt);

    while (parts.length < 4) {
        parts.push(0n);
    }

    const [major, minor, build, revision] = parts.map(p => p > 65535n ? 65535n : p);

    return (BigInt(major) << 48n) |
        (BigInt(minor) << 32n) |
        (BigInt(build) << 16n) |
        BigInt(revision);
}
