import { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { buildSrc } from '../utils/cloudinary';
import './MobileCategoryHome.css';

const Folder = lazy(() => import('./Folder'));

const MobileCategoryHome = ({ categories = [], onCategorySelect, theme = 'light' }) => {
  const artCategories = useMemo(
    () => categories.filter((category) => category.mode === 'art'),
    [categories]
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => artCategories[0]?.id ?? ''
  );
  const [folderOpen, setFolderOpen] = useState(false);
  const selectedCategory = artCategories.find((category) => category.id === selectedCategoryId) ?? artCategories[0];
  const selectedIndex = Math.max(0, artCategories.findIndex((category) => category.id === selectedCategory?.id));
  const folderItems = useMemo(
    () => (selectedCategory?.items || [])
      .filter((item) => item.image)
      .slice(0, 2)
      .map((item, index) => ({
        title: item.caption || `${selectedCategory.label} ${index + 1}`,
        image: buildSrc(item.image, { w: 640, dprAuto: true }),
        alt: item.caption || `${selectedCategory.label} ${index + 1}`
      })),
    [selectedCategory]
  );

  const chooseCategory = (category) => {
    setSelectedCategoryId(category.id);
    setFolderOpen(false);
  };

  return (
    <div className="mch-root mch-single-root" data-theme={theme}>
      {selectedCategory && (
        <main className="mch-single-layout">
          <header className="mch-single-header">
            <span className="mch-single-kicker">JUBI SATAKA / PORTFOLIO</span>
            <h1>{selectedCategory.label}</h1>
            <span className="mch-single-count">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(artCategories.length).padStart(2, '0')}
            </span>
          </header>

          <nav className="mch-album-selector" aria-label="Chọn album Art">
            {artCategories.map((category, index) => (
              <button
                type="button"
                key={category.id}
                className={category.id === selectedCategory.id ? 'is-selected' : ''}
                aria-pressed={category.id === selectedCategory.id}
                onClick={() => chooseCategory(category)}
              >
                <span>{category.label}</span>
                <span className="mch-selector-number">{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </nav>

          <section className="mch-single-folder-stage" aria-label={`${selectedCategory.label} album`}>
            <Suspense fallback={<span className="mch-folder-loading" aria-hidden="true" />}>
              <Folder
                label={selectedCategory.label}
                items={folderItems}
                mode="flap"
                variant="solid"
                color={selectedIndex % 2 === 0 ? '#d86750' : '#547e75'}
                size={1.04}
                open={folderOpen}
                onOpenChange={setFolderOpen}
                draggable={false}
                zoomOnClick={false}
                peek={false}
                intro={false}
                tilt={0}
                bounce={0.32}
                speed={0.9}
                theme={theme}
                className="mch-react-folder"
              />
            </Suspense>
            {folderOpen && (
              <button
                type="button"
                className="mch-gallery-button"
                onClick={() => onCategorySelect?.(selectedCategory)}
              >
                Mở gallery
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default MobileCategoryHome;
