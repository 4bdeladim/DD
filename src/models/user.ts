import { model, Schema } from "mongoose";
import { IUser } from "../interface";


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        min: 8,
        max: 16
    },
    recoveryCode: {
        type: String,
        default: 0
    },

    recoveringEttempts: {
        type: Number,
        default: 3
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    messages: {
        type: Array,
        default: []
    }
});


const User = model<IUser>("User", userSchema);
export default User;