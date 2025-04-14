# Heart Disease Prediction Project - Simple Deployment Guide

This guide provides a straightforward approach to deploy your Heart Disease Prediction application using Netlify for the frontend and Heroku for the backend.

## Frontend Deployment (Netlify)

### Prerequisites
- GitHub account (for connecting your repository)
- Netlify account (can sign up with your GitHub account)

### Steps

1. **Deploy to Netlify**

You've already built your frontend with `npm run build`, which created a `dist` folder. Now you can deploy this to Netlify:

**Option A: Using the Netlify website (Easiest)**
- Create a ZIP file of your `dist` folder
- Go to [Netlify](https://app.netlify.com/)
- Click "Add new site" → "Deploy manually"
- Drag and drop your ZIP file
- Your site will be deployed instantly with a Netlify subdomain

**Option B: Using Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the frontend directory
cd heart-disease-frontend
netlify deploy --prod --dir=dist
```

**Option C: Connect to GitHub repository**
- Push your code to GitHub
- Go to [Netlify](https://app.netlify.com/)
- Click "New site from Git"
- Select your repository
- Build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Click "Deploy site"

2. **Add environment variables in Netlify**

After deploying your backend to Heroku (steps below), add these environment variables in Netlify:
- Go to Site settings → Environment variables
- Add the following:
  ```
  VITE_API_URL=https://your-backend-url.herokuapp.com
  VITE_GEMINI_API_KEY=your_gemini_api_key
  ```

## Backend Deployment (Heroku)

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Create a requirements.txt in your project root**

Make sure your requirements.txt includes all necessary dependencies:
```bash
flask
flask-cors
numpy
pandas
scikit-learn
joblib
python-dotenv
gunicorn
```

2. **Create a Procfile in your project root**

Create a file named `Procfile` (no extension) with:
```
web: gunicorn backend.app:app
```

3. **Create a runtime.txt in your project root**

```
python-3.9.6
```

4. **Set up Git and deploy to Heroku**

```bash
# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit for Heroku deployment"

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create heart-disease-prediction-api

# Set environment variables
heroku config:set PORT=8080
heroku config:set VITE_GEMINI_API_KEY=AIzaSyA9n7oHkGCHPmz1-pZNzNzhBQiQQ01J5WE

# Deploy to Heroku
git push heroku main
```

5. **After deployment, make sure to update your app's CORS settings**

Update your backend's CORS settings to include your Netlify URL:

```python
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://your-netlify-app.netlify.app"], "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})
```

Then redeploy:
```bash
git add .
git commit -m "Update CORS settings"
git push heroku main
```

## Firebase Authentication

If your app uses Firebase Authentication, make sure:

1. **Update Firebase config in the frontend**
   - Go to your Firebase project console
   - Go to Project settings → General → Your apps → SDK setup and configuration
   - Copy the configuration object
   - Make sure it's correctly set in your `src/firebase.js` file

2. **Add your Netlify domain to Firebase Auth**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Netlify domain (e.g., `your-app.netlify.app`)

## Troubleshooting

- **Model Loading Issues**: Verify all model files are included in your Heroku deployment
- **CORS Errors**: Check the CORS configuration includes your Netlify domain
- **Heroku Deployment Failures**: Check Heroku logs with `heroku logs --tail`
- **Netlify Build Failures**: Check the build logs in the Netlify dashboard

---

## Important Links After Deployment

- Frontend: https://your-app.netlify.app
- Backend API: https://your-app-name.herokuapp.com