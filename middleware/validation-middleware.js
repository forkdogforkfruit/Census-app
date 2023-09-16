const validator = require("./validate");

const participant = async (req, res, next) => {
  const validationRule = {
    email: "required|string|email",
    firstName: "required|string",
    lastName: "required|string",
    dob: "required|date",
    active: "boolean",
    companyname: "string",
    salary: "integer",
    currency: "integer",
  };

  await validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  }).catch((err) => console.log(err));
};
module.exports = {
  participant,
};
