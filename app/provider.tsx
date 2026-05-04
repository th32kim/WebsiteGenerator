'use client'
import React from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useState } from 'react'
import { OnSaveContext } from '@/context/OnSaveContext'

 function Provider({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

    const {user} = useUser();
    const [userDetail, setUserDetail] = useState<any>();    
    const [onSaveData, setOnSaveData] = useState<any>(null);
    useEffect(() => {   
        user && CreateNewUser()
    }, [user])

    const CreateNewUser = async () => {
        await axios.post('/api/users',{
        }).then((res) => {
            console.log(res.data)
            setUserDetail(res.data?.user);
        }).catch((err) => {
            console.log(err)
        })
    }
  return (
    <div>
        <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
          <OnSaveContext.Provider value={{onSaveData, setOnSaveData}}>
            {children}
            </OnSaveContext.Provider>
        </UserDetailContext.Provider>
    </div>
  )
}

export default Provider