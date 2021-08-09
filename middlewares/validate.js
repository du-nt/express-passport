var ObjectId = require("mongoose").Types.ObjectId;

const validateRegisterInput = require("../validations/register");
const validateLoginInput = require("../validations/login");

const registerValidate = (req, res, next) => {
  const { isValid, errors } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(404).json(errors);
  }
  next();
};

const loginValidate = (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(404).json(errors);
  }
  next();
};

const verifyValidate = (req, res, next) => {
  const { userId } = req.params;
  const isValidId = ObjectId.isValid(userId);

  if (!isValidId) {
    return res
      .status(404)
      .json({ message: "Please provide a valid email and password." });
  }

  const { isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res
      .status(404)
      .json({ message: "Please provide a valid email and password." });
  }
  next();
};

module.exports = { registerValidate, loginValidate, verifyValidate };
