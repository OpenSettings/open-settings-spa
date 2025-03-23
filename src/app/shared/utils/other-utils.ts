export function isNullOrWhiteSpace(input: string | null | undefined): boolean {
    return !input || input.trim().length === 0;
}

export function getDateTimeUtcNow(): Date {
    var date = new Date();

    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
}