import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies, headers } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
const alg = 'HS256';

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function setSession(user: any): Promise<string> {
  const token = await signJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 hari
  });

  const cookieOptions = [
    `session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${7 * 24 * 60 * 60}`, // 7 hari
    process.env.NODE_ENV === 'production' ? 'Secure' : ''
  ].filter(Boolean).join('; ');
  
  return cookieOptions;
}

function parseCookies(cookieString: string): Record<string, string> {
  return cookieString.split(';').reduce((acc: Record<string, string>, cookie: string) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export async function getSession() {
  try {
    let sessionToken = '';
    
    if (typeof window === 'undefined') {
      // Server-side: Gunakan headers() dari next/headers
      const headersList = await headers();
      const cookieHeader = headersList.get('cookie') || '';
      
      // Parse cookies dari header
      const cookies = parseCookies(cookieHeader);
      sessionToken = cookies['session'] || '';
    } else {
      // Client-side: Gunakan document.cookie
      const cookies = parseCookies(document.cookie);
      sessionToken = cookies['session'] || '';
      
      // Coba dapatkan dari localStorage sebagai fallback
      if (!sessionToken) {
        sessionToken = localStorage.getItem('authToken') || '';
        // Jika token ada di localStorage, set cookie
        if (sessionToken) {
          document.cookie = `session=${sessionToken}; Path=/; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
        }
      }
    }
    
    if (!sessionToken) {
      console.log('No session token found in cookies or localStorage');
      return null;
    }
    
    const payload = await verifyJWT(sessionToken);
    
    // Periksa apakah token sudah kadaluarsa
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('Session expired');
      // Hapus cookie yang sudah kadaluarsa
      if (typeof document !== 'undefined') {
        document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('authToken');
      }
      return null;
    }
    
    console.log('Session verified:', { 
      userId: payload.id, 
      email: payload.email,
      expires: new Date((payload.exp || 0) * 1000).toISOString()
    });
    
    return payload;
  } catch (error) {
    console.error('Session verification failed:', error);
    // Hapus cookie yang tidak valid
    if (typeof document !== 'undefined') {
      document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('authToken');
    }
    return null;
  }
}

export async function clearSession() {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    }
  });
  
  return response;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
