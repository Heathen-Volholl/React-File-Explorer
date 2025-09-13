# React File Explorer Features

This document outlines the key features of the React File Explorer application, a modern, feature-rich file management tool built with React, Tailwind CSS, and the Gemini API.

## Core Interface

- **Dual-Pane View**: Manage files and folders in two independent, side-by-side panes for enhanced productivity. Easily drag and drop or compare contents between directories.
- **Tabbed Browsing**: Each pane supports multiple tabs, allowing you to keep several folders open simultaneously without cluttering your workspace.
- **Modern UI/UX**: The interface is inspired by Windows 11, offering a clean, intuitive, and aesthetically pleasing user experience.
- **Light & Dark Mode**: Switch between light and dark themes to suit your preference and reduce eye strain.

## Intelligent Search

- **AI-Powered Semantic Search**: Go beyond simple keyword matching. Powered by the Gemini API, the semantic search understands natural language queries like "financial reports from last quarter" or "photos from my vacation" to find exactly what you're looking for.

## File Management & Interaction

- **Comprehensive File Previews**: Instantly preview a wide range of file types directly within the application without needing to open external software. Supported formats include:
    - **Images**: `jpg`, `png`, `gif`, `svg`, `webp`
    - **Documents**: `pdf`, `txt`, `md`
    - **Videos**: `mp4`, `webm`
    - **Audio**: `mp3`, `wav`
- **Rich Context Menu**: A right-click context menu provides quick access to common file operations:
    - Open, Copy, Cut, Paste
    - Create New Folder
    - View Properties
    - **Special Actions**: Extract archives (`.zip`, `.7z`) and encrypt files directly.
- **Properties Modal**: View detailed information about any file or folder, including its size, location, modification date, and permissions.

## Productivity & Accessibility

- **Command Palette**: Press `Ctrl+K` to open a command palette for quick access to application-wide actions, such as toggling the theme or navigating to key directories.
- **Keyboard Navigation**: Efficiently navigate the interface using keyboard shortcuts for history navigation (back/forward), moving up a directory, and interacting with the address bar.
- **Toast Notifications**: Receive non-intrusive feedback for actions like file extraction or encryption through on-screen toast messages.
- **Accessible Design**: The application incorporates ARIA attributes and a clear, navigable structure to ensure it is usable by a wide range of users.
