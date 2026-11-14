import React, { useState, useEffect } from 'react';
import GlassFolder from '../components/ui/glass-folder-cards';
import ReflectBackground from '../components/lightswind/reflect-background';
import ImageLightbox from '../components/ImageLightbox';
import { categories } from '../data/portfolio';
import './ContactPage.css';

// Đưa các gói chụp lên đầu tiên theo yêu cầu
const shopProducts = [
  {
    id: 'pkg-chup',
    title: 'Gói chụp cơ bản',
    subtitle: 'Phù hợp với các nhu cầu chụp ảnh cá nhân, đời sống, kỷ niệm và concept đơn giản.',
    priceLine: '399.000 🐟 / buổi\nƯu đãi chỉ từ 149.000🐟/h',
    originalPrice: '189.000🐟/h',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790935995/DSC00990.avif',
    art: 'glacier',
    defaultAlbumId: 'chan-dung',
    pricingDetail: {
      title: 'Bảng Giá & Chi Tiết Dịch Vụ — Chụp Ảnh Cá Nhân / Lifestyle',
      tag: 'Gói trọn buổi: 399.000🐟/Buổi (~4 tiếng) · Giá theo giờ: Gốc 189.000🐟/h → Ưu đãi 149.000🐟/h',
      items: [
        'Thời gian chụp: 01 buổi chụp thoải mái (~4 tiếng) hoặc book linh hoạt theo giờ.',
        'Địa điểm: Quán cafe, công viên, đường phố Sài Gòn theo concept yêu thích.',
        'Hỗ trợ bắt khoảnh khắc: Chỉ dẫn tạo dáng theo tính cách Từng Mẫu, Hướng dẫn tạo dáng theo phong cách nhân vật (Cos), tôn nét đẹp riêng của bạn.',
        'Bàn giao: Toàn bộ file gốc độ phân giải cao + 15 đến 20 ảnh blend màu chỉnh sửa theo yêu cầu.',
        '🎁 CHÍNH SÁCH ƯU ĐÃI THEO GIỜ: Giá tiêu chuẩn 189.000🐟/h. ĐẶC BIỆT: Giảm ngay còn 149.000🐟/h khi khách hàng đồng ý hỗ trợ photo toàn quyền sử dụng hình ảnh buổi chụp để quảng bá trên mạng xã hội & portfolio cá nhân.',
      ],
      note: 'Phù hợp: Tả thực, Chân dung nghệ thuật, Kỷ niệm ngày lễ, Sinh nhật, Couple tình cảm, Ảnh đời thường aesthetic.',
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
    originalPrice: 'Theo giờ chỉ từ 259.000 🐟',
    priceLine: 'Ưu đãi chỉ từ 209.000 🐟',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1788545041/Still_2026-09-05_010136_1.3.1.jpg',
    art: 'aurora',
    defaultAlbumId: 'ky-yeu',
    pricingDetail: {
      title: 'Bảng Giá & Quy Trình — Concept Theo Yêu Cầu',
      tag: 'Tùy biến dự án · Từ 499.000 🐟 · Theo giờ: Gốc 259.000 🐟 → Ưu đãi 209.000 🐟',
      items: [
        'Xây dựng Concept riêng: Trao đổi phong cách, bảng màu (color palette), trang phục và đạo cụ phù hợp.',
        'Chọn lọc địa điểm & bối cảnh đặc biệt: Studio chuyên nghiệp, ngoại cảnh thiên nhiên, kiến trúc độc đáo.',
        'Chăm chút từng khung hình: Đo sáng chính xác, định hình mood & tone theo chuẩn Lookbook quốc tế.',
        'Hậu kỳ chuyên sâu: Retouch tỉ mỉ từng chi tiết da (high-end frequency separation), căn chỉnh phom dáng tự nhiên.',
        '🎁 CHÍNH SÁCH ƯU ĐÃI: Giá gốc từ 499.000 🐟. ĐẶC BIỆT: Ưu đãi theo giờ chỉ từ 209.000 🐟 khi trao đổi concept sớm hoặc đồng ý hỗ trợ photo sử dụng hình ảnh quảng bá.',
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
    priceLine: 'Từ 1.899.000 🐟',
    image: 'https://res.cloudinary.com/g55oyjhn/image/upload/v1790936046/DSC01094.avif',
    art: 'dusk',
    defaultAlbumId: 'vincom-mall-cos',
    pricingDetail: {
      title: 'Bảng Giá & Quy Trình — Cinematic Project',
      tag: 'Dự án sản xuất · Từ 1.899.000 🐟',
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

const serviceTerms = [
  {
    title: 'ĐẶT CỌC VÀ THANH TOÁN',
    items: [
      'Khách hàng vui lòng đặt cọc 50% tổng chi phí để giữ lịch. Tiền cọc không hoàn lại nếu bên phía khách hàng tự ý huỷ lịch mà không có lý do bất khả kháng.',
      'Toàn bộ phần còn lại sẽ được hoàn thiện thanh toán sau khi bàn giao ảnh.',
    ],
  },
  {
    title: 'DỜI LỊCH VÀ HUỶ LỊCH',
    items: [
      'Khách hàng có quyền thay đổi lịch miễn phí 1 lần nếu thông báo trước tối thiểu 7 ngày trước buổi chụp. Lịch mới sẽ phụ thuộc vào thời gian trống của photographer.',
      'Trong trường hợp lý do bất khả kháng (thời tiết xấu, sự cố thiên tai/sức khoẻ...), hai bên hỗ trợ dời lịch miễn phí.',
    ],
  },
  {
    title: 'TRẢ SẢN PHẨM VÀ CHỈNH SỬA',
    items: [
      'Ảnh gốc sẽ được trả trong vòng 72h kể từ khi kết thúc buổi chụp.',
      'Ảnh hoàn thiện sẽ được trả theo lịch hẹn trên gói chụp. Thời gian tính từ lúc khách hàng hoàn thành việc chọn ảnh.',
      'Photographer hỗ trợ chỉnh sửa tối đa 3 lần theo Concept/Style ban đầu. Mọi yêu cầu chỉnh sửa quá số lần hoặc thay đổi Concept/Style khác sẽ tính thêm phí.',
    ],
  },
  {
    title: 'BẢN QUYỀN VÀ QUYỀN SỬ DỤNG',
    items: [
      'Toàn bộ bản quyền tác giả hình ảnh thuộc về photographer.',
      'Khách hàng có quyền tự do sử dụng hình ảnh cho mục đích cá nhân và truyền thông cá nhân.',
      'Khách hàng không được cung cấp hình ảnh cho bên thứ ba vì mục đích thương mại khi chưa có sự đồng thuận bằng văn bản từ photographer.',
      'Chính sách quyền hình ảnh quảng bá & Ưu đãi giá chụp theo giờ:',
      '• Giá tiêu chuẩn (Bảo mật riêng tư): 189.000🐟/h — Áp dụng khi khách hàng muốn giữ bảo mật tuyệt đối, photo không đăng tải hoặc sử dụng hình ảnh buổi chụp lên mạng xã hội.',
      '• Giá ưu đãi đồng hành (Giảm còn 149.000🐟/h): Áp dụng khi khách hàng đồng ý hỗ trợ cho phép photo toàn quyền sử dụng hình ảnh đã chụp để đăng tải truyền thông, cập nhật portfolio và quảng bá dịch vụ.',
    ],
  },
  {
    title: 'TÁC PHONG & LƯU TRỮ',
    items: [
      'Thời gian chụp tính từ giờ đã hẹn. Nếu khách hàng đến muộn quá 60 phút kể từ thời gian hẹn, photographer có quyền đơn phương huỷ buổi chụp mà không hoàn lại cọc.',
      'Toàn bộ file ảnh sẽ được lưu trữ trong 60 ngày kể từ ngày bàn giao sản phẩm hoàn thiện cuối cùng. Sau thời gian này, photographer không chịu trách nhiệm nếu file bị thất lạc.',
    ],
  },
];

const ContactPage = ({ theme = 'light', onCategorySelect }) => {
  // activeModal: { type: 'pricing' | 'master', product }
  const [activeModal, setActiveModal] = useState(null);
  // previewImage: { src, alt } | null
  const [previewImage, setPreviewImage] = useState(null);
  // Delay nội dung nặng để GooeyNav animation chạy xong trước (~650ms)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 650);
    return () => clearTimeout(t);
  }, []);

  const handleContact = (product) => {
    window.open('https://zalo.me/0348007036', '_blank', 'noopener,noreferrer');
  };

  const isDark = theme === 'dark';
  const folderTone = isDark ? 'dark' : 'light';

  // Hiển thị giá trên mặt trước của Folder
  const renderFolderMeta = (product) => {
    if (product.id === 'pkg-chup') {
      return (
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
          <span>399.000 🐟 / buổi</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '11px', lineHeight: 1.1 }}>
            189.000🐟/h
          </span>
          <span>Ưu đãi chỉ từ 149.000🐟/h</span>
        </span>
      );
    }
    if (product.id === 'pkg-theo-yeu-cau') {
      return (
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
          <span>Từ 499.000 🐟</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '11px', lineHeight: 1.1 }}>
            Theo giờ chỉ từ 259.000 🐟
          </span>
          <span>Ưu đãi chỉ từ 209.000 🐟</span>
        </span>
      );
    }
    return <span>{product.priceLine}</span>;
  };

  // Hiển thị giá trên nút Bảng giá
  const renderPriceTag = (product) => {
    if (product.id === 'pkg-chup') {
      return (
        <span className="contact-folder-price-tag" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.35, gap: '2px' }}>
          <span>399.000 🐟 / buổi</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '11px', lineHeight: 1.1 }}>
            189.000🐟/h
          </span>
          <span>Ưu đãi chỉ từ 149.000🐟/h</span>
        </span>
      );
    }
    if (product.id === 'pkg-theo-yeu-cau') {
      return (
        <span className="contact-folder-price-tag" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.35, gap: '2px' }}>
          <span>Từ 499.000 🐟</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '11px', lineHeight: 1.1 }}>
            Theo giờ chỉ từ 259.000 🐟
          </span>
          <span>Ưu đãi chỉ từ 209.000 🐟</span>
        </span>
      );
    }
    return (
      <span className="contact-folder-price-tag" style={{ whiteSpace: "pre-line", textAlign: "right", lineHeight: 1.35 }}>
        {product.priceLine}
      </span>
    );
  };

  // Hiển thị giá trong popup Modal
  const renderModalPrice = (product) => {
    if (product.id === 'pkg-chup') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="contact-modal-price" style={{ fontSize: '15px' }}>399.000 🐟 / buổi</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '13px', lineHeight: 1.2 }}>
            189.000🐟/h
          </span>
          <span className="contact-modal-price" style={{ fontSize: '16px' }}>Ưu đãi chỉ từ 149.000🐟/h</span>
        </div>
      );
    }
    if (product.id === 'pkg-theo-yeu-cau') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="contact-modal-price" style={{ fontSize: '15px' }}>Từ 499.000 🐟</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '13px', lineHeight: 1.2 }}>
            Theo giờ chỉ từ 259.000 🐟
          </span>
          <span className="contact-modal-price" style={{ fontSize: '16px' }}>Ưu đãi chỉ từ 209.000 🐟</span>
        </div>
      );
    }
    return (
      <span className="contact-modal-price" style={{ whiteSpace: "pre-line", lineHeight: 1.4 }}>
        {product.priceLine}
      </span>
    );
  };

  const handleSheetSelect = (product, fileIndex) => {
    if (fileIndex === 0) {
      // (1) Mở trực tiếp ảnh mẫu gắn kèm của gói
      setPreviewImage({
        src: product.image,
        alt: `${product.title} - Ảnh mẫu`,
      });
    } else if (fileIndex === 1) {
      setActiveModal({ type: 'pricing', product });
    } else {
      setActiveModal({ type: 'master', product });
    }
  };

  return (
    <div className="contact-page">
      {/* Lightbox xem ảnh mẫu trực tiếp khi bấm vào mục 1 */}
      {previewImage && (
        <ImageLightbox
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
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
                {renderModalPrice(activeModal.product)}
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

        {/* Delay mount GlassFolder đến khi GooeyNav animation xong (~650ms) */}
        {ready && <div className="contact-glass-folders-grid">
          {shopProducts.map((product, idx) => {
            const folderFiles = [
              {
                name: '1. Ảnh mẫu',
                meta: 'Xem ảnh',
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
                    meta={renderFolderMeta(product)}
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
                    meta={renderFolderMeta(product)}
                    tone={folderTone}
                    art={product.art}
                    files={folderFiles}
                    action="none"
                    onFileSelect={(file, fileIndex) => handleSheetSelect(product, fileIndex)}
                    width={280}
                    appear={false}
                  />
                </div>

                <button
                  type="button"
                  className="contact-folder-quick-btn"
                  onClick={() => setActiveModal({ type: 'pricing', product })}
                >
                  <span className="contact-folder-quick-title">Bảng giá</span>
                  {renderPriceTag(product)}
                </button>
              </div>
            );
          })}
        </div>}

        <section className="contact-terms" aria-labelledby="contact-terms-title">
          <h2 className="contact-terms-title" id="contact-terms-title">
            TERMS OF SERVICE
          </h2>
          <ol className="contact-terms-list">
            {serviceTerms.map((section) => (
              <li className="contact-terms-section" key={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
