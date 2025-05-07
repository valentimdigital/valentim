"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/routes"

export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    router.push(ROUTES.DASHBOARD)
  }, [router])
  return null
}
