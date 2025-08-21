# Deploy to Render - Step by Step Guide

## Prerequisites
- Your code is pushed to GitHub
- You have a Render account (free at render.com)

## Step 1: Create a New Web Service on Render

1. **Go to [render.com](https://render.com) and sign up/login**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Select your repository: `V32V3T/Music-Recommendation-System`**

## Step 2: Configure the Web Service

### Basic Settings:
- **Name**: `music-recommendation-system` (or any name you prefer)
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `Main`

### Build & Start Commands:
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables:
Add these environment variables in the Render dashboard:

```
SECRET_KEY=your_very_secure_secret_key_here
```

**Generate a secure SECRET_KEY:**
```bash
openssl rand -hex 32
```

## Step 3: Add PostgreSQL Database

1. **In your Render dashboard, click "New +" → "PostgreSQL"**
2. **Name**: `music-recommendation-db`
3. **Database**: `mydatabase`
4. **User**: `user`
5. **Region**: Same as your web service
6. **Plan**: Free (for testing)

## Step 4: Connect Database to Web Service

1. **Go back to your web service**
2. **Click "Environment" tab**
3. **Click "Link Database"**
4. **Select your PostgreSQL database**
5. **Render will automatically add the `DATABASE_URL` environment variable**

## Step 5: Deploy

1. **Click "Create Web Service"**
2. **Render will start building and deploying your app**
3. **Wait for the build to complete (usually 5-10 minutes)**

## Step 6: Update CORS for Production

After deployment, you'll get a URL like: `https://your-app-name.onrender.com`

Update your backend CORS settings:

```python
# In backend/main.py, update the origins list:
origins = [
    "http://localhost:3002",
    "https://your-app-name.onrender.com",  # Add your Render URL
    "https://your-frontend-domain.com",    # Add your frontend domain
]
```

## Step 7: Deploy Frontend (Optional)

### Option A: Deploy to Netlify
1. Build your frontend: `cd frontend && npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `frontend/build` folder
4. Update API calls in your frontend to use your Render backend URL

### Option B: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Deploy

## Troubleshooting

### Common Issues:

1. **Build fails with database connection error**
   - ✅ **Fixed**: The database connection is now conditional
   - The app will create tables when the database is available

2. **CORS errors**
   - Make sure your frontend domain is in the CORS origins list
   - Update the origins in `backend/main.py`

3. **Environment variables not set**
   - Check that `DATABASE_URL` is automatically set by Render
   - Verify `SECRET_KEY` is set manually

4. **Port issues**
   - Render automatically sets the `$PORT` environment variable
   - Your app uses `$PORT` in the start command

### Check Logs:
- Go to your Render dashboard
- Click on your web service
- Check the "Logs" tab for any errors

## Your App URLs

After successful deployment:
- **Backend API**: `https://your-app-name.onrender.com`
- **API Documentation**: `https://your-app-name.onrender.com/docs`
- **Frontend**: Your Netlify/Vercel URL

## Next Steps

1. **Test your API endpoints** using the docs at `/docs`
2. **Deploy your frontend** and update API URLs
3. **Set up custom domains** if needed
4. **Monitor your app** using Render's dashboard
