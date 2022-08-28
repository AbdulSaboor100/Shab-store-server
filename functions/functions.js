import bcrypt from "bcrypt";
import validator from "validator";

const hashPassword = async (password) => {
  let salts = 10;
  let resultHash = await bcrypt.hash(password, salts);
  return resultHash;
};

const comparePassword = async (hashPass, password) => {
  let resultBool = bcrypt.compare(password, hashPass);
  return resultBool;
};

const isEmail = (email) => {
  let result = validator.isEmail(email);
  return result;
};

const isEmpty = (value) => {
  if (value) {
    let result = validator.isEmpty(value, { ignore_whitespace: false });
    return result;
  } else {
    return true;
  }
};

const isLength = (value) => {
  let result = validator.isLength(value, { min: 0, max: 5 });
  return result;
};

export { hashPassword, comparePassword, isEmail, isEmpty, isLength };
