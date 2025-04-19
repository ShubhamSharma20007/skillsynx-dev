
// app/api/ably-token/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as Ably from 'ably';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_SECRET_KEY!);
    const tokenParams = { clientId: userId };
    const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error('Error generating Ably token:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}