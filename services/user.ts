'use server'
import userModel from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import industryInsightModel from "@/models/industryInsight.model";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { generateAIInsights } from "./dashboard";


export async function updateUser(data:any){
    const { userId } = await auth();  
    if (!userId) throw new Error("id not found");
    await dbConnect();
    const user = await userModel.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");
    try {
   
        // let industryInsights = await industryInsightModel.findOne({
        //     industry: data.industry
        // });

            const  insights = await generateAIInsights(data.industry);
           const industryInsights = await industryInsightModel.create({
                industry: data.industry,
                ...insights as any,
                userId: new mongoose.Types.ObjectId(user._id),
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
      
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id, 
            {   
                industry: new mongoose.Types.ObjectId(industryInsights._id),
                experience: data.experience,
                bio: data.bio,
                skills: data.skills,
            },
            { new: true }
        );

        return Boolean(updatedUser);
      
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Error updating user");
    }
}

export async function getUserOnboardingStatus(){
    const { userId } = await auth(); 
    if(!userId) throw new Error("id not found");

    try {
        await dbConnect()
        const user = await userModel.findOne({
            clerkUserId:userId
        }).populate('industry');
        return {
            isOnboarded: Boolean(user.industry?._id),
        };
    } catch (error:any) {
        throw new Error("Error getting user onboarding status",error.message|| error);
    }
}

export async function createUser(user:any) {
    try {
        await dbConnect();
        if(!user){
            throw new Error("User not found");
        }
       const createUser = await userModel.findOneAndUpdate(
        {clerkUserId:user.id},
        {
            $setOnInsert:{
            clerkUserId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email:user.emailAddresses[0]?.emailAddress
            }
        },
        {new :true, upsert:true}
       )
       return Boolean(createUser)
       
    } catch (error:any) {
    console.log(error);
    throw new Error("Error creating user",error.message || error);
    
    }
}

export const getUser = async() => {
    try {
    const { userId } = await auth();  
    if (!userId) throw new Error("id not found");
    await dbConnect();
    const user = await userModel.findOne({ clerkUserId: userId }).populate('industry').lean();
    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
    } catch (error:any) {
        console.log(error);
        throw new Error("Error getting user",error.message || error);
    }
}

export const updateUserDetails = async (data: any,formatedIndustry:string) => {
    console.log(data)
    try {
        const { userId } = await auth();  
        if (!userId) throw new Error("id not found");
        await dbConnect();
        const updatedUser = await userModel.findOneAndUpdate(
            { clerkUserId: userId },
            { $set: data ,
            industry:formatedIndustry
            },
            { new: true }
        );
        if (!updatedUser) throw new Error("User not found");
        return true
    } catch (error: any) {
        console.log(error);
        throw new Error("Error updating user", error.message || error);
    }
}