import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // We'll create this CSS file next

// Placeholder URLs for images - replace with your actual image paths or URLs
// const flowchartImageUrl = 'https://via.placeholder.com/600x300.png?text=Project+Flowchart'; // REMOVED
// const architectureImageUrl = 'https://via.placeholder.com/600x300.png?text=System+Architecture'; // REMOVED

const heroTexts = [
  "Discover your next favorite song...",
  "Tailored recommendations just for you...",
  "Explore a universe of music..."
];

// New HeroSection Component
function HeroSection() {
  const [typedText, setTypedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = 100; // Medium speed
    const deleteSpeed = 50;
    const delayBeforeDeleting = 2000;
    const delayBeforeTypingNext = 500;

    let timer;

    if (isDeleting) {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setTypedText((prev) => prev.substring(0, prev.length - 1));
          setCharIndex((prev) => prev - 1);
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
        timer = setTimeout(() => {
          // Wait before typing next string
        }, delayBeforeTypingNext);
      }
    } else {
      if (charIndex < heroTexts[currentTextIndex].length) {
        timer = setTimeout(() => {
          setTypedText((prev) => prev + heroTexts[currentTextIndex].charAt(charIndex));
          setCharIndex((prev) => prev + 1);
        }, typeSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDeleting);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, currentTextIndex, isDeleting]);

  return (
    <div className="hero-section">
      {/* Animated background is now global */}
      <div className="synthwave-lines-container">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`synth-line-${i}`} className="synthwave-line" style={{ animationDelay: `${i * 0.1}s` }}></div>
        ))}
      </div>
      <div className="hero-content">
        <h1 className="neon-text-main">TuneFinder</h1> 
        <p className="typed-text">{typedText}<span className="cursor">|</span></p>
        <p className="hero-subtitle">Your Personal Music Discovery Engine</p>
      </div>
    </div>
  );
}

function LandingPage() {
  const [activeCardId, setActiveCardId] = useState(null); // ID of the card to show in the modal
  const [isModalCardFlipped, setIsModalCardFlipped] = useState(false);
  const [activeInfoCardIndex, setActiveInfoCardIndex] = useState(0); // New state for info carousel

  const handleInfoCardClick = (index) => {
    if (index === activeInfoCardIndex) {
      // Card is already centered, trigger modal for details
      handleCardTriggerClick(cardData[index].id);
    } else {
      // Card is not centered, bring it to center
      setActiveInfoCardIndex(index);
      // Reset modal state if a different card is brought to center
      // This prevents an old modal from showing if it was open for another card
      if (activeCardId) {
        setActiveCardId(null);
        setIsModalCardFlipped(false);
      }
    }
  };

  const getInfoCardClass = (index) => {
    const numInfoCards = cardData.length;
    if (numInfoCards === 0) return 'info-card-carousel-item'; // Base class for styling

    const diff = index - activeInfoCardIndex;
    let positionClass = '';

    // This logic is for up to 5 cards (center, 2 left, 2 right)
    // For 3 cards, it will effectively be center, left1, right1.
    if (diff === 0) {
      positionClass = 'card-center';
    } else if (diff === 1 || diff === -(numInfoCards - 1)) {
      positionClass = 'card-right1';
    } else if (diff === -1 || diff === numInfoCards - 1) {
      positionClass = 'card-left1';
    } else if (diff === 2 || diff === -(numInfoCards - 2)) {
      // Only relevant if you have 5+ cards, otherwise will be 'card-hidden'
      positionClass = 'card-right2'; 
    } else if (diff === -2 || diff === numInfoCards - 2) {
      // Only relevant if you have 5+ cards, otherwise will be 'card-hidden'
      positionClass = 'card-left2';
    } else {
      positionClass = 'card-hidden'; // For cards further away or if logic doesn't catch them
    }
    // The base class 'info-card-carousel-item' will be used for common carousel item styling
    // The positional classes are from App.css (card-center, card-left1 etc)
    return `info-card-carousel-item ${positionClass}`;
  };

  const handleCardTriggerClick = (cardId) => {
    setActiveCardId(cardId);
    setTimeout(() => {
      setIsModalCardFlipped(true); // Flip after a short delay
    }, 50); // Small delay like 50ms
  };

  const handleCloseModal = () => {
    setActiveCardId(null);
    setIsModalCardFlipped(false); // Reset flip state when modal is closed
  };

  const handleModalCardClick = () => {
    // This allows flipping the modal card between front and back after it has opened
    setIsModalCardFlipped(!isModalCardFlipped);
  };
  
  // Effect to handle body scroll when modal is active
  useEffect(() => {
    if (activeCardId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Ensure flip state is reset if modal is closed by means other than the button (e.g. future ESC key)
      setIsModalCardFlipped(false);
    }
    // Cleanup function to reset body overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeCardId]);

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
        {/* <div className="flowchart-container">
          <img src={flowchartImageUrl} alt="Project Flowchart" className="responsive-image"/>
          <p className="caption">Fig 1: High-level project flowchart.</p>
        </div> */}
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
      icon: '📐', // Changed icon to Triangular Ruler for a blueprint/drafting feel
      content: (
        <>
        {/* <div className="architecture-container">
          <img src={architectureImageUrl} alt="System Architecture" className="responsive-image"/>
          <p className="caption">Fig 2: Overview of the frontend, backend, and database interaction.</p>
        </div> */}
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

  const activeCardData = activeCardId ? cardData.find(card => card.id === activeCardId) : null;

  return (
    <div className={`landing-page ${activeCardId ? 'modal-active' : ''}`}>
      
      <HeroSection />

      <div className="info-carousel"> {/* This div becomes the carousel container */}
        {cardData.map((card, index) => (
          <div 
            key={card.id} 
            className={getInfoCardClass(index)} // Use new function for dynamic classes
            onClick={() => handleInfoCardClick(index)} // Update active index on click
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleInfoCardClick(index) : null}
          >
            {/* Content for the carousel card - initially title and icon */}
            {/* We might need to adjust content display based on whether it's centered */}
            {card.icon && <div className="info-card-icon">{card.icon}</div>}
            <h2>{card.title}</h2>
            {/* 
              If the card is centered, we could show more details or a 'click for more'.
              Example: activeInfoCardIndex === index && (<p>Click to see details</p>)
              Or, display a snippet of card.content if it's short.
            */}
          </div>
        ))}
      </div>
      
      {activeCardData && (
        <div className="flip-modal-overlay">
          <div className="flip-modal-backdrop" onClick={handleCloseModal}></div>
          <div className="flip-modal-card-wrapper" onClick={handleModalCardClick} role="button" tabIndex={0} 
             onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleModalCardClick() : null }>
            <button className="flip-modal-close-button" onClick={(e) => {e.stopPropagation(); handleCloseModal();}}>X</button>
            <div className={`flip-modal-card ${isModalCardFlipped ? 'is-flipped' : '' }`}>
              <div className="flip-modal-card-front">
                {/* Front content for the modal card - can be simpler or match small card */}
                {activeCardData.icon && <div className="info-card-icon modal-icon">{activeCardData.icon}</div>}
                <h2>{activeCardData.title}</h2>
              </div>
              <div className="flip-modal-card-back">
                <h3>{activeCardData.title}</h3>
                <div className="card-content-wrapper">
                  {activeCardData.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <section className="get-started-section">
        <div className="visualizer-container">
          {/* Create 5 bars for the visualizer */}
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
        </div>
        <Link to="/recommendations" className="get-started-button">
          Get Started
        </Link>
        {/* Optionally, another visualizer container below the button or duplicate for symmetry */}
      </section>
    </div>
  );
}

export default LandingPage; 