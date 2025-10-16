export const patterns = {
  description: /^\S(?:.*\S)?$/,
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  duplicateWord: /\b(\w+)\s+\1\b/ // advanced regex
};

export function validate(id, value) {
  const re = patterns[id];
  const valid = re.test(value.trim());
  const msg = document.getElementById(`${id}-error`);
  if (msg) msg.textContent = valid ? "" : "Invalid";
  return valid;
}
