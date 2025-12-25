# BT-Docker - Docker Management Panel

A modern web-based Docker management interface inspired by Baota Panel, built with Vue 3 and TypeScript.

## 📖 Description

BT-Docker is a comprehensive Docker management solution that provides an intuitive web interface for managing Docker containers, images, networks, and volumes. With its Baota-inspired design, it offers a familiar and user-friendly experience for Docker container management.

## ✨ Features

### 🐳 Container Management
- **Container Lifecycle**: Start, stop, restart, and remove containers
- **Real-time Monitoring**: Live container status and resource usage tracking
- **Detailed Information**: View comprehensive container configurations and settings
- **Log Access**: Real-time log viewing and monitoring
- **Terminal Access**: Integrated terminal for direct container interaction

### 🖼️ Image Management
- **Image Repository**: Browse and manage Docker images
- **Pull Images**: Download images from Docker Hub and other registries
- **Image Cleanup**: Remove unused images and optimize storage

### 🌐 Network Management
- **Network Configuration**: Create and manage Docker networks
- **Container Networking**: Connect containers to different networks
- **Network Visualization**: Visual representation of network connections

### 💾 Storage Management
- **Volume Management**: Create, mount, and manage persistent volumes
- **Volume Mapping**: Configure volume mounts for containers
- **Storage Monitoring**: Track storage usage and available space

### 🎨 User Interface
- **Multi-theme Support**: Light, Dark, and Super Dark themes
- **Responsive Design**: Optimized for desktop and mobile devices
- **Baota-style UI**: Familiar green-themed interface design
- **Real-time Updates**: Live data refresh without page reload

## 🛠️ Technology Stack

- **Frontend Framework**: Vue 3.5.21 with Composition API
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 6.3.6
- **UI Components**: Element Plus 2.11.3
- **Styling**: Tailwind CSS 4.1.13
- **State Management**: Pinia 3.0.3 with persistence
- **Routing**: Vue Router 4.5.1
- **HTTP Client**: Axios 1.12.2
- **Terminal**: @xterm/xterm 5.5.0
- **Code Editor**: vue3-ace-editor 2.2.4

## 🚀 Installation

### Prerequisites
- Node.js 16.0 or higher
- pnpm (recommended) or npm/yarn

### Clone and Install
```bash
git clone https://github.com/SendyYao/bt-docker.git
cd bt-docker
pnpm install
```

### Development Server
```bash
pnpm dev
```
Modify vite.config.ts server host configuration
The development server will start at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── assets/           # Static assets (CSS, images, fonts)
├── components/       # Reusable Vue components
│   ├── common/       # Common UI components
│   └── ContainerDetail/  # Container detail components
├── router/           # Vue Router configuration
├── store/            # Pinia store for state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and API requests
├── views/            # Page components
│   ├── docker/       # Docker management pages
│   └── ...
├── App.vue           # Root component
├── main.ts           # Application entry point
└── axios.ts          # Axios configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://your-backend-api:port
VITE_SSH_HOST="127.0.0.1"
VITE_SSH_USER="BackendSSHUsername"
VITE_SSH_PASSWORD="BackendSSHPassword"
```

### API Configuration
The application expects a backend API running at `/btdocker/` endpoint. Ensure your backend server provides the following endpoints:

- `GET /btdocker/container/get_list` - Get container list
- `POST /btdocker/container/set_container_status` - Set container status
- Additional Docker management endpoints

## 🎯 Usage

1. **Container Management**: Navigate to the Containers tab to view and manage your Docker containers
2. **Image Management**: Use the Images tab to browse and manage Docker images
3. **Network Configuration**: Access the Network tab to manage Docker networks
4. **Storage Management**: Use the Storage tab for volume management
5. **Theme Switching**: Toggle between light, dark, and super dark themes using the theme switcher

## 🔌 API Integration

The application uses a RESTful API structure with the following base configuration:

```typescript
// Base API configuration
const API_BASE_URL = '/btdocker/'

// Example API call
const response = await axios.get(`${API_BASE_URL}container/get_list`)
```

## 🎨 Development

### Icon Generation
Generate custom icon fonts from SVG files:
```bash
pnpm gen:icons
```

## 📄 License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Baota Panel's design philosophy
- Built with modern web technologies
- Docker API for container management capabilities

---

**Note**: This is a frontend application only. A compatible backend API is required for full functionality.