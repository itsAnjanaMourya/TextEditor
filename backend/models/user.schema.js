import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleDriveFolderId: { type: String },
});

export default mongoose.model('User', userSchema);