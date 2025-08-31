Write-Host "Setting up onssa database..." -ForegroundColor Green
Write-Host ""

# Try to find MySQL in common locations
$mysqlPath = $null

# Check if MySQL is in PATH
try {
    $null = Get-Command mysql -ErrorAction Stop
    $mysqlPath = "mysql"
    Write-Host "Found MySQL in PATH" -ForegroundColor Yellow
} catch {
    # Check common MySQL installation paths
    $possiblePaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
        "C:\xampp\mysql\bin\mysql.exe",
        "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe",
        "C:\wamp\bin\mysql\mysql8.0.31\bin\mysql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $mysqlPath = $path
            Write-Host "Found MySQL at: $path" -ForegroundColor Yellow
            break
        }
    }
}

if ($null -eq $mysqlPath) {
    Write-Host "MySQL client not found in PATH or common locations." -ForegroundColor Red
    Write-Host "Please make sure MySQL is installed and mysql.exe is accessible." -ForegroundColor Red
    Write-Host ""
    Write-Host "You can also run the SQL script manually in phpMyAdmin or MySQL Workbench." -ForegroundColor Yellow
    Write-Host "The script is located at: database-onssa.sql" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Running database setup script..." -ForegroundColor Green
Write-Host ""

try {
    # Run the SQL script
    if ($mysqlPath -eq "mysql") {
        # MySQL is in PATH
        Get-Content database-onssa.sql | mysql -u root -proot
    } else {
        # MySQL is at specific path
        Get-Content database-onssa.sql | & $mysqlPath -u root -proot
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Database setup completed successfully!" -ForegroundColor Green
        Write-Host "Database 'onssa' has been created with all tables and sample data." -ForegroundColor Green
        Write-Host ""
        Write-Host "Default admin user:" -ForegroundColor Yellow
        Write-Host "Username: admin" -ForegroundColor White
        Write-Host "Password: admin123" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Database setup failed with error code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check your MySQL connection and try again." -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "Error running database setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to continue"
