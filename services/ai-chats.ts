"use server"
import userModel from "@/models/user.model.js";
import aiChatModel from "@/models/ai-chat-model.js"
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { aiModel, getThreadId } from "@/lib/opean-ai.js";
import * as Ably from 'ably';

let threadMap = new Map();

// Initialize Ably with the secret key
// This is safe on the server-side
const ably = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_SECRET_KEY!);
const channel = ably.channels.get('chat');

export const storeChats = async ({ role, content }:{role:string,content:string}) => {
  await dbConnect();
  let user;
  const { userId } = await auth();
  if (!userId) throw new Error("id not found");
  try {
    user = await userModel.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");
  } catch (error:any) {
    console.log('Error finding user:', error.message || error);
    return;
  }
  const payload = { role, content };

  try {
    const chats = await aiChatModel.findOneAndUpdate(
      { userId: user._id },
      { $push: { chats: payload } },
      { new: true, upsert: true }
    );
    return JSON.parse(JSON.stringify(chats));
  } catch (error:any) {
    throw new Error(error.message || error);
  }
};

export const getAIChats = async () => {
  try {
    await dbConnect()
    const { userId } = await auth();
    if (!userId) throw new Error("id not found");
    const user = await userModel.findOne({ clerkUserId: userId });
    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(await aiChatModel.findOne({ userId: new mongoose.Types.ObjectId(user._id) }).lean()));
  } catch (error: any) {
    console.log('Error finding user:', error.message || error);
    return;
  }
}

export const generateAIChatBoTResponse = async (content: string) => {
  await dbConnect();
  const { userId: clerkUserId } = await auth();
  const user = await userModel.findOne({ clerkUserId });
  if (!user) throw new Error("User not found");
  console.log(user)
  const userDets = await getThreadId(clerkUserId);
  console.log(userDets)
  if (userDets !== false) {
    if (
      !threadMap.has('threadId') ||
      !threadMap.has('current_user') ||
      !threadMap.has('current_user_id')
    ) {
      threadMap.set('threadId', userDets.threadId);
      threadMap.set('current_user', userDets.name);
      threadMap.set('current_user_id', userDets.userId);
    }
  } else {
    throw new Error("Thread ID missing");
  }

  const thread = threadMap.get('threadId');
  if (!thread) throw new Error("Thread ID missing");

  await storeChats({ role: 'user', content });

  await aiModel.beta.threads.messages.create(thread, {
    role: 'assistant',
    content: `You are a helpful AI assistant for user query. 
  - ${threadMap.get('current_user') ? 'The current user is ' + threadMap.get('current_user') + '.' : ''} 
  - Do not generate code. 
  - You must be mentioned of username in initial first message.
  - Mention the user's name no more than twice.`
  
  });

  await aiModel.beta.threads.messages.create(thread, {
    role: 'user',
    content,
  });

  let fullResponse = '';
  const stream = await aiModel.beta.threads.runs.stream(thread, {
    assistant_id: process.env.NEXT_PUBLIC_ASSISTANT_ID!,
    stream: true,
  });

  stream.on('textDelta', async (textDelta) => {
    if (textDelta.value) {
      fullResponse += textDelta.value;
      await channel.publish('chat_response', {
        content: textDelta.value,
        stream: true,
        role: 'assistant',
      });
    }
  });

  stream.on('end', async () => {
    await storeChats({ role: 'assistant', content: fullResponse });
    await channel.publish('stream_complete', {
      content: fullResponse,
      role: 'assistant',
    });
  });

  stream.on('error', (err) => {
    console.error('Stream Error:', err);
  });
};

export const createAblyToken = async (clientId: string) => {
  try {
    const tokenParams = { clientId };
    const tokenRequest = await ably.auth.createTokenRequest(tokenParams);
    return tokenRequest;
  } catch (error) {
    console.error('Error creating Ably token:', error);
    throw error;
  }
};