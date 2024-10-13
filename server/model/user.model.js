import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ['male', 'female', 'others'] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Renamed 'post' to 'posts' for consistency
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

// Create and export the User model
const User = mongoose.model("User", userSchema);
export default User;
