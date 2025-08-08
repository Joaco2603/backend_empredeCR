import { Schema, model } from "mongoose";

//Schema
let UserSchema = new Schema(
  {
    name: {
      type: String,
      require: [true, "Name must be provided"],
    },
    email: {
      type: String,
      required: [true, "Email must be provided"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password must be provided"],
    },
    img: {
      type: String,
    },
    rol: {
      type: String,
      required: true,
      emun: ["ADMIN_ROLE", "CITIZEN_ROLE", "ENTREPRENEUR_ROLE"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false },
);

//Model

UserSchema.methods.toJSON = () => {
  const { __v, password, ...usuario } = this.toObject();
  return usuario;
};

export default model("Users", UserSchema);

