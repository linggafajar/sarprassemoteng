"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"


type User = {
  id: string
  name: string
  email: string
  username: string
  role: string
}


export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login gagal, coba lagi.")
        return
      }

      const { token } = data
      if (!token) {
        setError("Token tidak ditemukan di response.")
        return
      }

      // Simpan token ke cookie (1 jam)
      Cookies.set("token", token, { expires: 1 / 24 }) // 1 hour

      // Decode token
      const decoded = jwtDecode<User>(token)
    


      if (decoded.role === "admin") {
        router.push("/admin")
      } else if (decoded.role === "user") {
        router.push("/dashboard")
      } else {
        setError("Role tidak valid.")
      }

    } catch (err) {
      setError("Terjadi kesalahan saat login.")
      
    }
  }

  const goToRegister = () => {
    router.push("/signup")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg sm:rounded-xl">
        <CardHeader className="flex flex-col items-center space-y-2">
          <Image src="/logo.png" alt="desc" width={80} height={80} className="object-contain" />
          <CardTitle className="text-center text-2xl">SARPRAS SMOTENG</CardTitle>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="identifier">Nama/email</Label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button className="w-full text-sm" onClick={handleLogin}>
            Masuk
          </Button>
          <Button variant="outline" className="w-full text-sm" onClick={goToRegister}>
            Daftar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
