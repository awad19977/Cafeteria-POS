# Run from your project root (E:\web)
# Usage: Open PowerShell, cd E:\web, then:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\create-stubs.ps1

$apiRoot = Join-Path (Get-Location) "src\app\api"

if (-not (Test-Path $apiRoot)) {
  Write-Error "API root not found: $apiRoot"
  exit 1
}

$stub = @'
export async function GET() {
  return Response.json({ ok: true, message: "dev stub GET", path: new URL(Request?.url || "http://dev").pathname }, { status: 200 });
}
export async function POST(request) {
  const payload = await request.json().catch(()=>null);
  console.log("[dev-stub] POST", payload);
  return Response.json({ ok: true, message: "dev stub POST", payload }, { status: 200 });
}
'@

Get-ChildItem -Path $apiRoot -Recurse -Directory | ForEach-Object {
  $dir = $_.FullName
  $routeJs = Join-Path $dir 'route.js'
  $routeTs = Join-Path $dir 'route.ts'
  if (-not (Test-Path $routeJs) -and -not (Test-Path $routeTs)) {
    try {
      $stub | Out-File -FilePath $routeJs -Encoding utf8 -Force
      Write-Output "Created stub: $routeJs"
    } catch {
      Write-Error "Failed to create $routeJs : $_"
    }
  } else {
    Write-Output "Exists: $dir"
  }
}