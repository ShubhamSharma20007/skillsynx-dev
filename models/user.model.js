import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    clerkUserId:{
        type:String,
        ref:'User',
        required:true
    },
    email: String,
    name: String,
    imageUrl: String,
    industry: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Industry',
        required:true
    },
    bio: String,
    experience: String,
    skills:[String],
    threadId:String
}, {
    timestamps: true,
    versionKey: false
})
UserSchema.index({ clerkUserId: 1 }, { unique: true }); // Ensure clerkUserId is unique
//index for searching by email
export default mongoose.models?.User || mongoose.model('User', UserSchema);
