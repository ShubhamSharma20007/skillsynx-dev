// import cron from "node-cron"
// import industryInsightModel from "@/models/industryInsight.model"
// import generativeModel from "./gemini";

// export const cronJob =  () => {
//     cron.schedule("0 0 * * 0",async () => {
//         try {
//             const allInsign = await industryInsightModel.find();
//             for(let {industry} of allInsign){
//                 const prompt = `
//                 Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
//                 {
//                   "salaryRanges": [
//                     { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
//                   ],
//                   "growthRate": number,
//                   "demandLevel": "High" | "Medium" | "Low",
//                   "topSkills": ["skill1", "skill2"],
//                   "marketOutlook": "Positive" | "Neutral" | "Negative",
//                   "keyTrends": ["trend1", "trend2"],
//                   "recommendedSkills": ["skill1", "skill2"]
//                 }
                
//                 IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
//                 Include at least 5 common roles for salary ranges.
//                 Growth rate should be a percentage.
//                 Include at least 5 skills and trends.
//               `;
//            const response = await generativeModel(prompt);
//            const cleanText = response?.replace(/```(?:json)?\n?/g, "").trim();
//            const data = JSON.parse(JSON.stringify(cleanText));
//             // update the database with the new data
//             await industryInsightModel.updateOne({
//                 where: { industry },
//                 data: {
//                   ...data,
//                   lastUpdated: new Date(),
//                   nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//                 },
//               });
//             }
            
//             console.log("Industry insights updated successfully.");
 
//         } catch (error :any) {
//             throw new Error(`Error updating industry insight for industry: ${error.message || error}`);
//         }
       
//     })
// }