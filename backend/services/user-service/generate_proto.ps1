# PowerShell script to generate Protocol Buffers

# Find protoc.exe
$protocPath = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "protoc.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if ($protocPath) {
    Write-Host "Found protoc at: $($protocPath.FullName)"
    $protoc = $protocPath.FullName
} else {
    # Try common locations
    $commonPaths = @(
        "$env:LOCALAPPDATA\Microsoft\WinGet\Links\protoc.exe",
        "$env:ProgramFiles\protoc\bin\protoc.exe",
        "$env:ProgramFiles(x86)\protoc\bin\protoc.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $protoc = $path
            Write-Host "Found protoc at: $protoc"
            break
        }
    }
}

if (-not $protoc) {
    Write-Error "protoc.exe not found. Please ensure it's installed and in PATH."
    exit 1
}

# Generate Go code
Write-Host "Generating Protocol Buffers code..."
& $protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative proto/user.proto

if ($LASTEXITCODE -eq 0) {
    Write-Host "Protocol Buffers code generation complete!"
} else {
    Write-Error "Failed to generate Protocol Buffers code"
}