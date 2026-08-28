$ErrorActionPreference = 'Stop'
$siteRoot = (Resolve-Path $PSScriptRoot).Path
$types = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.json'='application/json; charset=utf-8';'.webmanifest'='application/manifest+json; charset=utf-8';'.xml'='application/xml; charset=utf-8';'.txt'='text/plain; charset=utf-8';'.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.svg'='image/svg+xml';'.ico'='image/x-icon';'.webp'='image/webp'}
$server = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,4174)
$server.Start()
Write-Host 'CodeCrafts v2 preview running at http://localhost:4174'

function Send-Response($stream, $status, $contentType, [byte[]]$payload) {
  $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($payload.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($payload, 0, $payload.Length)
}

while ($true) {
  $client = $server.AcceptTcpClient()
  try {
    $client.ReceiveTimeout = 2500
    $client.SendTimeout = 2500
    $stream = $client.GetStream()
    $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()
    if (-not $requestLine) { continue }
    while (($header = $reader.ReadLine()) -ne '') { if ($null -eq $header) { break } }
    $parts = $requestLine.Split(' ')
    $rawPath = if ($parts.Length -gt 1) { $parts[1] } else { '/' }
    $requestPath = [Uri]::UnescapeDataString(([Uri]::new("http://localhost$rawPath")).AbsolutePath)
    if ($requestPath -eq '/') { $requestPath = '/index.html' }
    if ($requestPath -eq '/api/content') {
      $contentFile = Join-Path $siteRoot 'content\site-content.json'
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ([IO.File]::ReadAllBytes($contentFile))
      continue
    }
    if ($requestPath -eq '/api/cms-session') {
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('{"authenticated":true}'))
      continue
    }
    if ($requestPath -eq '/api/cms-content' -and $parts[0] -eq 'GET') {
      $contentFile = Join-Path $siteRoot 'content\site-content.json'
      $fallbackJson = [IO.File]::ReadAllText($contentFile, [Text.Encoding]::UTF8)
      $cmsPayload = "{`"content`":$fallbackJson,`"source`":`"fallback`"}"
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes($cmsPayload))
      continue
    }
    if ($requestPath -like '/api/cms-*') {
      Send-Response $stream '503 Service Unavailable' 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('{"error":"Run with Vercel Dev to use CMS authentication and publishing locally."}'))
      continue
    }
    $candidate = [IO.Path]::GetFullPath((Join-Path $siteRoot $requestPath.TrimStart('/')))
    if (Test-Path -LiteralPath $candidate -PathType Container) {
      $candidate = Join-Path $candidate 'index.html'
    }
    if (-not [IO.Path]::HasExtension($candidate) -and -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
      $candidate = "$candidate.html"
    }
    if (-not $candidate.StartsWith($siteRoot, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
      Send-Response $stream '404 Not Found' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Not found'))
    } else {
      $extension = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $contentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { 'application/octet-stream' }
      Send-Response $stream '200 OK' $contentType ([IO.File]::ReadAllBytes($candidate))
    }
  } catch {
    # Browsers may open speculative connections and leave them idle. Continue serving.
  } finally {
    $client.Close()
  }
}
