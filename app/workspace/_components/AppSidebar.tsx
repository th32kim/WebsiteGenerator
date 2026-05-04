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
import { useState, useContext, useEffect } from "react"
import { UserDetailContext } from "@/context/UserDetailContext"
import { Progress } from "@/components/ui/progress"
import { useAuth, UserButton } from "@clerk/nextjs"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"

  export function AppSidebar() {
    const [projectList, setProjectList] = useState<any[]>([]);
    const { userDetail } = useContext(UserDetailContext);
    const [loading, setLoading] = useState(false);
    const credits = userDetail?.credits;
    const {has} = useAuth()

    const GetProjectList = async() => {
      setLoading(true);
      const result = await axios.get('/api/get-all-projects');
      console.log(result.data);
      setProjectList(Array.isArray(result.data) ? result.data : []);
      setLoading(false);
    }

    useEffect(() => {
      GetProjectList();
    }, []);

    const hasUnlimitedAccess = has && has({plan:'unlimited'})

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
              {(!loading && projectList.length==0) && 
                <h2 className="text-sm px-2 text-gray-500">No project found</h2>
              }
              <div>
                {(!loading && projectList.length > 0)? projectList.map((project:any)=>(
                  <Link href={`/playground/${project.projectId}?frameId=${project.frameId}`} key={`${project.projectId}-${project.frameId}`} className="my-2 hover:bg-secondary p-2 rounded-lg cursor-pointer">
                    <h2 className="line-clamp-1">{project?.chats[0].chatMessage[0]?.content}</h2>
                  </Link>
                )):
                [1,2,3,4,5].map((item) => (
                  <Skeleton key={item} className="w-full h-5 rounded-lg mt-2" />
                ))}
              </div>
          </SidebarGroup >
        </SidebarContent>
        <SidebarFooter className = "p-2">
          {!hasUnlimitedAccess &&<div className="p-3 border rounded-xl space-y-3 bg-secondary">
            <h2 className="flex justify-between items-center">
              Remaining Credits
              <span className="font-bold">{credits ?? "—"}</span>
            </h2>
            <Progress value={(userDetail?.credits/2)*100}/>
            <Link href={'/workspace/pricing'} className="w-full">
              <Button className="w-full">
                  Upgrade to Unlimited
              </Button>
            </Link>
          </div>}
          <div className="flex items-center gap-2">
            <UserButton />
            <Button variant={"ghost"}>Settings</Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    )
  }