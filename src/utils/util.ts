/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

export const getNameFromEmail = (email: string): string => {
  return email.split('@')[0];
};

export const generateRandomFileName = (extname: string): string => {
  const fileName = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return fileName + extname;
};
