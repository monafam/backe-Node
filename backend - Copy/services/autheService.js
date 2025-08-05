const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const createToken =require('../utils/createToken')

// const createToken = (payload) =>
//   jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
//     expiresIn: process.env.JWT_EXPIRE_TIME,
//   });
// @desc    SingUP
// @route   POST  /api/v1/auth/singup/
// @access  Public
exports.singup = asyncHandler(async (req, res, next) => {
  // 1 careat user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  //2) Generate   token
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

// @desc    login
// @route   POST  /api/v1/auth/login/
// @access  Public

exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if password and email in the body (validation)

  //2- check if user exist & check if password ix=s corruct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrent email or password", 401));
  }
  //3- generate token
  const token = createToken(user._id);

  //4 send response to clint side
  res.status(201).json({ data: user, token });
});

// @desc    Make sure the user is logged in

exports.protect = asyncHandler(async (req, res, next) => {
  //1)- check if token exist, if exist get into
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login .Pleas login to get access this router ",
        401
      )
    );
  }
  //2)- verify token (no change happens ,expired token),
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3)- check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "the user that belong to this token dose no longer exist ",
        401
      )
    );
  }
  //4)- check if user change password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimesTamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // Password changed after token created (Error)
    if (passwordChangedTimesTamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently  change his password please logain agin....",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

//@ desc  Authorazation (user permisstions )
//['admin,'manager']
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route ", 403)
      );
    }
    next();
    // 1 - access roles

    // 2- access registered user(req.user.role)
  });

// @desc    Forget Password
// @route   POST  /api/v1/auth/forgotPassword/
// @access  Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  //1)-  Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with that email ${req.body.email} `, 404)
    );
  }

  //2)- If user exist, Genetate hash  reset randome 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hasheResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  //save hashed password reset code into db
  user.passwordResetCode = hasheResetCode;
  // ade  expiration time for reset code 3 min
  user.passwordResetExpires = Date.now() + 10 * 60 * 100;
  user.passwordResetVerifide = false;
  await user.save();
  //3)- Send the reset code vis email
  const meassage = `Hi ${user.name},\n we received  a request  to rest the password on youre Ebn Haian Account.\n ${resetCode}\n Enter this code to compleat the reset.\n Thanks for helping us keep your account secure.\n The Ebn Haian Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password rsest code(Valid for 3 min",
      meassage: meassage,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerifide = undefined;
    await user.save();
    return next(new ApiError("ther is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "Success", meassage: "Reset code send to email" });
});
console.log(sendEmail);

// @desc    Verify Password Reset Code
// @route   POST  /api/v1/auth/verifyResetCode/
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  //1) Get user based on reset code
  const hasheResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hasheResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset Invaled or Expired"));
  }

  // reset code valed
  user.passwordResetVerifide = true;
  await user.save();
  res.status(200).json({ status: "Saccess" });
});
