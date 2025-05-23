import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // We'll create this CSS file next

// Placeholder URLs for images - replace with your actual image paths or URLs
const flowchartImageUrl = 'https://via.placeholder.com/600x300.png?text=Project+Flowchart';
const architectureImageUrl = 'https://via.placeholder.com/600x300.png?text=System+Architecture';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to the Spotify Recommendation Engine</h1>
        <p className="subtitle">Discover new music tailored to your taste!</p>
      </header>

      <section className="project-overview">
        <h2>Project Overview</h2>
        <p>
          This application provides personalized song recommendations based on audio features of tracks
          you like. It leverages a dataset of thousands of songs, applies machine learning techniques
          (KMeans clustering) to group similar songs, and uses cosine similarity to find the best matches
          within those groups.
        </p>
      </section>

      <section className="how-it-works">
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

      <section className="system-architecture">
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
      
      <section className="get-started-section">
        <Link to="/recommendations" className="get-started-button">
          Get Started
        </Link>
      </section>
    </div>
  );
}

export default LandingPage; 