"use server"

import { QuestionInterface } from "@/interface/questionInterface";
import generativeModel from "@/lib/gemini";
import dbConnect from "@/lib/mongodb";
import userModel from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import assesmentModel from "@/models/assessment.model";
import { CustomInterviewFormData } from "@/interface/customInterviewInterface";
import { boolean } from "zod";
export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("id not found");
  await dbConnect();
  const user = await userModel.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("Industry not found");

  try {

    const prompt = `
  Generate 10 technical interview questions for a ${user.industry
      } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
      }.
  
  Each question should be multiple choice with 4 options.
  
  Return the response in this JSON format only, no additional text:
  {
    "questions": [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "string",
        "explanation": "string"
      }
    ]
  }
`;

    const response = await generativeModel(prompt);
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim(); // cleaing the /``` ```/json
    return JSON.parse(cleanedText as string);
  } catch (error) {
    console.log(error);
    throw new Error("Error generating quiz");
  }
}

export default async function saveQuizResult(questions: QuestionInterface[], answers: string, score: number,
  isCustomInt: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("id not found");
  await dbConnect();
  const user = await userModel.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");

  const questionsResult = questions.map((question, index) => ({
    question: question.question,
    answer: question.correctAnswer || '',
    questionExplanation: question.explanation || "",
    userAnswer: answers[index],
    isCorrect: answers[index] === question.correctAnswer,
  }));



  let improvementTip = "";
  const wrongAnswers = questionsResult.filter((question) => !question.isCorrect)
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers.map((q) => `Question: ${q.question}\n Correct Answer: ${q.answer}\n User Answer: ${q.userAnswer}}`).join("\n\n")

    const improvementPrompt = `
        The user got the following ${user.industry} technical interview questions wrong:
  
        ${wrongQuestionsText}
  
        Based on these mistakes, provide a concise, specific improvement tip.
        Focus on the knowledge gaps revealed by these wrong answers.
        Keep the response under 2 sentences and make it encouraging.
        Don't explicitly mention the mistakes, instead focus on what to learn/practice.
      `;


    try {
      const improvement = await generativeModel(improvementPrompt);
      if (improvement) {
        improvementTip = improvement.trim();
      }
    } catch (error) {
      console.error("Error generating improvement tip:", error);

    }
  }

  try {
    const storeQuesiton = await assesmentModel.create({
      quizScore: score,
      questions: questionsResult,
      category: 'Technical',
      improvementTip,
      userId: user._id,
      isCustomInterview: isCustomInt
    })

    return JSON.parse(JSON.stringify(storeQuesiton))

  } catch (error) {
    console.error("Error generating improvement tip:", error);
    return;

  }

}



export async function getAssesments() {
  const { userId } = await auth();
  if (!userId) throw new Error("id not found");
  await dbConnect();
  const user = await userModel.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");
  try {
    const findAssesments = await assesmentModel.find({ userId: user._id }).lean();
    return JSON.parse(JSON.stringify(findAssesments));
  } catch (error) {
    console.error("Error generating improvement tip:", error);
    return;
  }

}


// export  async function generateCustomQuiz(customQuizData:CustomInterviewFormData){
//   const { userId } = await auth();  
//   if (!userId) throw new Error("id not found");
//   await dbConnect();
//   const user = await userModel.findOne({ clerkUserId: userId });
//   if (!user) throw new Error("User not found");
// try {

// const prompt = `
// Generate  technical interview questions for a ${
//   `${customQuizData.industry.toLowerCase()}-${customQuizData.subIndustry.toLowerCase().split(" ").join("-")}`
// } professional${
// user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
// }.

// INSTRUCTIONS:
//     - number of  question should be ${customQuizData.questionCount} with multiple choice with 4
//       options.
//     - Each question should be unique to prevoius one.
//     - User will be provide the question language as ${customQuizData.language}.
//     - User will be provided the question difficultyLevel as ${customQuizData.difficultyLevel}.it 
//       will be one of the following: \`\`\`beginner, intermediate, advanced \`\`\` and also provide the experience lavel will be one of the following: \`\`\`fresher, mid-level, senior \`\`\`.
//     - ${customQuizData.isTimer} ? Add a timer to the quiz with a duration of ${customQuizData.
//       timerValue?.replace(/ minutes/g,'' )} minutes. : No timer.


// Return the response in this JSON format only, no additional text:
// {
//   "timer": "${customQuizData.isTimer === true ? true : false}",
//   "duration": "${customQuizData.timerValue}" 
//   "totalNumberOfQuestions": "${customQuizData.questionCount}",
//   "language": "${customQuizData.language}",
//   "difficultyLevel": "${customQuizData.difficultyLevel}",
//   "experienceLevel": "${customQuizData.experienceLevel}",
//   "questions": [
//     {
//       "question": "string",
//       "options": ["string", "string", "string", "string"],
//       "correctAnswer": "string",
//       "explanation": "string"
//     }
//   ]
// }
// `;

// const response = await generativeModel(prompt);
// const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
// return JSON.parse(cleanedText as string)?.questions;
// } catch (error) {
// console.log(error);
// throw new Error("Error generating quiz");
// }
// }


export async function generateCustomQuiz(customQuizData: CustomInterviewFormData) {
  console.log(customQuizData)

  const { userId } = await auth();
  if (!userId) throw new Error("id not found");
  await dbConnect();
  const user = await userModel.findOne({ clerkUserId: userId });
  if (!user) throw new Error("User not found");
  try {
    const industryTag = `${customQuizData.industry.toLowerCase()}-${customQuizData.subIndustry.toLowerCase().split(" ").join("-")}`;
    const skills = customQuizData.skills?.length ? ` with expertise in ${customQuizData.skills?.join(", ")}` : "";
    const hasTimer = customQuizData.isTimer === true;
    const timerValue = customQuizData.timerValue?.replace(/ minutes/g, "");
    // 
//     const prompt = `
// Generate ${customQuizData.questionCount} challenging ${customQuizData.difficultyLevel}-level interview questions for ${customQuizData.experienceLevel} ${industryTag} professionals${skills ? ` with ${skills} expertise` : ''}.

// Requirements:
// - Each question must have **4 unique options**, **1 correct answer**, and an **explanation**.
// - Make sure **all options are similar in length** to avoid giving away the correct answer.
// - The content must be provided language in **${customQuizData.language}**.
// - The difficulty level must be **${customQuizData.difficultyLevel}** (one of: beginner, intermediate, advanced).
// - The questions should match the experience level of a **${customQuizData.experienceLevel}** candidate (one of: fresher, mid-level, senior).
// ${hasTimer ? `- Include a quiz timer of ${timerValue} minutes.` : "- Do not include a timer."}

// Return the data in **pure JSON format**, exactly as shown below. Do not include any additional text, comments, or markdown syntax:

// {
//   "industry":"${industryTag}",
//   "timer": "${hasTimer}",
//   "duration": "${customQuizData.timerValue}",
//   "totalNumberOfQuestions":"${customQuizData.questionCount}",
//   "language": "${customQuizData.language}",
//   "difficultyLevel": "${customQuizData.difficultyLevel}",
//   "experienceLevel": "${customQuizData.experienceLevel}",
//   "questions": [
//     {
//       "question": "string",
//       "options": ["string", "string", "string", "string"],
//       "correctAnswer": "string",
//       "explanation": "string"
//     }
//   ]
// }
// `;
const prompt = `
Generate ${customQuizData.questionCount} challenging ${customQuizData.difficultyLevel}-level interview questions for ${customQuizData.experienceLevel} ${industryTag} professionals${skills ? ` with ${skills} expertise` : ''}.

Requirements:
- Each question must have **4 unique options** (labeled A, B, C, D), **1 correct answer**, and an **explanation**.
- CRITICALLY IMPORTANT: All 4 options MUST be approximately the same length (character count). The correct answer should NOT be longer or more detailed than the other options.
- Make wrong options plausible and similarly detailed to the correct option.
- Each option should be concise but complete - aim for 10-20 words per option.
- The content must be provided in **${customQuizData.language}**.
- The difficulty level must be **${customQuizData.difficultyLevel}** (one of: beginner, intermediate, advanced).
- The questions should match the experience level of a **${customQuizData.experienceLevel}** candidate (one of: fresher, mid-level, senior).
${hasTimer ? `- Include a quiz timer of ${timerValue} minutes.` : "- Do not include a timer."}

Return the data in **pure JSON format**, exactly as shown below. Do not include any additional text, comments, or markdown syntax:

{
  "industry":"${industryTag}",
  "timer": "${hasTimer}",
  "duration": "${customQuizData.timerValue}",
  "totalNumberOfQuestions":"${customQuizData.questionCount}",
  "language": "${customQuizData.language}",
  "difficultyLevel": "${customQuizData.difficultyLevel}",
  "experienceLevel": "${customQuizData.experienceLevel}",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string", 
      "explanation": "string"
    }
  ]
}
`;
    const response = await generativeModel(prompt);
    let cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
try {
  return JSON.parse(cleanedText as string);
} catch (e) {
  console.log("Initial JSON parsing failed, attempting to fix JSON format");
  try {
    cleanedText = cleanedText!.replace(/,\s*]/g, ']');
    cleanedText = cleanedText?.replace(/,\s*}/g, '}');
    return JSON.parse(cleanedText as string);
  } catch (jsonError) {
    console.error("JSON parsing error:", jsonError);
    console.error("Problematic JSON string:", cleanedText);
    throw new Error("Error generating quiz: Invalid JSON format returned");
  }
}
  } catch (error) {
    console.error(error);
    throw new Error("Error generating quiz");
  }
}
