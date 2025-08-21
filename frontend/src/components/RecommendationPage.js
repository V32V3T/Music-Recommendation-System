import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css'; // We can still use some global styles

import { API_BASE_URL } from '../config';

const recommendationPageHeaderTexts = [
  "Discover Your Next Vibe...",
  "Tuned to Your Taste...",
  "Fresh Tracks Incoming...",
  "Find Hidden Gems..."
];

function RecommendationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [inputSongDetails, setInputSongDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { token } = useContext(AuthContext);

  // State for animated header
  const [typedHeaderText, setTypedHeaderText] = useState('');
  const [currentHeaderPhraseIndex, setCurrentHeaderPhraseIndex] = useState(0);
  const [headerCharIndex, setHeaderCharIndex] = useState(0);
  const [isHeaderDeleting, setIsHeaderDeleting] = useState(false);

  // useEffect for header typing animation
  useEffect(() => {
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const delayBeforeDeleting = 2000;
    const delayBeforeTypingNext = 500;
    let timer;

    if (isHeaderDeleting) {
      if (headerCharIndex > 0) {
        timer = setTimeout(() => {
          setTypedHeaderText((prev) => prev.substring(0, prev.length - 1));
          setHeaderCharIndex((prev) => prev - 1);
        }, deleteSpeed);
      } else {
        setIsHeaderDeleting(false);
        setCurrentHeaderPhraseIndex((prev) => (prev + 1) % recommendationPageHeaderTexts.length);
        timer = setTimeout(() => {
          // Wait before typing next string
        }, delayBeforeTypingNext);
      }
    } else {
      if (headerCharIndex < recommendationPageHeaderTexts[currentHeaderPhraseIndex].length) {
        timer = setTimeout(() => {
          setTypedHeaderText((prev) => prev + recommendationPageHeaderTexts[currentHeaderPhraseIndex].charAt(headerCharIndex));
          setHeaderCharIndex((prev) => prev + 1);
        }, typeSpeed);
      } else {
        timer = setTimeout(() => {
          setIsHeaderDeleting(true);
        }, delayBeforeDeleting);
      }
    }
    return () => clearTimeout(timer);
  }, [headerCharIndex, currentHeaderPhraseIndex, isHeaderDeleting]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const fetchApi = useCallback(async (url, options = {}) => {
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return null;
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        setError("Session expired or invalid. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, [token]);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    setError(null);
    try {
      const data = await fetchApi(`${API_BASE_URL}/search_suggestions/${encodeURIComponent(query)}`);
      if (data) {
        if (data.error) {
          setError(data.error);
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
        }
      }
    } catch (e) {
      console.error("Failed to fetch suggestions:", e);
      if (!error) {
        setError("Failed to load suggestions. Backend might be down or unreachable.");
      }
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [fetchApi, error]);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, debouncedFetchSuggestions]);

  const fetchRecommendations = useCallback(async (trackName) => {
    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations([]);
    setInputSongDetails(null);

    try {
      const data = await fetchApi(`${API_BASE_URL}/recommendations/${encodeURIComponent(trackName)}`);
      if (data) {
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
      }
    } catch (e) {
      console.error("Failed to fetch recommendations:", e);
      if (!error) {
        setError("Failed to load recommendations. Backend might be down or unreachable.");
      }
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [fetchApi, error]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion["Track Name"]);
    setSuggestions([]);
    fetchRecommendations(suggestion["Track Name"]);
    setActiveIndex(0);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchTerm) {
        fetchRecommendations(searchTerm);
        setSuggestions([]);
        setActiveIndex(0);
    }
  };

  const handleCardClick = (index) => {
    setActiveIndex(index);
  };

  const getCardClass = (index) => {
    const numRecommendations = recommendations.length;
    if (numRecommendations === 0) return 'is-vinyl-style';

    const diff = index - activeIndex;
    let positionClass = '';

    if (diff === 0) {
      positionClass = 'card-center';
    } else if (diff === 1 || diff === -(numRecommendations - 1)) {
      positionClass = 'card-right1';
    } else if (diff === -1 || diff === numRecommendations - 1) {
      positionClass = 'card-left1';
    } else if (diff === 2 || diff === -(numRecommendations - 2)) {
      positionClass = 'card-right2';
    } else if (diff === -2 || diff === numRecommendations - 2) {
      positionClass = 'card-left2';
    } else {
      positionClass = 'card-hidden';
    }
    return `recommendation-card is-vinyl-style ${positionClass}`;
  };

  return (
    <div className="recommendation-page-content"> {/* Use a different class if needed for specific styling */}
      <header className="App-header"> {/* You might want a different header or reuse App.css header */}
        <h1>
          {typedHeaderText}
          <span className="cursor">|</span>
        </h1>
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
            <div className="recommendation-card input-song-card is-vinyl-style">
              <div className="vinyl-container">
                <div 
                  className="vinyl-disc"
                  style={{ backgroundImage: `url(${inputSongDetails["Album Image URL"] ? inputSongDetails["Album Image URL"] : 'https://via.placeholder.com/150?text=No+Art'})` }}
                >
                  <div className="vinyl-hole"></div>
                </div>
              </div>
              <div className="song-details">
                <h3>{inputSongDetails["Track Name"]}</h3>
                <p>{inputSongDetails["Artist Name(s)"]}</p>
                <iframe 
                  src={`https://open.spotify.com/embed/track/${inputSongDetails["Track URI"].split(':').pop()}`}
                  width="100%" 
                  height="88"
                  frameBorder="0" 
                  allowtransparency="true" 
                  allow="encrypted-media"
                  title="Spotify Embed Player"
                ></iframe>
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
              {recommendations.map((rec, index) => (
                <div 
                  key={rec["Track URI"]} 
                  className={getCardClass(index)}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="vinyl-container">
                    <div 
                      className="vinyl-disc"
                      style={{ backgroundImage: `url(${rec["Album Image URL"] ? rec["Album Image URL"] : 'https://via.placeholder.com/150?text=No+Art'})` }}
                    >
                      <div className="vinyl-hole"></div>
                    </div>
                  </div>
                  <div className="song-details">
                    <h3>{rec["Track Name"]}</h3>
                    <p>{rec["Artist Name(s)"]}</p>
                    <iframe 
                      src={`https://open.spotify.com/embed/track/${rec["Track URI"].split(':').pop()}`}
                      width="100%" 
                      height="88"
                      frameBorder="0" 
                      allowtransparency="true" 
                      allow="encrypted-media"
                      title="Spotify Embed Player"
                    ></iframe>
                    <a 
                      href={`https://open.spotify.com/track/${rec["Track URI"].split(':').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="spotify-link"
                    >
                      Listen on Spotify
                    </a>
                  </div>
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