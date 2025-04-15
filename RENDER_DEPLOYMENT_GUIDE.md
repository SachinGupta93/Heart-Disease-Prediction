# Deploying to Render

This guide explains how to deploy your Heart Disease Prediction application to Render.

## Backend Deployment

### Option 1: Deploy with Render Dashboard (Easiest)

1. Create a Render account at [render.com](https://render.com) and log in

2. Click on "New" and select "Web Service" 

3. Connect your GitHub/GitLab repository or select "Public Git repository" and enter your repository URL

4. Configure your web service:
   - **Name**: heart-disease-api
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backend.app:app`

5. Add the following environment variables:
   - `PORT`: 8080
   - `VITE_GEMINI_API_KEY`: AIzaSyA9n7oHkGCHPmz1-pZNzNzhBQiQQ01J5WE
   - `MODEL_PATH`: ./backend/model/heart_model.pkl
   - `SCALER_PATH`: ./backend/model/scaler.pkl
   - `NN_MODEL_PATH`: ./backend/model/nn_model.pkl
   - `NN_SCALER_PATH`: ./backend/model/scaler_nn.pkl
   - `EXPLAINER_PATH`: ./backend/model/shap_explainer.pkl
   - `DATASET_PATH`: ./backend/dataset/heart.csv

6. Click "Create Web Service"

### Option 2: Deploy with Render Blueprint

1. Push your repository to GitHub or GitLab

2. Make sure your `render.yaml` file is in the root directory (already created)

3. In the Render dashboard, click "New" and select "Blueprint"

4. Connect to your repository

5. Render will automatically detect the `render.yaml` file and create your services

## Frontend Deployment (Netlify)

After deploying your backend to Render, you'll need to deploy your frontend to Netlify:

1. Create a Netlify account and log in

2. Click "Add new site" → "Deploy manually"

3. Drag and drop your `heart-disease-frontend/dist` folder

4. After deployment, go to Site settings → Environment variables

5. Add the following environment variable:
   - `VITE_API_URL`: https://heart-disease-api.onrender.com (replace with your actual Render URL)

## Update CORS Configuration

If you face any CORS issues, update your backend's CORS configuration in `backend/app.py`:

```python
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://your-netlify-app.netlify.app"], "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})
```

Replace "https://your-netlify-app.netlify.app" with your actual Netlify domain.

## Troubleshooting

- **Model Loading Issues**: Check Render logs to ensure models are being found
- **CORS Errors**: Verify CORS settings include your frontend domain
- **Deployment Failures**: Check the logs in your Render dashboard
- **API Connection Issues**: Make sure the frontend is using the correct API URL