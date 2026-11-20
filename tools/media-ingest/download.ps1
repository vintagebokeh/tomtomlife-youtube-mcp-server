param(
  [Parameter(Mandatory=$true)][string]$Url,
  [switch]$FromStart,
  [switch]$AudioOnly,
  [switch]$MetadataOnly
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$py = Join-Path $root '.venv\Scripts\python.exe'
$ffmpegDir = Join-Path $root '.venv\Lib\site-packages\imageio_ffmpeg\binaries'
$out = Join-Path $root 'downloads'

# Keep the public prototype restricted to known video hosts.
try { $mediaUrl = [uri]$Url } catch { throw 'Invalid URL.' }
$allowedHosts = @('youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be')
if ($mediaUrl.Scheme -ne 'https' -or $mediaUrl.DnsSafeHost -notin $allowedHosts) {
  throw 'Only HTTPS YouTube URLs are allowed in this prototype.'
}

if (!(Test-Path -LiteralPath $py)) {
  throw 'Missing .venv. Create a venv and install requirements.txt first.'
}
$ffmpeg = Get-ChildItem -LiteralPath $ffmpegDir -Filter 'ffmpeg*.exe' -File -ErrorAction SilentlyContinue |
  Select-Object -First 1
if (!$ffmpeg) { throw 'FFmpeg not found. Install requirements.txt first.' }

New-Item -ItemType Directory -Force -Path $out | Out-Null
$argsList = @(
  '-m','yt_dlp',
  '--ffmpeg-location',$ffmpeg.FullName,
  '-P',$out,
  '--no-playlist',
  '--restrict-filenames',
  '--abort-on-unavailable-fragments',
  '--newline'
)

$denoCommand = Get-Command deno -ErrorAction SilentlyContinue
$denoExe = if ($denoCommand) { $denoCommand.Source } else { $null }
if (!$denoExe) {
  $denoExe = Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages') -Directory -Filter 'DenoLand.Deno*' -ErrorAction SilentlyContinue |
    ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Recurse -Filter 'deno.exe' -File -ErrorAction SilentlyContinue } |
    Select-Object -First 1 -ExpandProperty FullName
}
if ($denoExe) {
  $argsList += @('--js-runtimes',"deno:$denoExe")
} else {
  Write-Warning 'Deno not found. Some YouTube formats may be unavailable. Install Deno via winget.'
}

if ($FromStart) { $argsList += '--live-from-start' }
if ($AudioOnly) { $argsList += @('-x','--audio-format','mp3') }
if ($MetadataOnly) { $argsList += '--simulate' }
$argsList += $Url

& $py @argsList
exit $LASTEXITCODE