export const TANZANIA_PHONE_PREFIX = '+255';
const TANZANIA_COUNTRY_CODE = '255';
const TANZANIA_LOCAL_NUMBER_LENGTH = 9;

export const extractTanzaniaPhoneLocalPart = (value: string) => {
  const rawValue = value.trim();
  let digits = rawValue.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (rawValue.startsWith('+')) {
    while (digits.startsWith(TANZANIA_COUNTRY_CODE)) {
      digits = digits.slice(TANZANIA_COUNTRY_CODE.length);
    }

    return digits;
  }

  digits = digits.replace(/^0+/, '');

  while (digits.length > TANZANIA_LOCAL_NUMBER_LENGTH && digits.startsWith(TANZANIA_COUNTRY_CODE)) {
    digits = digits.slice(TANZANIA_COUNTRY_CODE.length);
  }

  return digits;
};

export const normalizeTanzaniaPhone = (value: string) => {
  const localPart = extractTanzaniaPhoneLocalPart(value);

  if (!localPart) {
    return '';
  }

  return `${TANZANIA_PHONE_PREFIX}${localPart}`;
};
