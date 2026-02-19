import { model, models, Schema, Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  image?: string;
  preferences: {
    correctionIntensity: "minimal" | "moderate" | "aggressive";
    taglishMode: boolean;
    preferredTone?: "casual" | "polite" | "playful" | "coach";
    wallpaper: string;
  }
}

export interface IUserDoc extends IUser, Document {}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    preferences: {
      correctionIntensity: { type: String, enum: ["minimal", "moderate", "aggressive"], default: "moderate" },
      taglishMode: { type: Boolean, default: false },
      preferredTone: { type: String, enum: ["casual", "polite", "playful", "coach"], default: "casual" },
      wallpaper: { type: String, default: "" }
    }
  }
)

const User = models.User || model<IUser>("User", UserSchema);

export default User;