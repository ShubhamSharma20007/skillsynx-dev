import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: { type: String, required: true },
    atsScore:Number,
    feedback:String,
    
}, {
    timestamps: true,
    versionKey: false
})
export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
