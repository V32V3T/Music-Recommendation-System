import React from 'react';
// import './GlobalAnimatedBackground.css'; // We will create this or move styles to App.css

function GlobalAnimatedBackground() {
  return (
    <div className="global-animated-background">
      {/* Copied from HeroSection: animated notes and shapes */}
      {Array.from({ length: 40 }).map((_, i) => ( // Increased count for shapes
        <div key={`shape-${i}`} className={`shape shape-${i % 5} shape-instance-${i}`}></div>
      ))}
      {['♪', '♫', '♭', '♯', '♩', '♬', '♮','𝄞', '𝄢', '𝆒'].map((note, i) => ( // Increased note variety and count
        <div key={`note-${i}`} className={`musical-note note-instance-${i}`}>{note}</div>
      ))}
       {Array.from({ length: 10 }).map((_, i) => ( // More notes, ensuring unique keys and instance classes
        <div key={`note-add-${i}`} className={`musical-note note-instance-${i + 10}`}>{['♪', '♫', '♭', '♯', '♩', '♬', '♮','𝄞', '𝄢', '𝆒'][i % 10]}</div>
      ))}
    </div>
  );
}

export default GlobalAnimatedBackground; 