import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { projectTable, frameTable, chatTable, usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";



export async function POST(request: NextRequest) {
    const {projectId, frameId, messages, credits} = await request.json();
    const user = await currentUser();
    const {has} = await auth();
    const hasUnlimitedAccess = has && has({plan:'unlimited'});

    //Create Project
    const projectResult = await db.insert(projectTable).values({
        projectId: projectId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
    })

    await db.insert(frameTable).values({
      frameId: String(frameId),
      projectId,
    });

    //Udate User Credit
    if(!hasUnlimitedAccess){
      const userResult = await db.update(usersTable).set({
        credits: credits-1,
      }).where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress));
    }

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