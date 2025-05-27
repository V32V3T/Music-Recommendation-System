from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import os
from datetime import timedelta

# Import new modules using absolute imports
import models
import schemas
import auth
import database
# engine and get_db will be accessed via the database module, e.g., database.engine

# Create database tables if they don't exist (for development only)
# For production, use Alembic for migrations
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",  # Allow your React frontend
    # You can add other origins here if needed, e.g., your deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Configuration
DATA_FILE = "top_10000_1950-now.csv"
AUDIO_FEATURES = [
    "Danceability", "Energy", "Loudness", "Speechiness", "Acousticness",
    "Instrumentalness", "Liveness", "Valence", "Tempo"
]
METADATA_COLUMNS = ["Track Name", "Artist Name(s)", "Album Image URL", "Track URI"]
N_CLUSTERS = 10

# --- Data Loading and Preprocessing ---
df_clean = pd.DataFrame()
scaler = StandardScaler()
kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init='auto')
X_scaled = None

def load_and_preprocess_data():
    global df_clean, X_scaled, scaler, kmeans
    
    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file '{DATA_FILE}' not found in the backend directory.")
        # In a real app, you might raise an exception or handle this more gracefully
        return

    df = pd.read_csv(DATA_FILE)
    
    # Drop rows with missing values in essential columns
    df_clean = df.dropna(subset=AUDIO_FEATURES + METADATA_COLUMNS).copy()
    df_clean.reset_index(drop=True, inplace=True)

    if df_clean.empty:
        print("Error: DataFrame is empty after dropping NaNs. Check your data and feature columns.")
        return

    # Feature Scaling
    X_scaled = scaler.fit_transform(df_clean[AUDIO_FEATURES])
    
    # KMeans Clustering
    df_clean["Cluster"] = kmeans.fit_predict(X_scaled)
    print("Data loaded and model trained successfully.")

# Load data and train model on startup
@app.on_event("startup")
async def startup_event():
    print("Application startup: Loading data and training model...")
    load_and_preprocess_data()
    # Verify df_clean is populated
    if df_clean.empty:
        print("Startup Warning: df_clean is empty after load_and_preprocess_data. Recommendations might not work.")
    else:
        print(f"df_clean populated with {len(df_clean)} tracks.")


# --- API Endpoints ---

# Authentication Endpoints (prefix with /api for clarity)
@app.post("/api/signup", response_model=schemas.UserOut)
async def signup_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = auth.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.get_user_by_email(db, email=form_data.username) # OAuth2 form uses 'username' for email
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserOut)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# Protected Recommendation Endpoints
@app.get("/")
async def root():
    return {"message": "Spotify Recommendation API is running!"}

@app.get("/recommendations/{track_name}")
async def get_recommendations_endpoint(track_name: str, top_n: int = 5, current_user: models.User = Depends(auth.get_current_active_user)):
    global df_clean, scaler

    if df_clean.empty:
        return {"error": "Dataset not loaded or is empty. Cannot provide recommendations."}

    matches = df_clean[df_clean["Track Name"].str.lower() == track_name.lower()]
    
    if matches.empty:
        return {"error": f"Track '{track_name}' not found in dataset."}
    
    song_row = matches.iloc[0]
    input_song_details = song_row[METADATA_COLUMNS].to_dict()
    
    target_cluster = song_row["Cluster"]
    cluster_songs = df_clean[df_clean["Cluster"] == target_cluster].copy()

    if cluster_songs.empty:
         # This case is unlikely if the input song itself is in a cluster
         return {
             "input_song": input_song_details,
             "recommendations": [],
             "message": f"No other songs found in the same cluster as '{track_name}'."
         }

    song_row_scaled_features = scaler.transform(song_row[AUDIO_FEATURES].values.reshape(1, -1))
    cluster_songs_scaled_features = scaler.transform(cluster_songs[AUDIO_FEATURES])
        
    similarities = cosine_similarity(song_row_scaled_features, cluster_songs_scaled_features).flatten()
    cluster_songs["Similarity"] = similarities
    
    recommendations_df = cluster_songs.sort_values(by="Similarity", ascending=False)
    recommendations_df = recommendations_df[recommendations_df["Track URI"] != song_row["Track URI"]]

    input_song_name_lower = song_row["Track Name"].lower()
    input_song_artists_lower = song_row["Artist Name(s)"].lower()
    recommendations_df = recommendations_df[
        ~(
            (recommendations_df["Track Name"].str.lower() == input_song_name_lower) &
            (recommendations_df["Artist Name(s)"].str.lower() == input_song_artists_lower)
        )
    ]
    
    final_recommendations = recommendations_df.head(top_n)[METADATA_COLUMNS + ["Similarity"]].to_dict(orient="records")
    
    return {
        "input_song": input_song_details,
        "recommendations": final_recommendations
    }

@app.get("/search_suggestions/{query}")
async def get_search_suggestions(query: str, limit: int = 10, current_user: models.User = Depends(auth.get_current_active_user)):
    global df_clean
    if df_clean.empty:
        return {"error": "Dataset not loaded or is empty."}
    
    if not query or len(query) < 2: # Avoid overly broad searches
        return []

    # Case-insensitive search for track names containing the query
    suggestions = df_clean[df_clean["Track Name"].str.lower().str.contains(query.lower())]
    
    # Return unique track names and their artist to help differentiate
    # Limiting the number of results
    # We select only a few relevant columns to keep the payload small
    unique_suggestions = suggestions[["Track Name", "Artist Name(s)"]].drop_duplicates().head(limit)
    
    return unique_suggestions.to_dict(orient="records")

# To run this app (from the 'backend' directory):
# uvicorn main:app --reload 