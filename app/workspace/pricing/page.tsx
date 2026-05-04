import { PricingTable } from "@clerk/nextjs";

function Pricing() {
  return (
    <div className='flex flex-col items-center justify-center max-w-3xl w-full h-screen mx-auto'>
      <h2 className='font-bold text-3xl my-5'>Pricing</h2>
      <PricingTable/>
    </div>
  )
}

export default Pricing