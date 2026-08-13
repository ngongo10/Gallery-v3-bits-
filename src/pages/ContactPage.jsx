import React, { useState } from 'react';
import { allItems } from '../data/portfolio';
import './ContactPage.css';

const shopProducts = [
  {
    id: 'print-01',
    title: 'GRADUATION NO. 1',
    type: 'ARCHIVAL PIGMENT PRINT',
    paper: 'Hahnemühle Photo Rag 308gsm',
    price: 450000,
    image: allItems[0]?.image,
    sizes: ['16 x 20 in (Edition of 10)', '24 x 30 in (Edition of 5)']
  },
  {
    id: 'print-02',
    title: 'SUMMER MERMAID NO. 2',
    type: 'SILVER GELATIN PRINT',
    paper: 'Foma Fomabrom Variant 111',
    price: 600000,
    image: allItems[10]?.image,
    sizes: ['20 x 24 in (Edition of 7)']
  },
  {
    id: 'print-03',
    title: 'YAO GUANG COSPLAY NO. 3',
    type: 'FINE ART METALLIC PRINT',
    paper: 'Canson Infinity Baryta Prestige',
    price: 750000,
    image: allItems[20]?.image,
    sizes: ['24 x 36 in (Edition of 3)']
  },
  {
    id: 'print-04',
    title: 'ROXY MIGURDIA NO. 4',
    type: 'ARCHIVAL PIGMENT PRINT',
    paper: 'Hahnemühle Photo Rag 308gsm',
    price: 520000,
    image: allItems[30]?.image,
    sizes: ['16 x 20 in (Edition of 10)']
  }
];

const ContactPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleContact = (product) => {
    window.location.href = `mailto:contact@ngothanhsinh.com?subject=Interested in ${product.title}`;
  };

  return (
    <div className="contact-page">
      {/* Product Detail Modal */}
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
                <span className="contact-modal-type">{selectedProduct.type}</span>
                <h2 className="contact-modal-title">{selectedProduct.title}</h2>
                <p className="contact-modal-paper">{selectedProduct.paper}</p>
                <hr className="contact-modal-divider" />
                <div className="contact-modal-purchase">
                  <span className="contact-modal-price">{selectedProduct.price.toLocaleString('vi-VN')} VND</span>
                  <button className="contact-modal-btn" onClick={() => handleContact(selectedProduct)}>
                    LIÊN HỆ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Prints Shop Grid */}
      <div className="contact-shop-content">
        <h1 className="contact-page-title">PRINTS SHOP & CONTACT</h1>
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
                <span className="contact-shop-item-sub">
                  {product.type} — {product.price.toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
