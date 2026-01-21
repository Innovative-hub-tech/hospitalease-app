import { auth } from '../../../../auth.js';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get session' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
