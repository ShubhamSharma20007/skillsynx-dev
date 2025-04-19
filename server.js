
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { aiModel, getThreadId } from "./lib/opean-ai.js"
import { storeChats } from "./services/ai-chats.js";
import fs from "fs";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();


app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer,{
    cors:{
      origin:'*'
    }
  });
  let threadMap = new Map()
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('chat_message', async ({msg,user}) => {

      const userDets = await getThreadId(user)
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
      }
      
      const thread = threadMap.get('threadId');
      const userId = threadMap.get('current_user_id'); 
      if (!thread) {
        console.error(" thread ID not found");
        return;
      }
      await storeChats({ role: 'user', content: msg, userId });
    const file = fs.readFileSync('./project.json','utf8')
    const rawData = JSON.parse(file)
    // const file = await aiModel.files.create({
    //     file: fs.readFileSync('./project.json', 'utf-8'),
    //     purpose: 'fine-tuning',
    //   });
      await aiModel.beta.threads.messages.create(thread, {
        role: 'assistant',
        content: `You are a helpful AI assistant for user query. 
      - ${threadMap.get('current_user') ? 'The current user is ' + threadMap.get('current_user') + '.' : ''} 
      - Do not generate code. 
      - You must be mentioned of username in initial first message.
      - Mention the user’s name no more than twice.`
      
      });

      await aiModel.beta.threads.messages.create(thread, {
        role: 'user',
        content: msg
      });

      let fullResponse = '';

      const stream = await aiModel.beta.threads.runs.stream(thread, {
        assistant_id: process.env.NEXT_PUBLIC_ASSISTANT_ID,
        stream: true,

      });

      stream.on('textDelta', (textDelta) => {
        if (textDelta.value) {
          fullResponse += textDelta.value;
          socket.emit('chat_response', {
            content: textDelta.value,
            stream: true,
            role: 'assistant'
          });
        }
      });

      stream.on('toolCallDone', async() => {
        socket.emit('stream_complete', {
          content: fullResponse,
          role: 'assistant'
        });
      });

      stream.on('end', async() => {
        socket.emit('stream_complete', {
          content: fullResponse,
          role: 'assistant'
        });
        await storeChats({ role: 'assistant', content: fullResponse, userId });
      });

      stream.on('error', (error) => {
        console.error("Stream error:", error);
        socket.emit('error', {
          message: 'An error occurred with the AI response'
        });
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});