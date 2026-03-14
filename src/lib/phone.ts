export const TANZANIA_PHONE_PREFIX = '+255';
export const TANZANIA_PHONE_FORMAT = '+255 XXX XXX XXX';
const TANZANIA_COUNTRY_CODE = '255';
const TANZANIA_LOCAL_NUMBER_LENGTH = 9;

const formatPhoneGroups = (digits: string) => digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();

export const isAllowedTanzaniaPhoneInput = (value: string) => {
  const rawValue = value.trim();
  const digits = rawValue.replace(/\D/g, '');

  if (!digits) {
    return true;
  }

  if (rawValue.startsWith('+')) {
    return TANZANIA_COUNTRY_CODE.startsWith(digits) || digits.startsWith(TANZANIA_COUNTRY_CODE);
  }

  if (digits.length <= TANZANIA_LOCAL_NUMBER_LENGTH) {
    return true;
  }

  return digits.startsWith('0') || digits.startsWith(TANZANIA_COUNTRY_CODE);
};

export const extractTanzaniaPhoneLocalPart = (value: string) => {
  const rawValue = value.trim();
  let digits = rawValue.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (rawValue.startsWith('+')) {
    if (!digits.startsWith(TANZANIA_COUNTRY_CODE)) {
      return '';
    }
    digits = digits.slice(TANZANIA_COUNTRY_CODE.length);
  } else if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  while (digits.length > TANZANIA_LOCAL_NUMBER_LENGTH && digits.startsWith(TANZANIA_COUNTRY_CODE)) {
    digits = digits.slice(TANZANIA_COUNTRY_CODE.length);
  }

  return digits.slice(0, TANZANIA_LOCAL_NUMBER_LENGTH);
};

export const formatTanzaniaPhoneLocalPart = (value: string) => {
  const localPart = extractTanzaniaPhoneLocalPart(value);
  return formatPhoneGroups(localPart);
};

export const isValidTanzaniaPhone = (value: string) => {
  const localPart = extractTanzaniaPhoneLocalPart(value);
  return localPart.length === TANZANIA_LOCAL_NUMBER_LENGTH;
};

export const normalizeTanzaniaPhone = (value: string) => {
  const localPart = extractTanzaniaPhoneLocalPart(value);

  if (localPart.length !== TANZANIA_LOCAL_NUMBER_LENGTH) {
    return '';
  }

  return `${TANZANIA_PHONE_PREFIX}${localPart}`;
};
