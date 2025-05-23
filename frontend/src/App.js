import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RecommendationPage from './components/RecommendationPage';
import './App.css';

const API_BASE_URL = 'http://localhost:8000'; // Our FastAPI backend

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const location = useLocation();

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Fetch search suggestions
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

  // Debounced version of fetchSuggestions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, debouncedFetchSuggestions]);

  // Fetch recommendations
  const fetchRecommendations = async (trackName) => {
    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations([]); // Clear previous recommendations
    setSelectedSong(trackName); // Keep track of what song we are getting recs for

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/${encodeURIComponent(trackName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRecommendations(data || []);
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
    setSearchTerm(suggestion["Track Name"]); // Update search bar with selected suggestion
    setSuggestions([]); // Clear suggestions
    fetchRecommendations(suggestion["Track Name"]);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchTerm) {
        fetchRecommendations(searchTerm);
        setSuggestions([]); // Clear suggestions after submit
    }
  };

  return (
    <div className="App">
      {/* Conditional Nav for returning to LandingPage from RecommendationPage */}
      {location.pathname === '/recommendations' && (
        <nav className="app-nav">
          <Link to="/" className="nav-link-home">Home</Link>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recommendations" element={<RecommendationPage />} />
      </Routes>
      
      <footer className="app-footer">
        <p>Spotify Recommendation Engine © 2024</p>
        {/* Add your GitHub link or other info here */}
        <p>
            <a href="https://github.com/V32V3T/Music-Recommendation-System" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
