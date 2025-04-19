"use server"
import generativeModel from "@/lib/gemini";
import dbConnect from "@/lib/mongodb";
import industryInsightModel from "@/models/industryInsight.model";
import userModel from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";

 export const generateAIInsights = async (industry:string) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const response = await generativeModel(prompt);
  const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim(); // cleaing the /``` ```/json

  return JSON.parse(cleanedText as string);
};


export async function getIndustryInsights(){
  const { userId } = await auth(); 
  if(!userId) throw new Error("id not found");
  try {
    await dbConnect();
      const user = await userModel.findOne({
          clerkUserId:userId
      })

      if(!user) throw new Error("user not found");
      //   if (!user.industryInsights) {
      //     const insights = await generateAIInsights(user.industry)
      //     const industryInsight = await industryInsightModel.create({
      //       industry:user.industry,
      //       ...insights as any,
      //       nextUpdate:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      //     })
      //     return industryInsight
      //   }
      //   return user.industryInsight;
      const industryInsight = await industryInsightModel.findById(user.industry?._id)
      return JSON.parse(JSON.stringify(industryInsight))
    } catch (error) {
      console.log(error)
      throw new Error("Error getting user onboarding status");
  }
}

