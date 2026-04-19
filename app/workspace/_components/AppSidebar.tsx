'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupLabel
  } from "@/components/ui/sidebar"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useContext } from "react"
import { UserDetailContext } from "@/context/UserDetailContext"
import { Progress } from "@/components/ui/progress"
import { UserButton } from "@clerk/nextjs"

  export function AppSidebar() {
    const [projectList, setProjectList] = useState([]);
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const credits = userDetail?.credits;

    return (
      <Sidebar>
        <SidebarHeader className="p-5">
            <div className="flex items-center gap-2">
                <Image src={'/logo.svg'} alt='logo' width={35} height={35} />
                <h2 className="font-bold text-xl">AI Website Generator</h2>
            </div>
            <Link href={'/workspace'} className="mt-5 w-full">
                <Button className="w-full">
                    + Add New Project
                </Button>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel>projects</SidebarGroupLabel>
              {projectList.length==0 && 
                <h2 className="text-sm px-2 text-gray-500">No project found</h2>}
          </SidebarGroup >
        </SidebarContent>
        <SidebarFooter className = "p-2">
          <div className="p-3 border rounded-xl space-y-3 bg-secondary">
            <h2 className="flex justify-between items-center">
              Remaining Credits{" "}
              <span className="font-bold">{credits ?? "—"}</span>
            </h2>
            <Progress value={33} />
             <Button className="w-full">
                Upgrade to Unlimited
             </Button>
          </div>
          <div className="flex items-center gap-2">
            <UserButton />
            <Button variant={"ghost"}>Settings</Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    )
  }