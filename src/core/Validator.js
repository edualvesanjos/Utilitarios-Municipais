export default class Validator {
  required(value) {
    if (value === null || value === undefined) return false;
    return typeof value === 'string' ? value.trim().length > 0 : true;
  }
  minLength(value, minimum) {
    return String(value ?? '').length >= minimum;
  }
  maxLength(value, maximum) {
    return String(value ?? '').length <= maximum;
  }
  exactDigits(value, length) {
    return String(value ?? '').replace(/\D/g, '').length === length;
  }
  numeric(value) {
    return /^-?\d+(?:[.,]\d+)?$/.test(String(value ?? '').trim());
  }
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
  }
  validate(value, rules = []) {
    const errors = [];
    for (const rule of rules) if (!rule.test(value)) errors.push(rule.message);
    return { valid: errors.length === 0, errors };
  }
}
