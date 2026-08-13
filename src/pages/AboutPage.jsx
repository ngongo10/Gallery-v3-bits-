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
              His work explores identity, mood, and cinematic aesthetics through meticulous composition, vivid color harmony, and GPU-accelerated interactive web presentation.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">CONTACT</h2>
          <div className="about-list">
            <div className="about-list-row">
              <span className="about-item-label">EMAIL</span>
              <a href="mailto:contact@ngothanhsinh.com" className="about-item-value">
                contact@ngothanhsinh.com <span className="about-arrow">↗</span>
              </a>
            </div>

            <div className="about-list-row">
              <span className="about-item-label">INSTAGRAM</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="about-item-value"
              >
                @jubisataka <span className="about-arrow">↗</span>
              </a>
            </div>

            <div className="about-list-row">
              <span className="about-item-label">CURRICULUM VITAE</span>
              <a href="#" className="about-item-value">
                DOWNLOAD CV <span className="about-arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
