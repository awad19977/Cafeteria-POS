export async function GET(request) {
  // For the current authentication system, we'll just redirect to login
  // since this app uses localStorage-based authentication
  return new Response(
    `
    <html>
      <body>
        <script>
          // Redirect to the main login page
          window.parent.postMessage({ type: 'AUTH_REDIRECT', url: '/' }, '*');
          // Also try direct redirect
          window.location.href = '/';
        </script>
      </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
}
