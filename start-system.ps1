# GSRV System Startup Script - Optimized Version
# This script starts the entire GSRV system with performance optimizations

Write-Host "🚀 Starting GSRV System - Optimized Version" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: This script is not running as administrator. Some features may not work properly." -ForegroundColor Yellow
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if a service is running
function Test-Service {
    param([string]$ServiceName)
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        return $service -and $service.Status -eq "Running"
    }
    catch {
        return $false
    }
}

# Function to start service if not running
function Start-ServiceIfNotRunning {
    param([string]$ServiceName, [string]$DisplayName)
    if (Test-Service $ServiceName) {
        Write-Host "✅ $DisplayName is already running" -ForegroundColor Green
    }
    else {
        Write-Host "🔄 Starting $DisplayName..." -ForegroundColor Yellow
        try {
            Start-Service -Name $ServiceName
            Write-Host "✅ $DisplayName started successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to start $DisplayName: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Check and start required services
Write-Host "🔍 Checking required services..." -ForegroundColor Cyan

# Check MySQL
if (Test-Service "MySQL80") {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
}
elseif (Test-Service "MySQL") {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
}
else {
    Write-Host "❌ MySQL is not running. Please start MySQL manually." -ForegroundColor Red
    Write-Host "   You can start it from Services (services.msc) or MySQL Workbench" -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway..."
}

# Check Redis
$redisRunning = $false
if (Test-Port 6379) {
    Write-Host "✅ Redis is running on port 6379" -ForegroundColor Green
    $redisRunning = $true
}
else {
    Write-Host "🔄 Redis not detected. Attempting to start Redis..." -ForegroundColor Yellow
    
    # Try to start Redis using different methods
    try {
        # Method 1: Try to start Redis as a service
        if (Test-Service "Redis") {
            Start-Service -Name "Redis"
            $redisRunning = $true
            Write-Host "✅ Redis service started successfully" -ForegroundColor Green
        }
        # Method 2: Try to start Redis using redis-server command
        elseif (Get-Command "redis-server" -ErrorAction SilentlyContinue) {
            Start-Process -FilePath "redis-server" -WindowStyle Hidden
            Start-Sleep -Seconds 3
            if (Test-Port 6379) {
                $redisRunning = $true
                Write-Host "✅ Redis started successfully using redis-server" -ForegroundColor Green
            }
        }
        # Method 3: Try to start Redis using WSL if available
        elseif (Get-Command "wsl" -ErrorAction SilentlyContinue) {
            Write-Host "🔄 Attempting to start Redis via WSL..." -ForegroundColor Yellow
            wsl sudo service redis-server start
            Start-Sleep -Seconds 3
            if (Test-Port 6379) {
                $redisRunning = $true
                Write-Host "✅ Redis started successfully via WSL" -ForegroundColor Green
            }
        }
        else {
            Write-Host "⚠️  Redis not found. Performance optimizations will be limited." -ForegroundColor Yellow
            Write-Host "   To install Redis:" -ForegroundColor Yellow
            Write-Host "   1. Download from https://redis.io/download" -ForegroundColor Yellow
            Write-Host "   2. Or use: winget install Redis" -ForegroundColor Yellow
            Write-Host "   3. Or use: choco install redis-64" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Failed to start Redis: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check Node.js
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Java
if (Get-Command "java" -ErrorAction SilentlyContinue) {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java is installed: $javaVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ Java is not installed. Please install Java 17+ from https://adoptium.net/" -ForegroundColor Red
    exit 1
}

# Check Maven
if (Get-Command "mvn" -ErrorAction SilentlyContinue) {
    $mvnVersion = mvn --version | Select-String "Apache Maven"
    Write-Host "✅ Maven is installed: $mvnVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ Maven is not installed. Please install Maven from https://maven.apache.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Starting Backend..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Clean and compile backend with optimizations
Write-Host "🔄 Compiling backend with optimizations..." -ForegroundColor Yellow
try {
    mvn clean compile -DskipTests
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend compiled successfully" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Backend compilation failed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Failed to compile backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Start backend in background
Write-Host "🚀 Starting Spring Boot backend..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Hidden -PassThru

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
$backendStarted = $false
for ($i = 0; $i -lt 60; $i++) {
    if (Test-Port 8082) {
        $backendStarted = $true
        Write-Host "✅ Backend started successfully on port 8082" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    Write-Progress -Activity "Starting Backend" -Status "Waiting..." -PercentComplete (($i / 60) * 100)
}

if (-not $backendStarted) {
    Write-Host "❌ Backend failed to start within 60 seconds" -ForegroundColor Red
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Progress -Activity "Starting Backend" -Completed

Write-Host ""
Write-Host "🎨 Starting Frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "../frontend/gsrv-frontend"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start frontend in background
Write-Host "🚀 Starting Angular frontend..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden -PassThru

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
$frontendStarted = $false
for ($i = 0; $i -lt 60; $i++) {
    if (Test-Port 4200) {
        $frontendStarted = $true
        Write-Host "✅ Frontend started successfully on port 4200" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    Write-Progress -Activity "Starting Frontend" -Status "Waiting..." -PercentComplete (($i / 60) * 100)
}

if (-not $frontendStarted) {
    Write-Host "❌ Frontend failed to start within 60 seconds" -ForegroundColor Red
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Progress -Activity "Starting Frontend" -Completed

Write-Host ""
Write-Host "🎉 GSRV System Started Successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8082" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:8082/health" -ForegroundColor Cyan
Write-Host "📈 Metrics: http://localhost:8082/actuator" -ForegroundColor Cyan

if ($redisRunning) {
    Write-Host "⚡ Redis Cache: Running on port 6379" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Redis Cache: Not available (performance may be limited)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔑 Default Login Credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host ""
Write-Host "📋 System Status:" -ForegroundColor Yellow
Write-Host "   Backend Process ID: $($backendProcess.Id)" -ForegroundColor White
Write-Host "   Frontend Process ID: $($frontendProcess.Id)" -ForegroundColor White

Write-Host ""
Write-Host "💡 Performance Tips:" -ForegroundColor Yellow
Write-Host "   • Use Chrome DevTools to monitor performance" -ForegroundColor White
Write-Host "   • Check browser cache settings for optimal loading" -ForegroundColor White
Write-Host "   • Monitor memory usage in Task Manager" -ForegroundColor White
Write-Host "   • Use browser extensions for performance analysis" -ForegroundColor White

Write-Host ""
Write-Host "🛑 To stop the system, press Ctrl+C or close this window" -ForegroundColor Red

# Keep the script running and monitor processes
try {
    while ($true) {
        if ($backendProcess.HasExited) {
            Write-Host "❌ Backend process has stopped unexpectedly" -ForegroundColor Red
            break
        }
        if ($frontendProcess.HasExited) {
            Write-Host "❌ Frontend process has stopped unexpectedly" -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 10
    }
}
catch {
    Write-Host "🛑 Stopping GSRV System..." -ForegroundColor Yellow
}
finally {
    # Cleanup processes
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "🔄 Stopping backend..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Write-Host "🔄 Stopping frontend..." -ForegroundColor Yellow
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "✅ GSRV System stopped successfully" -ForegroundColor Green
}
