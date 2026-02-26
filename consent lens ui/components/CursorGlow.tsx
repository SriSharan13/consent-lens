"use client"

import { useEffect, useState } from "react"

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <div
      className="pointer-events-none fixed w-[500px] h-[500px] rounded-full blur-[150px] bg-purple-500 opacity-20 -z-10 transition-transform duration-75"
      style={{
        transform: `translate(${position.x - 250}px, ${position.y - 250}px)`
      }}
    />
  )
}