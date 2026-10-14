import React, { useState } from 'react';
import GlassFolder from '../components/ui/glass-folder-cards';
import './ContactPage.css';

const shopProducts = [
  {
    id: 'pkg-video',
    title: 'Gói quay video',
    subtitle: 'Phù hợp với quay content, review, cá nhân và các nhu cầu quay đơn giản.',
    intro:
      'Quay video theo nhu cầu như review, content cá nhân, mạng xã hội hoặc các nội dung ngắn. Bao gồm quay và xử lý hậu kỳ cơ bản.',
    priceLine: '299.000 🐟 / buổi',
    detailTitle: 'Quay Theo Buổi — 299.000 🐟',
    paragraphs: [
      'Quay video theo nhu cầu trong một buổi làm việc. Phù hợp với review, content cá nhân, mạng xã hội, giới thiệu sản phẩm hoặc các nội dung video ngắn.',
      'Gói bao gồm quay video, hỗ trợ bố cục và góc máy trong quá trình thực hiện, lựa chọn những cảnh quay phù hợp và xử lý hậu kỳ cơ bản.',
      'Phù hợp với những nội dung cần hình ảnh chỉn chu nhưng không yêu cầu quá nhiều về kịch bản, sản xuất hoặc kỹ xảo.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1786775685/Tiktok.webp',
    art: 'ember',
    files: [
      {
        name: 'Tiktok / Reels',
        meta: 'Short-form · 9:16',
        image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1786775685/Tiktok.webp',
      },
      {
        name: 'Review Cá Nhân',
        meta: 'Vlog · 1 buổi',
        art: 'ember',
      },
      {
        name: 'Hậu kỳ cơ bản',
        meta: 'Color & Cut',
      },
    ],
  },
  {
    id: 'pkg-cinematic',
    title: 'Gói Cinematic',
    subtitle: 'Dành cho các sản phẩm video cần lên ý tưởng, quay và hậu kỳ theo yêu cầu.',
    intro:
      'Dành cho các dự án video cần đầu tư về ý tưởng, hình ảnh, dựng phim và hậu kỳ theo yêu cầu.',
    priceLine: 'Từ 1.799.000 🐟',
    detailTitle: 'Quay Theo Dự Án — từ 1.799.000 🐟',
    paragraphs: [
      'Dành cho các dự án video có yêu cầu riêng về ý tưởng, hình ảnh, nội dung và hậu kỳ.',
      'Quy trình có thể bao gồm trao đổi ý tưởng, định hướng hình ảnh, chuẩn bị nội dung, quay phim, lựa chọn và xử lý footage, dựng video, chỉnh màu và hoàn thiện sản phẩm.',
      'Phù hợp với video cinematic, video quảng bá, giới thiệu thương hiệu, sản phẩm, cá nhân hoặc những dự án cần đầu tư nhiều hơn về hình ảnh và hậu kỳ.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790936046/DSC01094.avif',
    art: 'dusk',
    files: [
      {
        name: 'Cinematic Visual',
        meta: '4K Footage',
        image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790936046/DSC01094.avif',
      },
      {
        name: 'Kịch bản & Storyboard',
        meta: 'Concept planning',
        art: 'dusk',
      },
      {
        name: 'Color Grading & Sound',
        meta: 'Master edit',
      },
    ],
  },
  {
    id: 'pkg-chup',
    title: 'Gói chụp',
    subtitle: 'Phù hợp với các nhu cầu chụp ảnh cá nhân, đời sống, kỷ niệm và concept đơn giản.',
    intro: 'Chụp ảnh theo buổi — phù hợp kỷ yếu, chân dung hoặc sự kiện đơn giản.',
    priceLine: '399.000 🐟 / buổi (149k/h)',
    detailTitle: 'Chụp Theo Buổi — 399.000 🐟',
    detailSubtitle: 'Chụp Theo Giờ — 149.000 🐟/h',
    paragraphs: [
      'Chụp ảnh theo nhu cầu cá nhân trong một buổi làm việc. Phù hợp với chân dung, lifestyle, ảnh cá nhân, ảnh kỷ niệm hoặc các concept đơn giản.',
      'Gói bao gồm thời gian chụp theo buổi, hỗ trợ lựa chọn góc chụp và bối cảnh phù hợp, chọn lọc ảnh sau buổi chụp và chỉnh màu cơ bản.',
      'Phù hợp với những nhu cầu chụp ảnh đơn giản, không yêu cầu sản xuất hoặc hậu kỳ phức tạp.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790935995/DSC00990.avif',
    art: 'glacier',
    files: [
      {
        name: 'Chân dung cá nhân',
        meta: 'Portrait · Natural',
        image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790935995/DSC00990.avif',
      },
      {
        name: 'Kỷ yếu & Đời sống',
        meta: 'Lifestyle vibes',
        art: 'glacier',
      },
      {
        name: 'Blend màu chuẩn',
        meta: 'All selected files',
      },
    ],
  },
  {
    id: 'pkg-theo-yeu-cau',
    title: 'Gói chụp theo yêu cầu',
    subtitle: 'Dành cho các yêu cầu chụp ảnh có concept, kế hoạch hoặc quy mô riêng.',
    intro:
      'Dành cho các dự án chụp có yêu cầu riêng về concept, địa điểm, số lượng người hoặc hậu kỳ.',
    priceLine: 'Từ 499.000 🐟',
    detailTitle: 'Chụp Theo Dự Án — từ 499.000 🐟',
    paragraphs: [
      'Dành cho các dự án chụp ảnh có yêu cầu cụ thể về concept, địa điểm, số lượng người, sản phẩm hoặc phong cách hình ảnh.',
      'Gói được xây dựng linh hoạt theo từng dự án, có thể bao gồm trao đổi ý tưởng, định hướng phong cách hình ảnh, lựa chọn bối cảnh, thực hiện buổi chụp, chọn lọc ảnh và hậu kỳ theo yêu cầu.',
      'Phù hợp với các bộ ảnh concept, thời trang, kỷ yếu, couple, sản phẩm, thương hiệu cá nhân hoặc những dự án cần đầu tư nhiều hơn về hình ảnh.',
    ],
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1788545041/Still_2026-09-05_010136_1.3.1.jpg',
    art: 'aurora',
    files: [
      {
        name: 'Concept & Fashion',
        meta: 'Editorial look',
        image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1788545041/Still_2026-09-05_010136_1.3.1.jpg',
      },
      {
        name: 'Lookbook & Brand',
        meta: 'Custom art direction',
        art: 'aurora',
      },
      {
        name: 'Retouch chuyên sâu',
        meta: 'High-end beauty retouch',
      },
    ],
  },
];

const ContactPage = ({ theme = 'light' }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleContact = (product) => {
    window.open('https://zalo.me/0348007036', '_blank', 'noopener,noreferrer');
  };

  const isDark = theme === 'dark';
  const folderTone = isDark ? 'dark' : 'light';

  return (
    <div className="contact-page">
      {selectedProduct && (
        <div className="contact-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="contact-modal-card" onClick={(e) => e.stopPropagation()}>
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
                  {selectedProduct.detailSubtitle && (
                    <h4 className="contact-modal-detail-subtitle">{selectedProduct.detailSubtitle}</h4>
                  )}
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
        <div className="contact-header-section">
          <h1 className="contact-page-title">CHỤP ẢNH & QUAY PHIM</h1>
          <p className="contact-page-subtitle">
            Chọn gói dịch vụ bên dưới để xem chi tiết hoặc liên hệ tư vấn trực tiếp.
          </p>
        </div>

        <div className="contact-glass-folders-grid">
          {shopProducts.map((product, idx) => (
            <div key={product.id} className="contact-glass-folder-wrapper">
              <GlassFolder
                label={product.title}
                meta={product.priceLine}
                tone={folderTone}
                art={product.art}
                image={product.image}
                files={product.files}
                action="more"
                menu={[
                  {
                    label: 'Xem chi tiết gói',
                    onSelect: () => setSelectedProduct(product),
                  },
                  {
                    label: 'Liên hệ đặt lịch (Zalo)',
                    onSelect: () => handleContact(product),
                  },
                ]}
                onFileSelect={() => setSelectedProduct(product)}
                width={300}
                appear={true}
                appearDelay={idx * 120}
              />
              <button
                type="button"
                className="contact-folder-quick-btn"
                onClick={() => setSelectedProduct(product)}
              >
                <span>Xem chi tiết</span>
                <span className="contact-folder-price-tag">{product.priceLine}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
