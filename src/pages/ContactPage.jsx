import React, { useState } from 'react';
import './ContactPage.css';

const shopProducts = [
  {
    id: 'pkg-video',
    title: 'Gói quay video',
    subtitle: 'Phù hợp với quay content, review, cá nhân và các nhu cầu quay đơn giản.',
    intro:
      'Quay video theo nhu cầu như review, content cá nhân, mạng xã hội hoặc các nội dung ngắn. Bao gồm quay và xử lý hậu kỳ cơ bản.',
    priceLine: 'Giá gói quay bao gồm 1 buổi — 450.000 🐟',
    detailTitle: 'Quay Theo Buổi — 450.000 🐟',
    paragraphs: [
      'Quay video theo nhu cầu trong một buổi làm việc. Phù hợp với review, content cá nhân, mạng xã hội, giới thiệu sản phẩm hoặc các nội dung video ngắn.',
      'Gói bao gồm quay video, hỗ trợ bố cục và góc máy trong quá trình thực hiện, lựa chọn những cảnh quay phù hợp và xử lý hậu kỳ cơ bản.',
      'Phù hợp với những nội dung cần hình ảnh chỉn chu nhưng không yêu cầu quá nhiều về kịch bản, sản xuất hoặc kỹ xảo.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1786775685/Tiktok.webp',
  },
  {
    id: 'pkg-cinematic',
    title: 'Gói Cinematic',
    subtitle: 'Dành cho các sản phẩm video cần lên ý tưởng, quay và hậu kỳ theo yêu cầu.',
    intro:
      'Dành cho các dự án video cần đầu tư về ý tưởng, hình ảnh, dựng phim và hậu kỳ theo yêu cầu.',
    priceLine: 'Giá gói quay từ — 700.000 🐟',
    detailTitle: 'Quay Theo Dự Án — từ 700.000 🐟',
    paragraphs: [
      'Dành cho các dự án video có yêu cầu riêng về ý tưởng, hình ảnh, nội dung và hậu kỳ.',
      'Quy trình có thể bao gồm trao đổi ý tưởng, định hướng hình ảnh, chuẩn bị nội dung, quay phim, lựa chọn và xử lý footage, dựng video, chỉnh màu và hoàn thiện sản phẩm.',
      'Phù hợp với video cinematic, video quảng bá, giới thiệu thương hiệu, sản phẩm, cá nhân hoặc những dự án cần đầu tư nhiều hơn về hình ảnh và hậu kỳ.',
    ],
    image:
      'https://res.cloudinary.com/g55oyjhn/image/upload/v1786777034/ef467a0f-d45a-4b3b-9fcc-40bd41d131c9.png',
  },
  {
    id: 'pkg-chup',
    title: 'Gói chụp',
    subtitle: 'Phù hợp với các nhu cầu chụp ảnh cá nhân, đời sống, kỷ niệm và concept đơn giản.',
    intro: 'Chụp ảnh theo buổi — phù hợp kỷ yếu, chân dung hoặc sự kiện đơn giản.',
    priceLine: 'Giá gói chụp bao gồm 1 buổi — 750.000 🐟',
    detailTitle: 'Chụp Theo Buổi — 315.000 🐟',
    paragraphs: [
      'Chụp ảnh theo nhu cầu cá nhân trong một buổi làm việc. Phù hợp với chân dung, lifestyle, ảnh cá nhân, ảnh kỷ niệm hoặc các concept đơn giản.',
      'Gói bao gồm thời gian chụp theo buổi, hỗ trợ lựa chọn góc chụp và bối cảnh phù hợp, chọn lọc ảnh sau buổi chụp và chỉnh màu cơ bản.',
      'Phù hợp với những nhu cầu chụp ảnh đơn giản, không yêu cầu sản xuất hoặc hậu kỳ phức tạp.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1786799001/%C3%A2d_nn.jpg',
  },
  {
    id: 'pkg-theo-yeu-cau',
    title: 'Gói chụp theo yêu cầu',
    subtitle: 'Dành cho các yêu cầu chụp ảnh có concept, kế hoạch hoặc quy mô riêng.',
    intro:
      'Dành cho các dự án chụp có yêu cầu riêng về concept, địa điểm, số lượng người hoặc hậu kỳ.',
    priceLine: 'Giá gói chụp từ — 500.000 🐟',
    detailTitle: 'Chụp Theo Dự Án — từ 500.000 🐟',
    paragraphs: [
      'Dành cho các dự án chụp ảnh có yêu cầu cụ thể về concept, địa điểm, số lượng người, sản phẩm hoặc phong cách hình ảnh.',
      'Gói được xây dựng linh hoạt theo từng dự án, có thể bao gồm trao đổi ý tưởng, định hướng phong cách hình ảnh, lựa chọn bối cảnh, thực hiện buổi chụp, chọn lọc ảnh và hậu kỳ theo yêu cầu.',
      'Phù hợp với các bộ ảnh concept, thời trang, kỷ yếu, couple, sản phẩm, thương hiệu cá nhân hoặc những dự án cần đầu tư nhiều hơn về hình ảnh.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1788545041/Still_2026-09-05_010136_1.3.1.jpg',
  },
];

const ContactPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleContact = (product) => {
    window.open('https://zalo.me/0348007036', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="contact-page">
      {selectedProduct && (
        <div className="contact-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="contact-modal-card" onClick={e => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setSelectedProduct(null)}>
              ← CLOSE
            </button>
            <div className="contact-modal-content">
              <div className="contact-modal-img-wrap">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="contact-modal-img" />
              </div>
              <div className="contact-modal-info">
                <h2 className="contact-modal-title">{selectedProduct.title}</h2>
                <p className="contact-modal-paper contact-modal-intro">
                  {selectedProduct.intro}
                </p>

                <div className="contact-modal-detail">
                  <h3 className="contact-modal-detail-title">{selectedProduct.detailTitle}</h3>
                  {selectedProduct.paragraphs.map((text) => (
                    <p key={text.slice(0, 48)}>{text}</p>
                  ))}
                </div>

                <hr className="contact-modal-divider" />
                <div className="contact-modal-purchase">
                  <button className="contact-modal-btn" onClick={() => handleContact(selectedProduct)}>
                    LIÊN HỆ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="contact-shop-content">
        <h1 className="contact-page-title">CHỤP ẢNH & QUAY PHIM</h1>
        <div className="contact-shop-grid">
          {shopProducts.map((product) => (
            <div
              key={product.id}
              className="contact-shop-card"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="contact-shop-frame">
                <img src={product.image} alt={product.title} className="contact-shop-image" />
              </div>
              <div className="contact-shop-meta">
                <h2 className="contact-shop-item-title">{product.title}</h2>
                <span className="contact-shop-item-sub">{product.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
