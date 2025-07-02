import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { setSession, signJWT } from "@/lib/auth"

interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string | null;
  };
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let email: string;
    let password: string;
    
    try {
      const body = await request.json();
      email = body.email?.toString() || '';
      password = body.password?.toString() || '';
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: "Invalid request body" }, 
        { status: 400 }
      );
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    });
    
    console.log('User found:', user ? { id: user.id, email: user.email } : 'Not found');

    // Check if user exists
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: "Invalid email or password" }, 
        { status: 401 }
      );
    }

    // Check if user has a password
    if (!user.password) {
      console.log('User has no password set');
      return NextResponse.json(
        { error: "Please register again or contact support" }, 
        { status: 401 }
      );
    }

    // Check password
    console.log('Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: "Invalid email or password" }, 
        { status: 401 }
      );
    }

    // Create response with user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response
    const response = new NextResponse();
    
    // Generate token
    const token = await signJWT({
      id: user.id, // number
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 hari
    });

    // Set session cookie
    const sessionCookie = await setSession(user);
    
    // Set response data
    const responseData: LoginResponse = {
      success: true,
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name ?? null,
        role: user.role ?? null,
      },
      token: token
    };
    
    // Set response body
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionCookie
      },
    });
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
