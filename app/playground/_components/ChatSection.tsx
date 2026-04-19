import React from 'react'
import { Messages } from '../[projectId]/page'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

type Props = {
  messages:Messages[]
  onSend: any;
  loading?: boolean;
}

function ChatSection({messages, onSend, loading = false}:Props) {

  const [userInput, setUserInput] = useState<string>();

  const handleSend = () => {
    if (loading) return;
    if(!userInput?.trim()) return;
    onSend(userInput);
    setUserInput('');
  }

  return (
    <div className = 'w-96 shadow h-[91vh] p-4 flex flex-col'>
      {/* Message Section */}
      <div className = 'flex-1 overflow-y-auto p-4 space-y-3 flex flex-col'>
        {messages?.length === 0 ? (
          <p className='text-gray-400 text-center'>No Messages Yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-gray-100 text-black' : 'bg-gray-300 text-black'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading ? (
          <div className='flex justify-center items-center gap-2 p-4'>
            <div className='h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-zinc-800' />
            <span className='text-zinc-800'>Generating response...</span>
          </div>
        ) : null}
      </div>
      {/* {Footer Input} */}
      <div className='p-3 border-t flex items-center gap-2'>
        <textarea
          value={userInput}
          placeholder='Describe your website design here'
          className = 'flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2'
          disabled={loading}
          onChange={(event)=>setUserInput(event.target.value)}
        />
        <Button onClick={handleSend} disabled={loading || !userInput?.trim()}>
          <ArrowUp/>
        </Button>
      </div>
    </div>
  )
}

export default ChatSection