import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // We'll create this CSS file next

// Placeholder URLs for images - replace with your actual image paths or URLs
const flowchartImageUrl = 'https://via.placeholder.com/600x300.png?text=Project+Flowchart';
const architectureImageUrl = 'https://via.placeholder.com/600x300.png?text=System+Architecture';

function LandingPage() {
  const [selectedCard, setSelectedCard] = useState(null);
  const carouselRef = useRef(null);
  const projectOverviewRef = useRef(null);
  const howItWorksRef = useRef(null);
  const systemArchitectureRef = useRef(null);

  const cardRefs = {
    'project-overview': projectOverviewRef,
    'how-it-works': howItWorksRef,
    'system-architecture': systemArchitectureRef,
  };

  const handleCardClick = (cardId) => {
    setSelectedCard(cardId);
  };

  useEffect(() => {
    if (selectedCard && carouselRef.current && cardRefs[selectedCard]?.current) {
      const cardElement = cardRefs[selectedCard].current;
      const carouselElement = carouselRef.current;

      // Calculate the position to scroll to
      const cardLeft = cardElement.offsetLeft;
      const cardWidth = cardElement.offsetWidth;
      const carouselWidth = carouselElement.offsetWidth;

      // Scroll to center the card
      const scrollPosition = cardLeft - (carouselWidth / 2) + (cardWidth / 2);
      
      carouselElement.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [selectedCard, cardRefs]);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to the Spotify Recommendation Engine</h1>
        <p className="subtitle">Discover new music tailored to your taste!</p>
      </header>

      <div className="info-carousel" ref={carouselRef}>
        <section 
          ref={projectOverviewRef}
          className={`project-overview info-card ${selectedCard === 'project-overview' ? 'selected' : ''}`}
          onClick={() => handleCardClick('project-overview')}
        >
          <h2>Project Overview</h2>
          <p>
            This application provides personalized song recommendations based on audio features of tracks
            you like. It leverages a dataset of thousands of songs, applies machine learning techniques
            (KMeans clustering) to group similar songs, and uses cosine similarity to find the best matches
            within those groups.
          </p>
        </section>

        <section 
          ref={howItWorksRef}
          className={`how-it-works info-card ${selectedCard === 'how-it-works' ? 'selected' : ''}`}
          onClick={() => handleCardClick('how-it-works')}
        >
          <h2>How It Works</h2>
          <div className="flowchart-container">
            <img src={flowchartImageUrl} alt="Project Flowchart" className="responsive-image"/>
            <p className="caption">Fig 1: High-level project flowchart.</p>
          </div>
          <ol className="steps-list">
            <li><strong>Data Input:</strong> You enter a song title.</li>
            <li><strong>Song Search:</strong> The system suggests matching songs from our database.</li>
            <li><strong>Feature Analysis:</strong> The selected song's audio features (e.g., danceability, energy) are analyzed.</li>
            <li><strong>Clustering:</strong> The song is matched to a cluster of musically similar tracks.</li>
            <li><strong>Similarity Calculation:</strong> Cosine similarity ranks songs within the cluster.</li>
            <li><strong>Recommendation Output:</strong> Top N most similar songs are presented to you.</li>
          </ol>
        </section>

        <section 
          ref={systemArchitectureRef}
          className={`system-architecture info-card ${selectedCard === 'system-architecture' ? 'selected' : ''}`}
          onClick={() => handleCardClick('system-architecture')}
        >
          <h2>System Architecture</h2>
          <div className="architecture-container">
            <img src={architectureImageUrl} alt="System Architecture" className="responsive-image"/>
            <p className="caption">Fig 2: Overview of the frontend, backend, and database interaction.</p>
          </div>
          <ul>
            <li><strong>Frontend:</strong> Built with React, providing a user-friendly interface.</li>
            <li><strong>Backend API:</strong> Developed with Python (FastAPI), handling the logic and data processing.</li>
            <li><strong>Database:</strong> A CSV file containing track data and audio features.</li>
            <li><strong>Containerization:</strong> Both frontend and backend are containerized using Docker for easy deployment and scalability.</li>
          </ul>
        </section>
      </div>
      
      <section className="get-started-section">
        <Link to="/recommendations" className="get-started-button">
          Get Started
        </Link>
      </section>
    </div>
  );
}

export default LandingPage; 