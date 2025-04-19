import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
    quizScore: Number,
    questions: [{
      question: String,
      answer: {
        type:String,
        required:true
      }, 
      userAnswer: String,
      isCorrect: Boolean,
      questionExplanation:{
        type:String,
        required:true
      },
      _id: mongoose.Schema.Types.ObjectId
    }],
    category: String,
    improvementTip: String,
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isCustomInterview:Boolean
}, {
    timestamps: true,
    versionKey: false
})
export default mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
