import React, { useState, useEffect, useCallback } from 'react';
import '../App.css'; // We can still use some global styles

const API_BASE_URL = 'http://localhost:8000';

function RecommendationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [inputSongDetails, setInputSongDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/search_suggestions/${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setSuggestions([]);
      } else {
        setSuggestions(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch suggestions:", e);
      setError("Failed to load suggestions. Backend might be down or unreachable.");
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, debouncedFetchSuggestions]);

  const fetchRecommendations = async (trackName) => {
    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations([]);
    setInputSongDetails(null);
    setSelectedSong(trackName);

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/${encodeURIComponent(trackName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setInputSongDetails(data.input_song || null);
        setRecommendations(data.recommendations || []);
        if (data.input_song && (!data.recommendations || data.recommendations.length === 0)) {
            
        } else if (!data.input_song && !data.recommendations) {
            setError("Received unexpected data structure from backend.");
        }
      }
    } catch (e) {
      console.error("Failed to fetch recommendations:", e);
      setError("Failed to load recommendations. Backend might be down or unreachable.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion["Track Name"]);
    setSuggestions([]);
    fetchRecommendations(suggestion["Track Name"]);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchTerm) {
        fetchRecommendations(searchTerm);
        setSuggestions([]);
    }
  };

  return (
    <div className="recommendation-page-content"> {/* Use a different class if needed for specific styling */}
      <header className="App-header"> {/* You might want a different header or reuse App.css header */}
        <h1>Spotify Recommendation Engine</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Enter a song name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit" disabled={isLoadingRecommendations || !searchTerm}>
            {isLoadingRecommendations ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
        </form>

        {isLoadingSuggestions && <p>Loading suggestions...</p>}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s, index) => (
              <li key={index} onClick={() => handleSuggestionClick(s)}>
                {s["Track Name"]} - <em>{s["Artist Name(s)"]}</em>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="error-message">Error: {error}</p>}
        
        {inputSongDetails && !isLoadingRecommendations && (
          <div className="input-song-section">
            <h2>You Searched For:</h2>
            <div className="recommendation-card input-song-card">
              {inputSongDetails["Album Image URL"] && (
                <img src={inputSongDetails["Album Image URL"]} alt={inputSongDetails["Track Name"]} />
              )}
              <h3>{inputSongDetails["Track Name"]}</h3>
              <p>{inputSongDetails["Artist Name(s)"]}</p>
              <a 
                href={`https://open.spotify.com/track/${inputSongDetails["Track URI"].split(':').pop()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="spotify-link"
              >
                Listen on Spotify
              </a>
            </div>
          </div>
        )}
        
        {(inputSongDetails && !isLoadingRecommendations && recommendations.length > 0) && (
            <h2 className="recommendations-title">Recommendations for "{inputSongDetails["Track Name"]}"</h2>
        )}

        {inputSongDetails && recommendations.length === 0 && !isLoadingRecommendations && !error && 
            <p className="no-recommendations-message">No recommendations found for "{inputSongDetails["Track Name"]}". Try a different song.</p>
        }
        
        {recommendations.length > 0 && !isLoadingRecommendations && (
          <div className="recommendations">
            <div className="recommendations-grid">
              {recommendations.map((rec) => (
                <div key={rec["Track URI"]} className="recommendation-card">
                  {rec["Album Image URL"] && (
                    <img src={rec["Album Image URL"]} alt={rec["Track Name"]} />
                  )}
                  <h3>{rec["Track Name"]}</h3>
                  <p>{rec["Artist Name(s)"]}</p>
                  <a 
                    href={`https://open.spotify.com/track/${rec["Track URI"].split(':').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotify-link"
                  >
                    Listen on Spotify
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      {/* Footer is now global in App.js */}
    </div>
  );
}

export default RecommendationPage; 