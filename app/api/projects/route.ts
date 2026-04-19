import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { projectTable, frameTable, chatTable } from "@/config/schema";



export async function POST(request: NextRequest) {
    const {projectId, frameId, messages} = await request.json();
    const user = await currentUser();

    //Create Project
    const projectResult = await db.insert(projectTable).values({
        projectId: projectId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
    })

    await db.insert(frameTable).values({
      frameId: String(frameId),
      projectId,
    });

    // Save user message linked to this frame (required for GET /api/frames)
    await db.insert(chatTable).values({
      chatMessage: messages,
      createdBy: user?.primaryEmailAddress?.emailAddress,
      frameId: String(frameId),
    });

    return NextResponse.json({
        projectId, frameId, messages
    })
}