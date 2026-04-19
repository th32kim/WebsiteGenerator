import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const frameId = searchParams.get("frameId");
    const projectId = searchParams.get("projectId");

    if (!frameId?.trim() || !projectId?.trim()) {
      return NextResponse.json(
        { error: "frameId and projectId query parameters are required" },
        { status: 400 }
      );
    }

    const frameRows = await db
      .select()
      .from(frameTable)
      .where(
        and(
          eq(frameTable.frameId, frameId),
          eq(frameTable.projectId, projectId)
        )
      );

    if (frameRows.length === 0) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    const chatRows = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.frameId, frameId));

    const frame = frameRows[0];
    const chatMessages =
      chatRows.length > 0 ? chatRows[0].chatMessage : null;

    return NextResponse.json({
      ...frame,
      chatMessages,
    });
  } catch (error) {
    console.error("[GET /api/frames]", error);
    return NextResponse.json(
      { error: "Failed to load frame" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const {designCode, frameId, projectId} = await request.json();

  const result = await db.update(frameTable).set({
    designCode: designCode}).where(and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, projectId)));
  
    return NextResponse.json({result: 'updated'});
} 