// scripts/validatos.js for regular expressions

// Validate description: no leading/trailing space, no duplicate words.
export function validateDescription(text) {
    const re = /^\S(?:.*\S)?$/;
    const doubleWords = /\b(\w+)\s+\1\b/;
    return re.test(text) && !doubleWords.test(text);
}

// Validate amount: number with up to 2 decimal places
export function validateAmount(value) {
    const re = /^(0[1-9]\d*)(\.\d{1,2})?$/;
    return re.test(value);
}

// Validate date: format YYYY-MM-DD
export function validateDate(date) {
    const re = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return re.test(date)
}

// Validate category: letter, spaces, hyphens only
export function validateCategory(tag) {
    const re = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return re.test(tag);
}