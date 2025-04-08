# Heart Disease Prediction App - Frontend

This is the frontend for the Heart Disease Prediction application, built with React and Vite.

## Features

- Heart disease risk prediction using machine learning models
- Comparison of different model predictions
- Visualization of feature importance
- Heart health information and resources

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/heart-disease-frontend.git
cd heart-disease-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to http://localhost:3000

### Building for Production

```bash
npm run build
# or
yarn build
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://127.0.0.1:5000
```

## Backend API

This frontend requires the Heart Disease Prediction backend API to be running. Make sure the backend is running on http://127.0.0.1:5000 or update the `.env` file with the correct URL.

## Technologies Used

- React
- Vite
- Chakra UI
- Axios
- React Icons

## License

This project is licensed under the MIT License.
```

### Instructions for Running the Application

1. First, make sure your backend Flask application is running on port 5000:
```bash
cd backend
python app.py
```

2. In a separate terminal, start the React Vite frontend:
```bash
cd heart-disease-frontend
npm run dev
