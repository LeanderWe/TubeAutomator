let currentVideoUrl = '';

async function getVideoInfo() {
    const url = document.getElementById('videoUrl').value;
    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    const infoDiv = document.getElementById('videoInfo');
    const contentDiv = document.getElementById('infoContent');

    contentDiv.innerHTML = '<div class="loading">Loading video information...</div>';
    infoDiv.style.display = 'block';

    try {
        const response = await fetch('/video/info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (response.ok) {
            currentVideoUrl = url;
            contentDiv.innerHTML = `
                <p><strong>Title:</strong> ${data.title}</p>
                <p><strong>Author:</strong> ${data.author}</p>
                <p><strong>Duration:</strong> ${formatDuration(data.duration)}</p>
                <p><strong>Views:</strong> ${formatViews(data.viewCount)}</p>
            `;
        } else {
            contentDiv.innerHTML = `<div class="error">${data.error}</div>`;
        }
    } catch (error) {
        contentDiv.innerHTML = `<div class="error">Failed to fetch video information</div>`;
    }
}

async function downloadVideo() {
    if (!currentVideoUrl) {
        alert('Please get video information first');
        return;
    }

    const contentDiv = document.getElementById('infoContent');
    contentDiv.innerHTML += '<div class="loading">Downloading video...</div>';

    try {
        const response = await fetch('/video/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: currentVideoUrl })
        });

        const data = await response.json();

        if (response.ok) {
            contentDiv.innerHTML += `<div style="color: green; margin-top: 1rem;">
                Download completed! File: ${data.filename} (${data.fileSize})
            </div>`;
            loadFiles();
        } else {
            contentDiv.innerHTML += `<div class="error">${data.error}</div>`;
        }
    } catch (error) {
        contentDiv.innerHTML += `<div class="error">Download failed</div>`;
    }
}

async function loadFiles() {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '<div class="loading">Loading files...</div>';

    try {
        const response = await fetch('/files');
        const files = await response.json();

        if (files.length === 0) {
            filesList.innerHTML = '<p>No files downloaded yet.</p>';
            return;
        }

        filesList.innerHTML = files.map(file => `
            <div class="file-item">
                <strong>${file.name}</strong><br>
                Size: ${file.size} | Created: ${new Date(file.created).toLocaleString()}
            </div>
        `).join('');
    } catch (error) {
        filesList.innerHTML = '<div class="error">Failed to load files</div>';
    }
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views) {
    if (views > 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views > 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
}

document.addEventListener('DOMContentLoaded', loadFiles);