# GSRV System Performance Test Script
# This script validates all performance optimizations

Write-Host "🚀 GSRV System Performance Test Suite" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Function to test API endpoint
function Test-ApiEndpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$ExpectedMaxTime = 2000
    )
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        
        if ($response.StatusCode -eq 200) {
            if ($responseTime -le $ExpectedMaxTime) {
                Write-Host "✅ $Name`: ${responseTime}ms (Expected: <${ExpectedMaxTime}ms)" -ForegroundColor Green
                return $true
            } else {
                Write-Host "⚠️  $Name`: ${responseTime}ms (Expected: <${ExpectedMaxTime}ms)" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "❌ $Name`: HTTP $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ $Name`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test database connection
function Test-DatabaseConnection {
    Write-Host "🔍 Testing Database Connection..." -ForegroundColor Cyan
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", 3306)
        $connection.Close()
        Write-Host "✅ MySQL Database: Connected" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ MySQL Database: Connection failed" -ForegroundColor Red
        return $false
    }
}

# Function to test Redis connection
function Test-RedisConnection {
    Write-Host "🔍 Testing Redis Connection..." -ForegroundColor Cyan
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", 6379)
        $connection.Close()
        Write-Host "✅ Redis Cache: Connected" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "⚠️  Redis Cache: Not available (performance may be limited)" -ForegroundColor Yellow
        return $false
    }
}

# Function to test frontend loading
function Test-FrontendLoading {
    Write-Host "🔍 Testing Frontend Loading..." -ForegroundColor Cyan
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -TimeoutSec 30
        $stopwatch.Stop()
        $loadTime = $stopwatch.ElapsedMilliseconds
        
        if ($response.StatusCode -eq 200) {
            if ($loadTime -le 5000) {
                Write-Host "✅ Frontend Loading: ${loadTime}ms (Expected: <5000ms)" -ForegroundColor Green
                return $true
            } else {
                Write-Host "⚠️  Frontend Loading: ${loadTime}ms (Expected: <5000ms)" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "❌ Frontend Loading: HTTP $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Frontend Loading: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to run load test
function Test-LoadTest {
    param([string]$Url, [string]$Name, [int]$Requests = 10)
    
    Write-Host "🔍 Running Load Test for $Name..." -ForegroundColor Cyan
    
    $successCount = 0
    $totalTime = 0
    $responseTimes = @()
    
    for ($i = 1; $i -le $Requests; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5
            $stopwatch.Stop()
            
            if ($response.StatusCode -eq 200) {
                $successCount++
                $responseTime = $stopwatch.ElapsedMilliseconds
                $totalTime += $responseTime
                $responseTimes += $responseTime
            }
        }
        catch {
            # Ignore individual failures for load test
        }
        
        # Small delay between requests
        Start-Sleep -Milliseconds 100
    }
    
    if ($successCount -gt 0) {
        $avgTime = [math]::Round($totalTime / $successCount, 2)
        $successRate = [math]::Round(($successCount / $Requests) * 100, 1)
        $minTime = ($responseTimes | Measure-Object -Minimum).Minimum
        $maxTime = ($responseTimes | Measure-Object -Maximum).Maximum
        
        Write-Host "📊 $Name Load Test Results:" -ForegroundColor Cyan
        Write-Host "   Success Rate: ${successRate}% ($successCount/$Requests)" -ForegroundColor White
        Write-Host "   Average Time: ${avgTime}ms" -ForegroundColor White
        Write-Host "   Min Time: ${minTime}ms" -ForegroundColor White
        Write-Host "   Max Time: ${maxTime}ms" -ForegroundColor White
        
        return $successRate -ge 80
    } else {
        Write-Host "❌ $Name Load Test: No successful requests" -ForegroundColor Red
        return $false
    }
}

# Main test execution
Write-Host "Starting Performance Tests..." -ForegroundColor Yellow
Write-Host ""

# Test infrastructure
$dbConnected = Test-DatabaseConnection
$redisConnected = Test-RedisConnection
$frontendLoaded = Test-FrontendLoading

Write-Host ""
Write-Host "🔧 Testing Backend API Endpoints..." -ForegroundColor Cyan

# Test backend endpoints
$apiTests = @(
    @{Url="http://localhost:8082/health"; Name="Health Check"; ExpectedTime=500},
    @{Url="http://localhost:8082/health/simple"; Name="Simple Health"; ExpectedTime=500},
    @{Url="http://localhost:8082/actuator"; Name="Actuator"; ExpectedTime=1000},
    @{Url="http://localhost:8082/actuator/metrics"; Name="Metrics"; ExpectedTime=1000},
    @{Url="http://localhost:8082/products"; Name="Products API"; ExpectedTime=2000},
    @{Url="http://localhost:8082/users"; Name="Users API"; ExpectedTime=2000},
    @{Url="http://localhost:8082/reclamations"; Name="Reclamations API"; ExpectedTime=2000},
    @{Url="http://localhost:8082/dashboard"; Name="Dashboard API"; ExpectedTime=3000},
    @{Url="http://localhost:8082/analytics"; Name="Analytics API"; ExpectedTime=5000}
)

$apiTestResults = @()
foreach ($test in $apiTests) {
    $result = Test-ApiEndpoint -Url $test.Url -Name $test.Name -ExpectedMaxTime $test.ExpectedTime
    $apiTestResults += $result
}

Write-Host ""
Write-Host "📊 Running Load Tests..." -ForegroundColor Cyan

# Run load tests
$loadTestResults = @()
$loadTestResults += Test-LoadTest -Url "http://localhost:8082/health" -Name "Health Check" -Requests 20
$loadTestResults += Test-LoadTest -Url "http://localhost:8082/products" -Name "Products API" -Requests 15
$loadTestResults += Test-LoadTest -Url "http://localhost:8082/dashboard" -Name "Dashboard API" -Requests 10

Write-Host ""
Write-Host "🎯 Performance Test Summary" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Calculate success rates
$apiSuccessRate = ($apiTestResults | Where-Object { $_ -eq $true }).Count / $apiTestResults.Count * 100
$loadSuccessRate = ($loadTestResults | Where-Object { $_ -eq $true }).Count / $loadTestResults.Count * 100

Write-Host "📈 API Endpoint Tests: $([math]::Round($apiSuccessRate, 1))% success rate" -ForegroundColor $(if ($apiSuccessRate -ge 80) { "Green" } else { "Yellow" })
Write-Host "📈 Load Tests: $([math]::Round($loadSuccessRate, 1))% success rate" -ForegroundColor $(if ($loadSuccessRate -ge 80) { "Green" } else { "Yellow" })
Write-Host "🗄️  Database Connection: $(if ($dbConnected) { "✅ Connected" } else { "❌ Failed" })" -ForegroundColor $(if ($dbConnected) { "Green" } else { "Red" })
Write-Host "⚡ Redis Cache: $(if ($redisConnected) { "✅ Connected" } else { "⚠️  Not Available" })" -ForegroundColor $(if ($redisConnected) { "Green" } else { "Yellow" })
Write-Host "🌐 Frontend Loading: $(if ($frontendLoaded) { "✅ Loaded" } else { "❌ Failed" })" -ForegroundColor $(if ($frontendLoaded) { "Green" } else { "Red" })

Write-Host ""
Write-Host "🎯 Overall Performance Score" -ForegroundColor Cyan

# Calculate overall score
$overallScore = 0
$totalTests = 4

if ($apiSuccessRate -ge 90) { $overallScore += 25 }
elseif ($apiSuccessRate -ge 80) { $overallScore += 20 }
elseif ($apiSuccessRate -ge 70) { $overallScore += 15 }
else { $overallScore += 10 }

if ($loadSuccessRate -ge 90) { $overallScore += 25 }
elseif ($loadSuccessRate -ge 80) { $overallScore += 20 }
elseif ($loadSuccessRate -ge 70) { $overallScore += 15 }
else { $overallScore += 10 }

if ($dbConnected) { $overallScore += 25 }
if ($redisConnected) { $overallScore += 15 }
else { $overallScore += 10 } # Partial credit for Redis

if ($frontendLoaded) { $overallScore += 25 }

Write-Host "🏆 Performance Score: $overallScore/100" -ForegroundColor $(if ($overallScore -ge 90) { "Green" } elseif ($overallScore -ge 80) { "Yellow" } else { "Red" })

Write-Host ""
if ($overallScore -ge 90) {
    Write-Host "🎉 EXCELLENT! System is performing optimally!" -ForegroundColor Green
} elseif ($overallScore -ge 80) {
    Write-Host "✅ GOOD! System is performing well with minor optimizations possible." -ForegroundColor Yellow
} elseif ($overallScore -ge 70) {
    Write-Host "⚠️  ACCEPTABLE! System needs some performance improvements." -ForegroundColor Yellow
} else {
    Write-Host "❌ NEEDS IMPROVEMENT! System requires significant optimization." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Performance Recommendations:" -ForegroundColor Cyan

if ($apiSuccessRate -lt 90) {
    Write-Host "   • Optimize slow API endpoints" -ForegroundColor White
}
if ($loadSuccessRate -lt 90) {
    Write-Host "   • Increase server resources or optimize queries" -ForegroundColor White
}
if (-not $redisConnected) {
    Write-Host "   • Install Redis for better caching performance" -ForegroundColor White
}
if (-not $frontendLoaded) {
    Write-Host "   • Check frontend build and server configuration" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Monitor system performance in production" -ForegroundColor White
Write-Host "   2. Set up continuous performance monitoring" -ForegroundColor White
Write-Host "   3. Implement performance alerts" -ForegroundColor White
Write-Host "   4. Regular performance audits" -ForegroundColor White

Write-Host ""
Write-Host "✅ Performance test completed!" -ForegroundColor Green
