import { useMemo, useState } from "react";
import {
  DraggableContainer,
  GridBody,
  GridItem,
} from "./ui/infinite-drag-scroll";
import ImageLightbox from "./ImageLightbox";
import { ArrowUpRight } from "lucide-react";
import { buildSrc } from "../utils/cloudinary";

export default function MobileInfiniteScrollHome({
  categories = [],
  allItems = [],
  onCategorySelect,
}) {
  const [activeLightbox, setActiveLightbox] = useState(null); // { index, items, category }

  // Lấy các ảnh ART
  const artItems = useMemo(() => {
    const filtered = allItems.filter((i) => i.mode === "art");
    if (filtered.length > 0) return filtered;
    return allItems;
  }, [allItems]);

  // Chọn danh sách ảnh để lấp đầy grid infinite (18-24 ảnh)
  const displayImages = useMemo(() => {
    if (!artItems || artItems.length === 0) return [];
    // Nếu ít hơn 18 ảnh, lặp lại cho đủ lưới để cuộn vô tận mượt mà
    let result = [...artItems];
    while (result.length < 18) {
      result = [...result, ...artItems];
    }
    return result.slice(0, 24);
  }, [artItems]);

  const handleItemClick = (img, index) => {
    const parentCategory = categories.find((c) => c.id === img.category);
    setActiveLightbox({
      index,
      items: displayImages,
      category: parentCategory || categories[0],
    });
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-[#141414] select-none">
      <DraggableContainer variant="masonry">
        <GridBody>
          {displayImages.map((image, index) => {
            const src = image.image || image.src;
            const optimizedSrc = src ? buildSrc(src, { w: 600, dprAuto: true }) : src;
            const alt = image.caption || image.alt || `Photo ${index + 1}`;

            return (
              <GridItem
                key={`${image.id || index}-${index}`}
                className="relative h-56 w-40 md:h-96 md:w-64 rounded-md overflow-hidden shadow-2xl cursor-pointer"
                onClick={() => handleItemClick(image, index)}
              >
                <img
                  src={optimizedSrc}
                  alt={alt}
                  loading={index < 8 ? "eager" : "lazy"}
                  className="pointer-events-none absolute h-full w-full object-cover select-none"
                  draggable={false}
                />
              </GridItem>
            );
          })}
        </GridBody>
      </DraggableContainer>

      {/* Lightbox hiển thị khi bấm vào xem ảnh lớn, có nút mở gallery album */}
      {activeLightbox && (
        <ImageLightbox
          items={activeLightbox.items}
          initialIndex={activeLightbox.index}
          onClose={() => setActiveLightbox(null)}
          actionButton={
            activeLightbox.category ? (
              <button
                type="button"
                className="mch-lightbox-gallery-btn"
                onClick={() => {
                  const cat = activeLightbox.category;
                  setActiveLightbox(null);
                  onCategorySelect?.(cat);
                }}
              >
                <span>Xem album {activeLightbox.category.label}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}
