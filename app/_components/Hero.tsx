'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { ImagePlus, ArrowUp, LayoutDashboard, Key, HomeIcon, User } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'
import {v4 as uuidv4} from 'uuid'
import axios from 'axios'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'

const suggestions = [
  {
    label: 'Dashboard',
    prompt: 'Create an analytics dashboard to track customers and revenue data for a SaaS product',
    icon: LayoutDashboard
  },
  {
    label: 'SignUp Form',
    prompt: 'Create a modern signup form with email/password fields, Google and Github login options, and terms checkbox',
    icon: Key
  },
  {
    label: 'Hero',
    prompt: 'Create a modern header and centered hero section for a productivity SaaS product. Include a badge for feature announcement, a title with a subtle gradient effect',
    icon: HomeIcon
  },
  {
    label: 'User Profile Card',
    prompt: 'Create a modern user profile card component for a social media website',
    icon: User
  }
]



function Hero() {

  const [userInput, setUserInput] = useState<string>();
  const {user} = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


  const CreateNewProject = async() => {
    setIsLoading(true);
    const projectId = uuidv4();
    const frameId = generateRandomFrameNumber();
    const messages = [
      {
        role: 'user',
        content: userInput,
      }
    ]

    try{
      const result = await axios.post('/api/projects', {
        projectId: projectId,
        frameId: frameId,
        messages: messages,
      });
      console.log(result.data);
      toast.success('Project Created Successfully');
      //Navigate to Playground
      router.push(`/playground/${projectId}?frameId=${frameId}`);
      setIsLoading(false);
    }catch(e){
      toast.error('Internal Server Error');
      console.log(e);
      setIsLoading(false);
    }
  }

  return (
    <main className='mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-7xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-10 lg:py-16 xl:py-20'>
        {/* Header & Description */}
        <h2 className='text-center text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl xl:text-7xl'>What should we Design?</h2>
        <p className='mt-3 max-w-2xl text-center text-sm text-gray-500 sm:text-lg lg:max-w-3xl'>Generate, edit and explore design ideas with AI, then export the code.</p>
        
        {/* Text input box */}
        <div className='mt-6 w-full max-w-2xl rounded-2xl border bg-card p-4 shadow-sm sm:p-5 lg:max-w-3xl'>
            <textarea placeholder='Describe your page design'
            value={userInput}
            onChange={(e)=>setUserInput(e.target.value)}
            className='h-28 w-full resize-none text-sm focus:outline-none focus:ring-0 sm:text-base lg:h-32'
            />
            <div className='flex justify-between items-center'>
                <Button variant={'ghost'}><ImagePlus/></Button>
                {!user ? (
                  <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                    <Button disabled={!userInput || isLoading}>
                      {isLoading ? <Loader2Icon className='animate-spin'/> : <ArrowUp />}
                    </Button>
                  </SignInButton>
                ) : (
                  <Button disabled={!userInput || isLoading} onClick={CreateNewProject}>
                    {isLoading ? <Loader2Icon className='animate-spin'/> : <ArrowUp />}
                  </Button>
                )}
                
            </div>
        </div>
        {/* suggestion list */}
        <div className='mt-4 grid w-full max-w-4xl grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4'>
          {suggestions.map((suggestion,index)=>(
            <Button key={index} variant={'outline'} className='h-auto justify-start gap-2 px-3 py-2 text-xs sm:text-sm lg:min-h-11' onClick={()=>setUserInput(suggestion.prompt)}>
              <suggestion.icon/>
              {suggestion.label}</Button>
          ))}
        </div>
    </main>
  )
}

export default Hero

const generateRandomFrameNumber = () => {
  return Math.floor(Math.random() * 1000000);
}