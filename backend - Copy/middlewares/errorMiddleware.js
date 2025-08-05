const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handleJwtInvaledSignature = () =>
  new ApiError("Invaled token,Please Login agine.....", 401);
const handleJwtExpired =()=>new ApiError("Expired token,Please Login agine.....", 401);
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError")err= handleJwtInvaledSignature();
    if (err.name === "TokenExpiredError")err= handleJwtExpired();


    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
