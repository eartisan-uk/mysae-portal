"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "@phosphor-icons/react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? "Light mode" : "Dark mode"}
    </button>
  )
}
