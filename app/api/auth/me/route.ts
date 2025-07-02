import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Dapatkan token dari header Authorization
    const authHeader = request.headers.get('authorization');
    
    // Jika ada token di header, coba verifikasi
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { verifyJWT } = await import('@/lib/auth');
        const payload = await verifyJWT(token);
        return NextResponse.json({ user: payload });
      } catch (error) {
        console.error('Token verification failed:', error);
        // Lanjut ke pengecekan session cookie
      }
    }
    
    // Jika tidak ada token di header atau verifikasi gagal, coba dapatkan dari session cookie
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ user: session });
  } catch (error) {
    console.error('Error in auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
