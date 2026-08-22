import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-content">
        <h1 className="about-title">ABOUT & CONTACT</h1>

        <div className="about-bio-grid">
          <div className="about-bio-col">
            <p className="about-bio-text">
              Ngo Thanh Sinh (JUBISATAKA) is a contemporary visual artist and photographer based in Vietnam, focusing on high-concept portraiture, cosplay photography, and atmospheric storytelling.
            </p>
          </div>
          <div className="about-bio-col">
            <p className="about-bio-text">
              His work explores identity, mood, and cinematic aesthetics through meticulous composition and vivid color harmony.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">CONTACT</h2>
          <div className="about-list">
            <div className="about-list-row">
              <span className="about-item-label">EMAIL</span>
              <a href="mailto:ngothanhsinh138@gmail.com" className="about-item-value">
                ngothanhsinh138@gmail.com <span className="about-arrow">↗</span>
              </a>
            </div>

            <div className="about-list-row">
              <span className="about-item-label">INSTAGRAM</span>
              <a
                href="https://www.instagram.com/ngothanhsinh136/"
                target="_blank"
                rel="noopener noreferrer"
                className="about-item-value"
              >
                @ngothanhsinh136 <span className="about-arrow">↗</span>
              </a>
            </div>

            <div className="about-list-row">
              <span className="about-item-label">THREADS</span>
              <a
                href="https://www.threads.com/@jubi_sataka138"
                target="_blank"
                rel="noopener noreferrer"
                className="about-item-value"
              >
                @jubi_sataka138 <span className="about-arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
