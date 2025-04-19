
import userModel from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai"
export const aiModel = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API,
});

export const createThread = async () => {
  try {
    const thread = await aiModel.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error("Failed to create thread:", error);
    return false;
  }
};

export const getThreadId = async (clerkUserId) => {
  try {
    let findUser = await userModel.findOne(
      { clerkUserId },
      { name: 1, threadId: 1}
    );
    if (findUser?.threadId) {
      return {
        name: findUser.name,
        threadId: findUser.threadId,
        userId: findUser._id,
      };
    } else {
      const threadId = await createThread();
      await userModel.updateOne(
        { clerkUserId: clerkUserId },
        { threadId }
      );

      const updatedUser = await userModel.findOne(
        { clerkUserId: clerkUserId },
        { name: 1, threadId: 1 }
      );

      return {
        name: updatedUser?.name,
        threadId,
        userId: updatedUser?._id,
      };
    }
  } catch (error) {
    console.log('error in getThreadId', error?.message || error);
    return false;
  }
};


