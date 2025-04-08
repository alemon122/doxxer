# IP Tracking Application

A versatile IP tracking application that provides comprehensive visitor insights across mobile and potential desktop platforms.

## Features

- Track visitor IPs and collect data
- View detailed information about visitors
- Create custom tracking links
- Cross-platform compatibility

## Technologies Used

- Frontend: React, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express
- Database: PostgreSQL
- Mobile: React Native
- Desktop: Electron

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/ip-tracking-app.git
   cd ip-tracking-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your database connection string
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database
   ```

4. Run database migrations
   ```bash
   npm run db:push
   ```

5. Start the application
   ```bash
   npm run dev
   ```

## Usage

1. Create tracking links through the web interface
2. Share the links with your users
3. Monitor visitor information in the dashboard