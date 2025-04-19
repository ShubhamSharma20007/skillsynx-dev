import React from "react"

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    // mt-16 mb-20
   <div className=" mx-auto ">
    {children}
   </div>
  )
}
