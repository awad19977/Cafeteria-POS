// This is a catch-all route that handles any remaining Auth.js requests
// and redirects them to our custom authentication system

export async function GET(request, { params }) {
  const { nextauth } = params;
  
  // If it's a session request, handle it properly
  if (nextauth && nextauth.includes('session')) {
    return Response.json(
      { 
        user: null,
        expires: null,
        error: "This app uses localStorage-based authentication, not sessions"
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  
  // For any other Auth.js requests, return a redirect to our login
  return Response.json(
    { 
      error: "This app uses custom authentication. Please use /api/auth/login instead.",
      redirect: "/api/auth/login"
    },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

export async function POST(request, { params }) {
  const { nextauth } = params;
  
  // If it's a login/signin request, redirect to our custom login
  if (nextauth && (nextauth.includes('signin') || nextauth.includes('callback'))) {
    return Response.json(
      { 
        error: "This app uses custom authentication. Please use /api/auth/login instead.",
        redirect: "/api/auth/login"
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  
  // For session requests
  if (nextauth && nextauth.includes('session')) {
    return Response.json(
      { 
        user: null,
        expires: null,
        error: "This app uses localStorage-based authentication, not sessions"
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  
  // For any other requests
  return Response.json(
    { 
      error: "This app uses custom authentication. Please use /api/auth/login instead.",
      redirect: "/api/auth/login"
    },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}