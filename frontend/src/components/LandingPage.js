import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // We'll create this CSS file next

// Placeholder URLs for images - replace with your actual image paths or URLs
const flowchartImageUrl = 'https://via.placeholder.com/600x300.png?text=Project+Flowchart';
const architectureImageUrl = 'https://via.placeholder.com/600x300.png?text=System+Architecture';

function LandingPage() {
  const [zoomedCardId, setZoomedCardId] = useState(null);

  const handleCardClick = (cardId) => {
    setZoomedCardId(cardId);
  };

  const handleCloseZoom = () => {
    setZoomedCardId(null);
  };

  const cardData = [
    {
      id: 'project-overview',
      title: 'Project Overview',
      icon: '💡', // Placeholder icon
      content: (
        <p>
          This application provides personalized song recommendations based on audio features of tracks
          you like. It leverages a dataset of thousands of songs, applies machine learning techniques
          (KMeans clustering) to group similar songs, and uses cosine similarity to find the best matches
          within those groups.
        </p>
      )
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      icon: '⚙️', // Placeholder icon
      content: (
        <>
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
        </>
      )
    },
    {
      id: 'system-architecture',
      title: 'System Architecture',
      icon: '📊', // Placeholder icon
      content: (
        <>
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
        </>
      )
    }
  ];

  return (
    <div className={`landing-page ${zoomedCardId ? 'zoomed-active' : ''}`}>
      {zoomedCardId && <div className="backdrop" onClick={handleCloseZoom}></div>}
      
      <header className="landing-header">
        <h1>Welcome to the Spotify Recommendation Engine</h1>
        <p className="subtitle">Discover new music tailored to your taste!</p>
      </header>

      <div className="info-carousel">
        {cardData.map(card => (
          <section 
            key={card.id}
            className={`info-card ${card.id} ${zoomedCardId === card.id ? 'zoomed' : ''}`}
            onClick={() => !zoomedCardId && handleCardClick(card.id)}
          >
            {zoomedCardId === card.id && (
              <button className="close-button" onClick={(e) => { e.stopPropagation(); handleCloseZoom();}}>X</button>
            )}
            {/* Display icon only when not zoomed */}
            {!zoomedCardId && card.icon && <div className="info-card-icon">{card.icon}</div>}
            <h2>{card.title}</h2>
            {/* Content wrapper is always rendered but hidden by CSS in default state */}
            <div className="card-content-wrapper">
              {card.content}
            </div>
          </section>
        ))}
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