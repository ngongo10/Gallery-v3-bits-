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
              Ngô Thành Sinh (JUBISATAKA) là nhiếp ảnh gia hoạt động tại Việt Nam, tập trung vào nhiếp ảnh chân dung và kể chuyện bằng hình ảnh.
            </p>
          </div>
          <div className="about-bio-col">
            <p className="about-bio-text">
              Phong cách hướng đến việc khai thác cảm xúc, tính cách và câu chuyện của nhân vật, với sự chú trọng vào góc nhìn cá nhân, bố cục và tính tự nhiên trong từng khung hình.
            </p>
            <p className="about-bio-text" style={{ marginTop: '1em' }}>
              Song song với nhiếp ảnh, hướng phát triển video ngắn tập trung vào những góc nhìn về con người và đời sống, khai thác các trạng thái tâm lý, sự thay đổi trong tính cách và những câu chuyện mang tính phản ánh.
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
