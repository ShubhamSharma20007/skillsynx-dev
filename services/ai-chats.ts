"use server"
import userModel from "@/models/user.model.js";
import aiChatModel from "@/models/ai-chat-model.js"
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { aiModel, getThreadId } from "@/lib/opean-ai.js";
import * as Ably from 'ably';

// Initialize Ably with the secret key
const ably = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_SECRET_KEY!);
const channel = ably.channels.get('chat');

// Use a map to track thread IDs by user ID
const userThreadMap = new Map();

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
    console.log(userId)
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
  
  if (!clerkUserId) throw new Error("User ID not found");
  
  const user = await userModel.findOne({ clerkUserId });
  if (!user) throw new Error("User not found");
  
  console.log("Processing request for user:", user.name || clerkUserId);
  
  // Get thread ID for this specific user
  const userDets = await getThreadId(clerkUserId);
  
  if (!userDets || userDets === false) {
    throw new Error("Thread ID missing");
  }
  
  // Store thread data per user
  if (!userThreadMap.has(clerkUserId)) {
    userThreadMap.set(clerkUserId, {
      threadId: userDets.threadId,
      userName: userDets.name,
      userId: userDets.userId
    });
  }
  
  const userData = userThreadMap.get(clerkUserId);
  const thread = userData.threadId;
  
  if (!thread) throw new Error("Thread ID missing");

  // Store the user message in the database
  await storeChats({ role: 'user', content });

  // Reset the assistant context for this specific thread
  await aiModel.beta.threads.messages.create(thread, {
    role: 'assistant',
    content: `You are a helpful AI assistant for user query. 
  - ${userData.userName ? 'The current user is ' + userData.userName + '.' : ''} 
  - You should give a direct response to the current question.
  - Do not reference previous questions unless they are directly related.
  - Respond to each question independently.
  - Do not generate code. 
  - Mention the user's name no more than twice.`
  });

  // Send the user message to the AI model
  await aiModel.beta.threads.messages.create(thread, {
    role: 'user',
    content,
  });

  let fullResponse = '';
  
  // Stream the response from the AI model
  const stream = await aiModel.beta.threads.runs.stream(thread, {
    assistant_id: process.env.NEXT_PUBLIC_ASSISTANT_ID!,
    stream: true,
  });

  // Process the streaming response
  stream.on('textDelta', async (textDelta) => {
    if (textDelta.value) {
      fullResponse += textDelta.value;
      
      // Publish each part of the streaming response
      await channel.publish('chat_response', {
        content: textDelta.value,
        stream: true,
        role: 'assistant',
        userId: clerkUserId, // Add user ID to identify which user this response is for
      });
    }
  });

  // When the stream is complete
  stream.on('end', async () => {
    // Store the complete response
    await storeChats({ role: 'assistant', content: fullResponse });
    
    // Publish the complete response
    await channel.publish('stream_complete', {
      content: fullResponse,
      role: 'assistant',
      userId: clerkUserId, // Add user ID to identify which user this response is for
    });
  });

  stream.on('error', (err) => {
    console.error('Stream Error:', err);
  });
};

// Utility function to create an Ably token
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