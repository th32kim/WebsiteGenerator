import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext';
import { useContext } from 'react';

function PlaygroundHeader() {
  const { setOnSaveData } = useContext(OnSaveContext);
  return (
    <div className='flex justify-between items-center p-4 shadow'>
        <Image src={'/logo.svg'} alt='logo' width={40} height={40} />
        <Button onClick={()=>{
          setOnSaveData({ triggeredAt: Date.now() });
        }}>Save</Button>
    </div>
  )
}

export default PlaygroundHeader