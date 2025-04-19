import mongoose from 'mongoose';

const CoverLetterSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content:String,
    jobDescription:String,
    companyName:String,
    jobTitle:String,
    status:String,
}, {
    timestamps: true,
    versionKey: false
})
export default mongoose.models.CoverLetter || mongoose.model('CoverLetter', CoverLetterSchema);
