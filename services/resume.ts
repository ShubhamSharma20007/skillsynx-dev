"use server"
import userModel from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import resumeModel from "@/models/resume.model"
import generativeModel from "@/lib/gemini";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
export async function saveResume(content: string) {
    await dbConnect()
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    const user = await userModel.findOne({
        clerkUserId: userId
    })
    if (!user) throw new Error("user not found");

    try {
        const resumeRecord = await resumeModel.findOneAndUpdate(
            {
                userId: user._id,
            },
            {
                $set: {
                    content,
                    userId:new mongoose.Types.ObjectId(user._id)
                }
            },
            {new:true,upsert:true} // upsert use to create a new document if it doesn't exist
        );

     

        return JSON.parse(JSON.stringify(resumeRecord));
    } catch (error) {
        console.log('error during the creating and updating a resume :', error);
        return null;
    }

}

export async function getResume() {
    await dbConnect()
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    const user = await userModel.findOne({
        clerkUserId: userId
    })
    if (!user) throw new Error("user not found")
    try {
        const resumeRecord = await resumeModel.findOne({
            userId: user._id,
        }); 
      
        return resumeRecord;
    } catch (error) {
        console.log('error during the getting a resume :', error);
        return null;
    }
}



export async function inhancePrompt({ string, type }: { string: string, type: string }) {

    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    const user = await userModel.findOne({
        clerkUserId: userId
    })
    if (!user) throw new Error("user not found");
    
    const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${string}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;


  try {
    await dbConnect()
    const response = await generativeModel(prompt);
    return response?.trim();

  } catch (error) {
    throw new Error("Error generating AI prompt");
  }

}