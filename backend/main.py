from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import os

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
@app.get("/")
async def root():
    return {"message": "Spotify Recommendation API is running!"}

@app.get("/recommendations/{track_name}")
async def get_recommendations_endpoint(track_name: str, top_n: int = 5):
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
async def get_search_suggestions(query: str, limit: int = 10):
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