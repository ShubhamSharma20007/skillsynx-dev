import { QuestionInterface } from "./questionInterface"

export interface QuizResultInterface{
_id:String;
quizScore:Number
questions:QuestionInterface[];
category:String;
improvementTip:String;
userId:String;
createdAt:String| Date;
updatedAt:String | Date;
}