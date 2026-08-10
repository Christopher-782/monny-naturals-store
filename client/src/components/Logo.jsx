import { BRAND_LOGO_URL } from '../config';
import { useContent } from '../context/ContentContext';

export default function Logo({ compact = false }) {
  const { store } = useContent();
  const brandName = store?.brandName || 'Monny Naturals';

  return (
    <div
      className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`}
      aria-label={brandName}
    >
      <img
        src={BRAND_LOGO_URL}
        alt={`${brandName} logo`}
        className="brand-logo-image"
        loading="eager"
        decoding="async"
        draggable="false"
      />
    </div>
  );
}
