import React from 'react'

const Loader = () => {
  return (
    <div className='flex gap-1'>
 	<span className='sr-only'>Loading...</span>
  	<div className='h-1 w-1 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
	<div className='h-1 w-1 bg-white/80 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
	<div className='h-1 w-1 bg-white/80 rounded-full animate-bounce'></div>
</div>
  )
}

export default Loader