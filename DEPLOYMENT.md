# Deploying to VPS using Coolify

This guide outlines the steps to deploy this Next.js application to a VPS using Coolify.

## Prerequisites

1. A VPS with Coolify installed
2. Git repository with your application code
3. PostgreSQL database (can be managed by Coolify or external)

## Step-by-Step Deployment Guide

### 1. Install Coolify on your VPS

If you haven't installed Coolify yet, follow the [official installation guide](https://coolify.io/docs/installation/requirements).

```bash
wget -q https://get.coolify.io -O install.sh
sudo bash ./install.sh
```

### 2. Access Coolify Dashboard

After installation, access the Coolify dashboard at `https://your-server-ip`.

### 3. Add Your Git Repository

1. In the Coolify dashboard, navigate to "Sources" and click "Connect Git Source"
2. Choose your Git provider and authenticate
3. Select this repository

### 4. Set Up the Database

#### Option A: Let Coolify manage the database (recommended)

1. In the Coolify dashboard, navigate to "Resources" → "New Resource" → "Database" → "PostgreSQL"
2. Configure the database:
   - Name: `uddoog`
   - Username: Choose a secure username
   - Password: Generate a strong password
   - Version: 15
3. Click "Create" and note the connection details

#### Option B: Use an external PostgreSQL database

If you're using an external PostgreSQL database, make sure it's accessible from the Coolify server.

### 5. Create the Application in Coolify

1. Navigate to "Services" → "New Service" → "Application"
2. Select your Git repository
3. Select "Docker" as the build method
4. Configure build settings:
   - Dockerfile path: `./Dockerfile`
   - Build arguments: Leave empty for standard build
   - Port: `3000`

### 6. Configure Environment Variables

Set up the following environment variables in Coolify:

```
DATABASE_URL=postgresql://username:password@postgres-host:5432/uddoog
DIRECT_URL=postgresql://username:password@postgres-host:5432/uddoog
NEXT_PUBLIC_API_URL=https://your-domain.com/api
STORAGE_TYPE=digitalocean
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
STORAGE_REGION=your_region
STORAGE_BUCKET=your_bucket
STORAGE_ENDPOINT=your_endpoint_url
STORAGE_FORCE_PATH_STYLE=true
STORAGE_CDN_URL=your_cdn_url
NODE_ENV=production
```

Replace placeholders with your actual values. If using Coolify's managed PostgreSQL, use the connection string provided by Coolify.

### 7. Configure Domain and SSL

1. In your application settings, go to the "Domains" tab
2. Add your domain (e.g., `yourapp.com`)
3. Enable SSL with Let's Encrypt for secure HTTPS

### 8. Deploy the Application

1. Click "Save" to save your application configuration
2. Click "Deploy" to start the deployment process
3. Coolify will build and deploy your application according to the Dockerfile

### 9. Monitor the Deployment

Watch the build and deployment logs to ensure everything is working properly.

### 10. Database Migration

After deployment, you may need to run the Prisma migrations:

1. Go to your application in Coolify
2. Open the terminal
3. Run the following commands:
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify that the PostgreSQL service is running
2. Check that your DATABASE_URL is correct
3. Ensure network connectivity between your application and database
4. Check PostgreSQL logs for errors

### Build Failures

If your build fails:

1. Check the build logs for specific errors
2. Verify that your Dockerfile is correct
3. Make sure all required environment variables are set

### Application Not Starting

If your application doesn't start:

1. Check the application logs
2. Verify that all required environment variables are set
3. Check for port conflicts or binding issues

## Updating Your Application

To update your application:

1. Push changes to your Git repository
2. In Coolify, navigate to your application
3. Click "Deploy" to redeploy with the latest changes

## Backup and Restore

For database backups:

1. In Coolify, navigate to your PostgreSQL resource
2. Use the backup function to create regular backups
3. Store backups in a secure location

## Scaling (Advanced)

If you need to scale your application:

1. In Coolify, navigate to your application settings
2. Adjust resources (CPU, RAM) as needed
3. For horizontal scaling, consider setting up multiple instances behind a load balancer 