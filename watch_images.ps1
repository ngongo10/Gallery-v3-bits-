# Watcher: watches public/images and runs the uploader for changed folders
# Usage: Open PowerShell in project root and run:
#   powershell -ExecutionPolicy Bypass -File .\watch_images.ps1

$root = Join-Path $PSScriptRoot 'public\images'
if (-not (Test-Path $root)) {
    Write-Error "Directory $root not found"
    exit 1
}

$fsw = New-Object System.IO.FileSystemWatcher $root -Property @{ IncludeSubdirectories = $true; NotifyFilter = [System.IO.NotifyFilters]'FileName,DirectoryName' }

$timer = [System.Timers.Timer]::new(500)
$timer.AutoReset = $false
$changedFolders = @{}

Register-ObjectEvent $fsw Created -Action {
    $path = $Event.SourceEventArgs.FullPath
    $rel = Resolve-Path $path -Relative
    # get top-level folder name
    $parts = $rel -split "[\\/]"
    if ($parts.Length -gt 0) {
        $folder = $parts[0]
        $changedFolders[$folder] = $true
        $timer.Stop()
        $timer.Start()
    }
}

Register-ObjectEvent $fsw Renamed -Action {
    $path = $Event.SourceEventArgs.FullPath
    $rel = Resolve-Path $path -Relative
    $parts = $rel -split "[\\/]"
    if ($parts.Length -gt 0) {
        $folder = $parts[0]
        $changedFolders[$folder] = $true
        $timer.Stop()
        $timer.Start()
    }
}

$timer.Add_Elapsed({
    $folders = $changedFolders.Keys
    $changedFolders.Clear()
    foreach ($f in $folders) {
        Write-Host "Detected changes in album: $f. Running uploader for folder $f..."
        & python upload_images_to_cloudinary.py --yes --folder $f
    }
})

Write-Host "Watching $root for changes. Press Ctrl+C to stop."
$fsw.EnableRaisingEvents = $true
while ($true) { Start-Sleep -Seconds 1 }
