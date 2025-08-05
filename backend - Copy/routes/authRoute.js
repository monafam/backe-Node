const express = require("express");
const {
  singeupValidator,
  loginValidator,
  
} = require("../utils/validators/autheValidator ");

const { singup, login, forgetPassword ,verifyPassResetCode} = require("../services/autheService");

const router = express.Router();
router.post("/singup", singeupValidator, singup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgetPassword);
router.post("/verifyResetCode", verifyPassResetCode);

module.exports = router;
