"use server"
import generativeModel from "@/lib/gemini";
import dbConnect from "@/lib/mongodb";
import userModel from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import coverLetterModel from "@/models/coverLetter.model";
export async function generateCoverLetter(data: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    let user;
    try {
        await dbConnect();
        user = await userModel.findOne({
            clerkUserId: userId
        })
        if (!user) throw new Error("user not found");
    } catch (error) {
        console.log('error during the getting a user :', error);
        return null;
    }
    const prompt = `
      Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName
        }.
      
      About the candidate:
      - Industry: ${user.industry}
      - Years of Experience: ${user.experience}
      - Skills: ${user.skills?.join(", ")}
      - Professional Background: ${user.bio}
      
      Job Description:
      ${data.jobDescription}
      
      Requirements:
      1. Use a professional, enthusiastic tone
      2. Highlight relevant skills and experience
      3. Show understanding of the company's needs
      4. Keep it concise (max 400 words)
      5. Use proper business letter formatting in markdown
      6. Include specific examples of achievements
      7. Relate candidate's background to job requirements
      
      Format the letter in markdown.
    `;
    try {
        const response = await generativeModel(prompt);
        let content = response?.trim()
        // .replace(/```markdown/g, "").replace(/```/g, "").trim();
        
        // create a conver letter 
        const createLetter = await coverLetterModel.create({
            content,
            userId: user._id,
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            status: "completed"
        })
        return JSON.parse(JSON.stringify(createLetter));
    } catch (error) {
        console.log('error during the getting a cover letter :', error);
        return null;

    }
}

export const deleteCoverLetter = async (id: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    let user;
    try {
        await dbConnect();
        user = await userModel.findOne({
            clerkUserId: userId
        })
        if (!user) throw new Error("user not found");
    } catch (error) {
        console.log('error during the getting a user :', error);
        return null;
    }
    try {
        await coverLetterModel.findByIdAndDelete(id);
        return true;
    } catch (error) {
        console.log('error during the deleting a cover letter :', error);
        return null;
    }
}

export const getCoverLetter = async (id: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    let user;
    try {
        await dbConnect();
        user = await userModel.findOne({
            clerkUserId: userId
        })
        if (!user) throw new Error("user not found");
    } catch (error) {
        console.log('error during the getting a user :', error);
        return null;
    }
    try {
        const coverLetter = await coverLetterModel.findById(id);
        return JSON.parse(JSON.stringify(coverLetter));
    } catch (error) {
        console.log('error during the getting a cover letter :', error);
        return null;
    }
}


export const getCoverLetters = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    let user;
    try {
        await dbConnect();
        user = await userModel.findOne({
            clerkUserId: userId
        })
        if (!user) throw new Error("user not found");
    } catch (error) {
        console.log('error during the getting a user :', error);
        return null;
    }
    try {
        const coverLetters = await coverLetterModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(coverLetters));
    } catch (error) {
        console.log('error during the getting a cover letters :', error);
        return null;
    }
}