const mongoose = require("mongoose");

const bcrybt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email required"],
      unique: true,
      lowercase: true,
    },
    phone: Number,
    profileImg: String,
    password: {
      type: String,
      required: [true, "Password required"],
      minlength: [6, "too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode:String,
    passwordResetExpires:Date,
    passwordResetVerifide:Boolean,
    role: {
      type: String,
      enum: ["user", 'manager',"admin"],
      default: "user",
    },
    activ: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //hashing user password
  this.password = await bcrybt.hash(this.password, 12);
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
