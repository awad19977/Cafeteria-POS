export async function GET(request) {
  // This endpoint is being called by some Auth.js code
  // Return a simple response that indicates no active session
  // since this app uses localStorage-based authentication
  
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

export async function POST(request) {
  // Handle POST requests to session endpoint
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