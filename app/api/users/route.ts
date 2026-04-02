import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
        return NextResponse.json({ error: "Primary email is required" }, { status: 400 });
    }

    //Checking if User already exists in the database
    const userResult = await db.select().from(usersTable)
    .where(eq(usersTable.email, email))
    
    //if Not, insert new user
    if(userResult.length == 0) {
        const data={
            name: user?.fullName ?? 'NA',
            email,
            credits: 2
        }
        const result = await db.insert(usersTable).values({
            ...data
        })
        return NextResponse.json({ user:data })
    }

    return NextResponse.json({ user:userResult[0] })
}