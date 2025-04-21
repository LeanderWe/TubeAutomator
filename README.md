# TubeAutomator

A YouTube video automation tool for downloading, processing and managing videos.

## Features

### Video Download
- Download videos from YouTube URLs
- Get video information (title, author, duration, views)
- Multiple quality options

### Video Processing
- Convert videos to different formats (mp4, avi, mov, etc.)
- Video compression with quality settings
- Automatic thumbnail generation
- Extract video metadata

### Task Scheduling
- Schedule automatic downloads with cron expressions
- Background task management
- Automatic cleanup of old files

### Web Interface
- Clean, responsive web UI
- Real-time video information display
- File management and browsing
- Easy download and processing controls

## API Endpoints

- `POST /video/info` - Get video information
- `POST /video/download` - Download video
- `POST /video/process` - Process existing videos
- `GET /files` - List downloaded files
- `GET /processed` - List processed files

## Getting Started

```bash
npm install
npm start
```

Server will run on http://localhost:3000

## Dependencies

- Express.js for web server
- ytdl-core for YouTube downloads
- fluent-ffmpeg for video processing
- node-cron for task scheduling