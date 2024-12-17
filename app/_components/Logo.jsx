import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Logo() {
  return (
    <Link href={'/dashboard'} className='flex items-center gap-2'>
        <Image src={'/redflag-logo.png'} alt='redflag'
        width={30} height={30} />
        <h2 className='font-bold text-xl text-red-500'>RedFlag</h2>
    </Link>
  )
}

export default Logo