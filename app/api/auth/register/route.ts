import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { setSession, signJWT } from "@/lib/auth"

interface RegisterResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role = "Student" } = body

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validasi kekuatan password
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generate token
    const token = await signJWT({
      id: newUser.id, // number
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    })

    // Set session cookie
    const response = new NextResponse()
    setSession(newUser, response)

    // Return success response with user data
    return new NextResponse(
      JSON.stringify({
        success: true,
        user: newUser,
        token: token,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(response.headers.entries())
        },
      }
    )
  } catch (error) {
    console.error("Error in register endpoint:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
