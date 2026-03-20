const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userAuthSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true },
);

userAuthSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userAuthSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userAuthSchema);

module.exports = User;
