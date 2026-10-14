import React, { useState } from 'react';
import GlassFolder from '../components/ui/glass-folder-cards';
import ReflectBackground from '../components/lightswind/reflect-background';
import { categories } from '../data/portfolio';
import './ContactPage.css';

// Đưa các gói chụp lên đầu tiên theo yêu cầu
const shopProducts = [
  {
    id: 'pkg-chup',
    title: 'Gói chụp',
    subtitle: 'Phù hợp với các nhu cầu chụp ảnh cá nhân, đời sống, kỷ niệm và concept đơn giản.',
    priceLine: '399.000 🐟 / buổi (149k/h)',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790935995/DSC00990.avif',
    art: 'glacier',
    defaultAlbumId: 'chan-dung',
    pricingDetail: {
      title: 'Bảng Giá & Chi Tiết Dịch Vụ — Chụp Ảnh Cá Nhân / Lifestyle',
      tag: 'Gói chụp buổi: 399.000 🐟 · Hoặc tính theo giờ: 149.000 🐟/h',
      items: [
        'Thời gian chụp: 01 buổi chụp thoải mái (hoặc book linh hoạt theo giờ).',
        'Địa điểm: Quán cafe, công viên, đường phố Sài Gòn, bối cảnh studio hoặc nhà riêng.',
        'Hỗ trợ bắt khoảnh khắc: Hướng dẫn tạo dáng tự nhiên, không gượng gạo, tôn nét đẹp riêng của bạn.',
        'Bàn giao: Toàn bộ file gốc độ phân giải cao + 15 đến 20 ảnh blend màu chỉnh sửa cẩn thận.',
      ],
      note: 'Phù hợp: Chân dung nghệ thuật, Kỷ niệm ngày lễ, Sinh nhật, Couple tình cảm, Ảnh đời thường aesthetic.',
    },
    masterText: {
      headline: 'Chân Dung & Đời Sống — Lưu Giữ Những Khoảnh Khắc Nguyên Bản',
      lead: 'Vẻ đẹp chân thật nhất là vẻ đẹp khi bạn là chính mình: tự do, an nhiên và tràn đầy cảm xúc.',
      sections: [
        {
          title: '01 / NẮM BẮT KHOẢNH KHẮC THẬT (CANDID MOMENTS)',
          content:
            'Thay vì những tư thế tạo dáng rập khuôn cứng nhắc, chúng tôi tạo không khí trò chuyện gần gũi để bắt trọn những nụ cười bất chợt, ánh mắt dịu dàng và những chuyển động tự nhiên nhất của bạn.',
        },
        {
          title: '02 / CHẤT MÀU PHIM TRẦM ẤM & HOÀI NIỆM',
          content:
            'Tone màu được lấy cảm hứng từ phim nhựa analog: độ hạt grain mịn màng, vùng sáng mềm mại và sắc xanh hoài niệm, tạo cảm giác bền vững cùng thời gian.',
        },
        {
          title: '03 / TRỌN VẸN KỶ NIỆM',
          content:
            'Từng bức ảnh sau buổi chụp là một lát cắt ký ức được nâng niu, sẵn sàng để in album photobook hoặc lưu giữ trong thư viện cá nhân.',
        },
      ],
    },
  },
  {
    id: 'pkg-theo-yeu-cau',
    title: 'Gói chụp theo yêu cầu',
    subtitle: 'Dành cho các yêu cầu chụp ảnh có concept, kế hoạch hoặc quy mô riêng.',
    priceLine: 'Từ 499.000 🐟',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1788545041/Still_2026-09-05_010136_1.3.1.jpg',
    art: 'aurora',
    defaultAlbumId: 'ky-yeu',
    pricingDetail: {
      title: 'Bảng Giá & Quy Trình — Concept Theo Yêu Cầu',
      tag: 'Tùy biến dự án · Từ 499.000 🐟',
      items: [
        'Xây dựng Concept riêng: Trao đổi phong cách, bảng màu (color palette), trang phục và đạo cụ phù hợp.',
        'Chọn lọc địa điểm & bối cảnh đặc biệt: Studio chuyên nghiệp, ngoại cảnh thiên nhiên, kiến trúc độc đáo.',
        'Chăm chút từng khung hình: Đo sáng chính xác, định hình mood & tone theo chuẩn Lookbook quốc tế.',
        'Hậu kỳ chuyên sâu: Retouch tỉ mỉ từng chi tiết da (high-end frequency separation), căn chỉnh phom dáng tự nhiên.',
      ],
      note: 'Phù hợp: Thời trang (Fashion Lookbook), Kỷ yếu concept cao cấp, Brand Ambassador, Profile doanh nhân.',
    },
    masterText: {
      headline: 'Concept & Nghệ Thuật Tạo Hình — Tuyên Ngôn Cá Tính Độc Bản',
      lead: 'Mỗi dự án concept là một công trình nghệ thuật thị giác độc lập được may đo riêng cho từng câu chuyện thương hiệu.',
      sections: [
        {
          title: '01 / TƯ DUY NGHỆ THUẬT & ĐỊNH HƯỚNG CONCEPT',
          content:
            'Từ ý tưởng sơ khai, chúng tôi cùng bạn phát triển moodboard hoàn chỉnh: từ ánh sáng tương phản cao (chiaroscuro), sắc thái avant-garde đến sự tối giản tinh tế của phong cách Scandinavian.',
        },
        {
          title: '02 / KỸ THUẬT RETOUCH CHUYÊN SÂU',
          content:
            'Áp dụng quy trình xử lý da chuyên nghiệp (Dodge & Burn, Frequency Separation), giữ nguyên vân da tự nhiên và làm nổi bật chất liệu vải, trang sức một cách sắc nét nhất.',
        },
        {
          title: '03 / BẢN SẮC KHÁC BIỆT',
          content:
            'Kết quả mang lại không chỉ là bộ ảnh đẹp, mà là một tài sản hình ảnh có giá trị truyền thông và khẳng định vị thế thương hiệu cá nhân của bạn.',
        },
      ],
    },
  },
  {
    id: 'pkg-video',
    title: 'Gói quay video',
    subtitle: 'Phù hợp với quay content, review, cá nhân và các nhu cầu quay đơn giản.',
    priceLine: '299.000 🐟 / buổi',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1786775685/Tiktok.webp',
    art: 'ember',
    defaultAlbumId: 'tiec-bai-bien-cos',
    pricingDetail: {
      title: 'Bảng Giá & Chi Tiết Dịch Vụ — Quay Video',
      tag: 'Gói cơ bản · 299.000 🐟 / buổi',
      items: [
        'Thời gian làm việc: 01 buổi (2 - 3 tiếng) linh hoạt theo địa điểm chỉ định.',
        'Thiết bị: Camera chất lượng cao 4K / Full HD, mic thu âm không dây chống ồn.',
        'Hỗ trợ trong buổi quay: Tư vấn góc máy, hướng dẫn cử chỉ/tạo dáng, chọn bối cảnh sáng đẹp.',
        'Sản phẩm bàn giao: 02 - 04 video ngắn hoàn chỉnh (đã dựng, căn màu, âm thanh cơ bản) hoặc toàn bộ raw footage.',
      ],
      note: 'Phù hợp: Content Creator, Reviewer, Shop Online, TikToker, cá nhân xây kênh.',
    },
    masterText: {
      headline: 'Master Storytelling — Video Ngắn Chạm Cảm Xúc',
      lead: 'Trong kỷ nguyên số, một thước phim 30 giây đủ sức truyền tải trọn vẹn phong cách sống và dấu ấn cá nhân của bạn.',
      sections: [
        {
          title: '01 / ĐỊNH HƯỚNG TẦNG HÌNH ẢNH (VISUAL IDENTITY)',
          content:
            'Mỗi khung hình không chỉ đơn thuần là ghi hình, mà là sự cân nhắc tỉ mỉ về nguồn sáng, bố cục đường dẫn và nhịp điệu chuyển động. Chúng tôi kết hợp các góc máy cận và trung để làm nổi bật thần thái tự nhiên nhất.',
        },
        {
          title: '02 / XỬ LÝ HẬU KỲ CHUYÊN NGHIỆP',
          content:
            'Quy trình dựng nhịp theo tiết tấu âm thanh, xử lý dynamic zoom tinh tế và phân giải màu cinematic giúp video của bạn nổi bật giữa dòng tin tức mạng xã hội.',
        },
        {
          title: '03 / TỐI ƯU ĐA NỀN TẢNG',
          content:
            'Tỷ lệ khung hình chuẩn 9:16 cho Reels / TikTok / Shorts với bitrate sắc nét, đảm bảo không bị suy giảm chất lượng khi đăng tải.',
        },
      ],
    },
  },
  {
    id: 'pkg-cinematic',
    title: 'Gói Cinematic',
    subtitle: 'Dành cho các sản phẩm video cần lên ý tưởng, quay và hậu kỳ theo yêu cầu.',
    priceLine: 'Từ 1.799.000 🐟',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790936046/DSC01094.avif',
    art: 'dusk',
    defaultAlbumId: 'vincom-mall-cos',
    pricingDetail: {
      title: 'Bảng Giá & Quy Trình — Cinematic Project',
      tag: 'Dự án sản xuất · Từ 1.799.000 🐟',
      items: [
        'Họp ý tưởng & Moodboard: Thảo luận concept, xây dựng kịch bản phân cảnh (storyboard chi tiết).',
        'Thiết bị điện ảnh: Ống kính prime/cinema, hệ thống gimbal ổn định, đèn studio setup ánh sáng chuyên sâu.',
        'Color Grading chuẩn Hollywood: Phối màu theo tông LUT độc quyền, tách lớp màu da và background.',
        'Sound Design & Sound Effects: Phối hợp nhạc nền có bản quyền và hiệu ứng âm thanh môi trường sống động.',
      ],
      note: 'Phù hợp: Fashion film, MV ca nhạc, Video thương hiệu cá nhân, Phim ngắn nghệ thuật, Brand Story.',
    },
    masterText: {
      headline: 'Điện Ảnh Hóa Từng Khung Hình — Nghệ Thuật Kể Chuyện Bằng Ánh Sáng',
      lead: 'Không chỉ là quay phim, đây là sự hòa quyện giữa ngôn ngữ điện ảnh, tâm lý nhân vật và triết lý thẩm mỹ đương đại.',
      sections: [
        {
          title: '01 / NGÔN NGỮ ĐIỆN ẢNH & NHỊP ĐIỆU CẢM XÚC',
          content:
            'Mỗi chuyển động của máy quay (camera movement) đều mang một ý đồ biểu đạt: những cú tracking tĩnh lặng, tilt-up kiêu hãnh hay góc nghiêng dutch-angle nội tâm. Tất cả phục vụ cho thông điệp cốt lõi của bạn.',
        },
        {
          title: '02 / NGHỆ THUẬT COLOR GRADING ĐA LỚP',
          content:
            'Màu sắc là linh hồn của Cinematic. Chúng tôi sử dụng bảng màu điện ảnh với độ sâu tương phản mềm, giữ trọn sắc thái da tự nhiên và làm nổi bật chiều sâu không gian ba chiều.',
        },
        {
          title: '03 / HOÀN THIỆN ĐẦU RA 4K DCI',
          content:
            'Master xuất file chuẩn DCI 4K HDR, sẵn sàng trình chiếu sự kiện, màn hình lớn cũng như truyền thông cao cấp trên mọi nền tảng kỹ thuật số.',
        },
      ],
    },
  },
];

const ContactPage = ({ theme = 'light', onCategorySelect }) => {
  // activeModal: { type: 'album' | 'pricing' | 'master', product }
  const [activeModal, setActiveModal] = useState(null);

  const handleContact = (product) => {
    window.open('https://zalo.me/0348007036', '_blank', 'noopener,noreferrer');
  };

  const isDark = theme === 'dark';
  const folderTone = isDark ? 'dark' : 'light';

  const handleSheetSelect = (product, fileIndex) => {
    if (fileIndex === 0) {
      setActiveModal({ type: 'album', product });
    } else if (fileIndex === 1) {
      setActiveModal({ type: 'pricing', product });
    } else {
      setActiveModal({ type: 'master', product });
    }
  };

  const handleOpenAlbumGallery = (album) => {
    setActiveModal(null);
    if (onCategorySelect) {
      onCategorySelect(album);
    }
  };

  return (
    <div className="contact-page">
      {/* 1. ALBUM SHOWCASE MODAL (SHOW CÁC ALBUM RA Ở MỤC 1) */}
      {activeModal && activeModal.type === 'album' && (
        <div className="contact-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="contact-modal-card contact-modal-card--album" onClick={(e) => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setActiveModal(null)}>
              ← ĐÓNG
            </button>
            <div className="contact-album-modal-header">
              <span className="contact-pricing-badge">PORTFOLIO VISUAL GALLERY</span>
              <h2 className="contact-album-modal-title">Các Album Mẫu — {activeModal.product.title}</h2>
              <p className="contact-album-modal-desc">
                Chọn một album bên dưới để xem bộ sưu tập chi tiết hoặc đặt lịch buổi chụp tương tự.
              </p>
            </div>

            {/* Showcase lưới các album */}
            <div className="contact-albums-grid-showcase">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="contact-album-card-item"
                  onClick={() => handleOpenAlbumGallery(cat)}
                >
                  <div className="contact-album-cover-wrap">
                    <img src={cat.cover} alt={cat.label} className="contact-album-cover-img" loading="lazy" />
                    <span className="contact-album-items-count">{cat.items?.length || 0} ảnh</span>
                  </div>
                  <div className="contact-album-card-info">
                    <h4 className="contact-album-name">{cat.label}</h4>
                    <span className="contact-album-open-link">Xem Album &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-album-footer-actions">
              <button
                className="contact-modal-btn"
                onClick={() => handleContact(activeModal.product)}
              >
                LIÊN HỆ TƯ VẤN GÓI NÀY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRICING & SERVICES MODAL */}
      {activeModal && activeModal.type === 'pricing' && (
        <div className="contact-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="contact-modal-card contact-modal-card--pricing" onClick={(e) => e.stopPropagation()}>
            {/* Lớp ReflectBackground gợn sóng tinh tế, nhẹ nhàng */}
            <div className="contact-subtle-reflect-bg" aria-hidden="true">
              <ReflectBackground backdropBlurAmount="2xl" />
            </div>

            <button className="contact-modal-close" onClick={() => setActiveModal(null)}>
              ← ĐÓNG
            </button>
            <div className="contact-pricing-modal-body">
              <span className="contact-pricing-badge">{activeModal.product.pricingDetail.tag}</span>
              <h2 className="contact-pricing-title">{activeModal.product.pricingDetail.title}</h2>
              <ul className="contact-pricing-list">
                {activeModal.product.pricingDetail.items.map((item, idx) => (
                  <li key={idx} className="contact-pricing-item">
                    <span className="contact-pricing-check">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="contact-pricing-note">
                <strong>Ghi chú:</strong> {activeModal.product.pricingDetail.note}
              </div>
              <div className="contact-modal-purchase" style={{ marginTop: 24 }}>
                <span className="contact-modal-price">{activeModal.product.priceLine}</span>
                <button className="contact-modal-btn" onClick={() => handleContact(activeModal.product)}>
                  TƯ VẤN & BÁO GIÁ ZALO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MASTER EDITORIAL MODAL */}
      {activeModal && activeModal.type === 'master' && (
        <div className="contact-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="contact-modal-card contact-modal-card--master" onClick={(e) => e.stopPropagation()}>
            {/* Lớp ReflectBackground nhẹ nhàng, thanh lịch dưới nền giấy mỹ thuật */}
            <div className="contact-subtle-reflect-bg contact-subtle-reflect-bg--master" aria-hidden="true">
              <ReflectBackground backdropBlurAmount="3xl" />
            </div>

            {/* Nếp gấp gập góc tài liệu designer (Dog-ear folded corner) */}
            <div className="contact-document-fold" aria-hidden="true" />
            <div className="contact-document-fold-edge" aria-hidden="true" />

            <button className="contact-modal-close" onClick={() => setActiveModal(null)}>
              ← ĐÓNG
            </button>

            <div className="contact-master-content-body">
              <div className="contact-master-badge">MASTER EDITORIAL & ART DIRECTION</div>
              <h1 className="contact-master-headline">{activeModal.product.masterText.headline}</h1>
              <p className="contact-master-lead">{activeModal.product.masterText.lead}</p>

              <hr className="contact-master-divider" />

              <div className="contact-master-sections">
                {activeModal.product.masterText.sections.map((sec, i) => (
                  <div key={i} className="contact-master-sec-block">
                    <h3 className="contact-master-sec-title">{sec.title}</h3>
                    <p className="contact-master-sec-desc">{sec.content}</p>
                  </div>
                ))}
              </div>

              <div className="contact-master-actions">
                <button className="contact-modal-btn" onClick={() => handleContact(activeModal.product)}>
                  TRAO ĐỔI Ý TƯỞNG CÙNG EKIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOP GRID WITH 2 COLUMNS ON MOBILE & ACTION="NONE" (KHÔNG BUTTON 3 CHẤM, FILE NHÔ SẴN) */}
      <div className="contact-shop-content">
        <div className="contact-header-section">
          <h1 className="contact-page-title">CHỤP ẢNH & QUAY PHIM</h1>
          <p className="contact-page-subtitle">
            Khám phá 3 tài liệu trong mỗi gói: Album ảnh mẫu, Bảng giá chi tiết và Master text nghệ thuật.
          </p>
        </div>

        <div className="contact-glass-folders-grid">
          {shopProducts.map((product, idx) => {
            const folderFiles = [
              {
                name: '1. Album Mẫu & Visuals',
                meta: 'Xem các Album mẫu',
                image: product.image,
              },
              {
                name: '2. Bảng Giá & Chi Tiết',
                meta: product.priceLine,
                art: product.art,
              },
              {
                name: '3. Master Editorial Story',
                meta: 'Nội dung định hướng',
              },
            ];

            return (
              <div key={product.id} className="contact-glass-folder-wrapper">
                <div className="contact-folder-desktop-view">
                  <GlassFolder
                    label={product.title}
                    meta={product.priceLine}
                    tone={folderTone}
                    art={product.art}
                    files={folderFiles}
                    action="none"
                    onFileSelect={(file, fileIndex) => handleSheetSelect(product, fileIndex)}
                    width={310}
                    appear={true}
                    appearDelay={idx * 60}
                  />
                </div>
                <div className="contact-folder-mobile-view">
                  <GlassFolder
                    label={product.title}
                    meta={product.priceLine}
                    tone={folderTone}
                    art={product.art}
                    files={folderFiles}
                    action="none"
                    onFileSelect={(file, fileIndex) => handleSheetSelect(product, fileIndex)}
                    width={182}
                    appear={false}
                  />
                </div>

                <button
                  type="button"
                  className="contact-folder-quick-btn"
                  onClick={() => setActiveModal({ type: 'pricing', product })}
                >
                  <span className="contact-folder-quick-title">Bảng giá</span>
                  <span className="contact-folder-price-tag">{product.priceLine}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
