# TomTomLife Media Ingest — CLI prototype

Windows PowerShell helper for yt-dlp + FFmpeg + Deno, maintained separately from the existing Thai-STT-WebUI-V2 environment. A **local experiment**, not a hosted downloader or an IAS-integrated service.

## Prerequisites

- Windows 10/11, PowerShell 5.1+
- Python 3.13 (or compatible Python 3.x)
- Deno (winget install -e --id DenoLand.Deno); reopen PowerShell
- HTTPS YouTube URL of media you are legally permitted to download

## Install

Open PowerShell in this folder:

~~~powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
~~~

This install bundles a local ffmpeg executable inside the virtual environment. Do not commit the .venv folder.

## Use

~~~powershell
.\download.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID"
.\download.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID" -FromStart
.\download.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID" -AudioOnly
.\download.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID" -MetadataOnly
~~~

Saved media goes to downloads/ (excluded from Git). MetadataOnly does not download content.

## Live & limitations

FromStart uses yt-dlp's experimental live-from-start feature. Live DVR restrictions, deleted streams, token expiry, inaccessible fragments and HTTP 403 responses can prevent a full capture. The script stops when a required fragment is unavailable rather than silently skipping it. No guarantee of archival completeness or continued availability.

## Content and user privacy

Only use media **you own, that is public domain/appropriately licensed, or that you have explicit permission to save**. Publicly viewable does not equal permission to download or republish. Respect the source platform's terms, privacy, and personal data.

This prototype supports HTTPS YouTube URLs only. It contains no cookie import, login bypass, download of private videos, public API endpoint, or arbitrary URL fetching. Do not add those features without a security, compliance and consent review.

## Roadmap

- Media ingest job status and validation
- Integration with Thai-STT-WebUI-V2 via a task queue
- IAS identity/access controls and per-user limits
- Short-lived artifact storage and deletion
- Cost accounting for CPU/GPU, disk and bandwidth

No license is granted by publishing this prototype alone. Licensing and commercial use policy will be chosen separately by the project owner.