'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'

const MenuOptions=[
    {
    name:'Pricing',
    path: '/pricing'
},
{
    name:'Contact us',
    path: '/contact-us'
}
]

function Header() {
  return (
    <header className='sticky top-0 z-20 w-full border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6 lg:px-10'>
      <div className='mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 lg:flex-nowrap'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
            <Image src={'/logo.svg'} alt='logo' width={35} height={35} />
            <h2 className='text-base font-bold sm:text-xl'>AI Website Generator</h2>
        </div>
        {/* Menu Options */}
        <nav className='order-3 w-full overflow-x-auto sm:order-0 sm:w-auto sm:overflow-visible'>
          <div className='flex min-w-max gap-2 lg:gap-3'>
            {MenuOptions.map((menu,index)=>(
                <Button variant={'ghost'} key={index} asChild>
                  <Link href={menu.path}>{menu.name}</Link>
                </Button>
            ))}
          </div>
        </nav>
        {/* Get Started Button */}
        <div>
          
          <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
          <Link href={'/workspace'}>
            <Button className='px-3 text-sm sm:px-4 sm:text-base'>
              Get Started<ArrowRight/>
            </Button>
          </Link>
          </SignInButton>
        </div>
          
      </div>
    </header>
  )
}

export default Header