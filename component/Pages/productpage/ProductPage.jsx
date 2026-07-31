import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import ReactImageMagnify from 'react-image-magnify';
import {
  FiRotateCcw,
  FiTruck,
  FiShield,
  FiMapPin,
  FiLock,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiPackage,
  FiChevronDown
} from 'react-icons/fi';
import '@/styles/zoom-magnify.css';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600?text=No+Image';
const MODEL_VIEWER_SCRIPT = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

const loadExternalScript = (src) => new Promise((resolve, reject) => {
  if (typeof document === 'undefined') {
    reject(new Error('Document is not available'));
    return;
  }

  if (document.querySelector(`script[src="${src}"]`)) {
    resolve();
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = resolve;
  script.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.body.appendChild(script);
});

const formatPrice = (value) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(numericValue);
};

const extractImageUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object') {
    return img.url || img.src || img.image || img.path || img.thumb || img.thumbnail || '';
  }
  return '';
};

const normalizeImageList = (value) => {
  if (value == null) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      return normalizeImageList(JSON.parse(trimmed));
    } catch {
      return [trimmed];
    }
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeImageList(item));
  }
  if (typeof value === 'object') {
    if (value.url || value.src || value.image || value.path || value.thumb || value.thumbnail) {
      return [extractImageUrl(value)].filter(Boolean);
    }
    if (value.images) return normalizeImageList(value.images);
    return Object.values(value).flatMap((item) => normalizeImageList(item));
  }
  return [];
};

const normalizeVariantItem = (item, kind, index) => {
  if (typeof item === 'string') {
    return kind === 'size'
      ? { label: item, name: item, value: item }
      : { name: item, label: item, swatchImg: '', images: [] };
  }
  if (!item || typeof item !== 'object') {
    return kind === 'size'
      ? { label: `Size ${index + 1}`, name: `Size ${index + 1}`, value: `Size ${index + 1}` }
      : { name: `Variant ${index + 1}`, label: `Variant ${index + 1}`, swatchImg: '', images: [] };
  }

  const normalized = { ...item };
  if (kind === 'size') {
    normalized.label = normalized.label || normalized.name || normalized.value || normalized.size || `Size ${index + 1}`;
    normalized.name = normalized.name || normalized.label;
    normalized.value = normalized.value || normalized.name || normalized.label;
    normalized.price = normalized.price ?? normalized.amount ?? normalized.cost ?? null;
    normalized.mrp = normalized.mrp ?? normalized.originalPrice ?? normalized.listPrice ?? null;
    return normalized;
  }

  normalized.name = normalized.name || normalized.label || normalized.color || normalized.variant || `Variant ${index + 1}`;
  normalized.label = normalized.label || normalized.name;
  normalized.images = normalizeImageList(normalized.images || normalized.image || normalized.img || normalized.gallery || normalized.urls || normalized.media);
  normalized.swatchImg = extractImageUrl(normalized.swatchImg || normalized.thumb || normalized.thumbnail || normalized.image || normalized.img) || normalized.images[0] || '';
  normalized.price = normalized.price ?? normalized.amount ?? normalized.cost ?? null;
  normalized.mrp = normalized.mrp ?? normalized.originalPrice ?? normalized.listPrice ?? null;
  normalized.modelUrl = normalized.modelUrl || normalized.model || normalized.glb || normalized.gltf || normalized.threeDModel || '';
  return normalized;
};

const normalizeVariantList = (value, kind = 'color') => {
  if (value == null) return [];
  if (typeof value === 'string') {
    try {
      return normalizeVariantList(JSON.parse(value), kind);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizeVariantItem(item, kind, index));
  }
  if (typeof value === 'object') {
    if (value.name || value.label || value.color || value.images || value.image || value.price || value.mrp || value.size || value.value) {
      return [normalizeVariantItem(value, kind, 0)];
    }
    return Object.entries(value).map(([name, item], index) => normalizeVariantItem(typeof item === 'object' ? { ...item, name } : { name, value: item }, kind, index));
  }
  return [];
};

const normalizeCustomAttributes = (value) => {
  if (value == null) return [];
  if (typeof value === 'string') {
    try {
      return normalizeCustomAttributes(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const rawOptions = Array.isArray(item?.options) ? item.options : [];
      return {
        title: item?.title || item?.name || item?.label || `Option ${index + 1}`,
        options: rawOptions.map((option, optionIndex) => ({
          label: option?.label || option?.name || `Option ${optionIndex + 1}`,
          priceModifier: Number(option?.priceModifier ?? option?.price ?? 0),
          mrpModifier: Number(option?.mrpModifier ?? option?.mrp ?? 0),
          stock: Number(option?.stock ?? option?.inventory ?? 0),
          ...option
        }))
      };
    }).filter((attr) => Array.isArray(attr.options) && attr.options.length > 0);
  }
  return [];
};

const normalizeProduct = (item) => {
  const base = item || {};
  const rawImages = normalizeImageList(base.images || base.gallery || base.productImages || base.image || []);
  const colors = normalizeVariantList(base.colors || base.color || base.variants || [], 'color');
  const sizes = normalizeVariantList(base.sizes || base.size || [], 'size');
  const fallbackVariant = {
    name: 'Standard',
    label: 'Standard',
    images: rawImages.length ? rawImages : [PLACEHOLDER_IMAGE],
    swatchImg: rawImages[0] || PLACEHOLDER_IMAGE,
    price: base.price ?? base.sellingPrice ?? 0,
    mrp: base.mrp ?? base.originalPrice ?? 0,
    modelUrl: base.modelUrl || base.model || base.glb || base.gltf || base.threeDModel || ''
  };

  return {
    title: base.title || base.name || base.productName || 'Product Name',
    brand: base.brand || base.manufacturer || 'Aaramdehi',
    price: base.price ?? base.sellingPrice ?? 0,
    mrp: base.mrp ?? base.originalPrice ?? base.listPrice ?? 0,
    discountPercent: base.discountPercent ?? base.discount ?? 0,
    deliveryDate: base.deliveryDate || 'Sunday, 2 August',
    location: base.location || 'Meerut 250001',
    subtitle: base.subtitle || base.category || base.tagline || 'Premium comfort',
    description: base.description || base.shortDescription || 'High quality microfiber design with premium finishing for everyday use.',
    images: rawImages,
    colors: colors.length ? colors : [fallbackVariant],
    sizes: sizes.length ? sizes : [{ label: 'Standard', name: 'Standard', value: 'Standard', price: base.price ?? base.sellingPrice ?? 0, mrp: base.mrp ?? base.originalPrice ?? 0 }],
    stock: base.stock ?? base.available ?? 12,
    modelUrl: base.modelUrl || base.model || base.glb || base.gltf || base.threeDModel || '',
    specs: base.specs || base.specifications || {
      Brand: base.brand || 'Aaramdehi',
      Size: sizes.length ? sizes.map((size) => size.label).join(', ') : 'Standard',
      Material: base.material || 'Microfiber',
      'Weave Type': base.weaveType || 'Low profile non-slip'
    },
    customAttributes: normalizeCustomAttributes(base.customAttributes || base.sets || base.attributes),
    features: base.features || base.highlights || [
      'Easy care microfiber surface',
      'Anti-skid backing for secure placement',
      'Machine washable for everyday use',
      'Soft, plush finish for comfort'
    ]
  };
};

const ProductPage = (props) => {
  const product = props.product || props;
  const normalized = useMemo(() => normalizeProduct(product), [product]);
  const {
    title,
    brand,
    price,
    mrp,
    discountPercent,
    deliveryDate,
    location,
    subtitle,
    description,
    images,
    colors,
    sizes,
    stock,
    specs,
    features,
    customAttributes,
    modelUrl
  } = normalized;

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedCustomOptions, setSelectedCustomOptions] = useState({});
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [internalSelectedImage, setInternalSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [internalQuantity, setInternalQuantity] = useState(props.quantity || 1);
  const [pincodeInput, setPincodeInput] = useState('250001');
  const [deliveryStatus, setDeliveryStatus] = useState('Free delivery by Sunday, 2 Aug');
  const [isWishlisted, setIsWishlisted] = useState(Boolean(props.isInWishlist));
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);

  // State for Description Toggle Accordion
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 'lg' : window.innerWidth >= 768 ? 'md' : 'sm';
    }
    return 'sm';
  });

  const selectedImage = props.activeImg || internalSelectedImage;
  const quantity = props.quantity ?? internalQuantity;

  const activeVariant = colors[selectedColor] || colors[0] || {};
  const activeImages = useMemo(() => {
    const variantImages = normalizeImageList(activeVariant.images || []);
    if (variantImages.length > 0) return variantImages;
    if (images.length > 0) return images;
    return [PLACEHOLDER_IMAGE];
  }, [activeVariant, images]);

  const activeImageIndex = useMemo(() => activeImages.findIndex((img) => img === selectedImage), [activeImages, selectedImage]);

  const moveGalleryImage = (direction) => {
    if (!activeImages.length) return;
    const currentIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % activeImages.length
      : (currentIndex - 1 + activeImages.length) % activeImages.length;
    const nextImage = activeImages[nextIndex];
    if (props.onActiveImgChange) {
      props.onActiveImgChange(nextImage);
    } else {
      setInternalSelectedImage(nextImage);
    }
  };

  const galleryImages = activeImages;
  const visibleThumbnails = galleryImages.slice(thumbnailStartIndex, thumbnailStartIndex + 6);
  const canSlideThumbnailsPrev = thumbnailStartIndex > 0;
  const canSlideThumbnailsNext = thumbnailStartIndex + 6 < galleryImages.length;

  const slideThumbnails = (direction) => {
    if (direction === 'next' && canSlideThumbnailsNext) {
      setThumbnailStartIndex((prev) => Math.min(prev + 1, galleryImages.length - 6));
    }
    if (direction === 'prev' && canSlideThumbnailsPrev) {
      setThumbnailStartIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleImageError = (event) => {
    if (!event?.target) return;
    const currentSrc = event.target.getAttribute('src');
    if (!currentSrc || currentSrc === PLACEHOLDER_IMAGE || event.target.dataset.fallbackApplied === 'true') {
      return;
    }
    event.target.setAttribute('src', PLACEHOLDER_IMAGE);
    event.target.dataset.fallbackApplied = 'true';
  };

  useEffect(() => {
    setSelectedSize(sizes[0] || null);
  }, [sizes]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setScreenSize('lg');
      } else if (width >= 768) {
        setScreenSize('md');
      } else {
        setScreenSize('sm');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (Array.isArray(customAttributes) && customAttributes.length > 0) {
      const initialSelection = customAttributes.reduce((acc, attribute, attrIndex) => {
        const defaultIndex = Array.isArray(attribute.options) && attribute.options.length > 0 ? 0 : -1;
        if (defaultIndex >= 0) acc[attrIndex] = defaultIndex;
        return acc;
      }, {});
      setSelectedCustomOptions(initialSelection);
    } else {
      setSelectedCustomOptions({});
    }
  }, [customAttributes]);

  useEffect(() => {
    const nextImage = activeImages[0] || PLACEHOLDER_IMAGE;
    if (props.activeImg !== undefined) {
      if (!activeImages.includes(props.activeImg)) {
        props.onActiveImgChange?.(nextImage);
      }
      return;
    }
    setInternalSelectedImage((current) => (current && activeImages.includes(current) ? current : nextImage));
  }, [selectedColor, activeImages, props.activeImg, props.onActiveImgChange]);

  useEffect(() => {
    setThumbnailStartIndex(0);
  }, [galleryImages]);

  const descriptionText = useMemo(() => {
    const rawDescription = description || '';
    const normalizedText = String(rawDescription)
      .replace(/&nbsp;/g, ' ')
      .trim();
    return normalizedText || 'Crafted for long-lasting comfort and support with premium materials and thoughtful detailing.';
  }, [description]);

  const hasRichDescription = useMemo(() => /<[^>]+>/i.test(descriptionText), [descriptionText]);

  const sanitizedDescriptionHtml = useMemo(() => {
    if (!hasRichDescription) return '';
    return DOMPurify.sanitize(descriptionText, { USE_PROFILES: { html: true } });
  }, [descriptionText, hasRichDescription]);

  const specEntries = useMemo(() => {
    const sourceSpecs = specs && typeof specs === 'object' ? specs : {};
    const ordered = [
      ['Brand', sourceSpecs.Brand ?? sourceSpecs.brand ?? brand],
      ['Size', sourceSpecs.Size ?? sourceSpecs.size ?? (sizes?.[0]?.label || sizes?.[0]?.name || 'Standard')],
      ['Material', sourceSpecs.Material ?? sourceSpecs.material ?? 'Microfiber'],
      ['Weave Type', sourceSpecs['Weave Type'] ?? sourceSpecs.weaveType ?? 'Low profile non-slip']
    ];

    return ordered.filter(([, value]) => value != null && String(value).trim());
  }, [specs, brand, sizes]);

  const selectedCustomAttributeSelections = useMemo(() => {
    if (!Array.isArray(customAttributes)) return [];
    return customAttributes.map((attribute, attrIndex) => {
      const optionIndex = selectedCustomOptions[attrIndex];
      return attribute.options?.[optionIndex] || null;
    }).filter(Boolean);
  }, [customAttributes, selectedCustomOptions]);

  const customAttributePriceModifier = useMemo(() => {
    return selectedCustomAttributeSelections.reduce((sum, option) => sum + Number(option.priceModifier || 0), 0);
  }, [selectedCustomAttributeSelections]);

  const customAttributeMrpModifier = useMemo(() => {
    return selectedCustomAttributeSelections.reduce((sum, option) => sum + Number(option.mrpModifier || 0), 0);
  }, [selectedCustomAttributeSelections]);

  const customSelectionStock = useMemo(() => {
    if (!selectedCustomAttributeSelections.length) return stock;
    const stockValues = selectedCustomAttributeSelections.map((option) => Number(option.stock ?? 0)).filter((value) => !Number.isNaN(value));
    if (!stockValues.length) return stock;
    return Math.min(...stockValues);
  }, [selectedCustomAttributeSelections, stock]);

  const baseActivePrice = Number(selectedSize?.price ?? activeVariant.price ?? price ?? 0);
  const baseActiveMrp = Number(selectedSize?.mrp ?? activeVariant.mrp ?? mrp ?? 0);
  const activePrice = Math.max(0, baseActivePrice + customAttributePriceModifier);
  const activeMrp = Math.max(0, baseActiveMrp + customAttributeMrpModifier);
  const activeDiscount = discountPercent || (activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0);
  const titleLabel = activeVariant.name ? `${title} — ${activeVariant.name}` : title;
  const currentModelUrl = activeVariant.modelUrl || modelUrl || '';

  useEffect(() => {
    if (!currentModelUrl) return;

    const loadViewer = async () => {
      try {
        await loadExternalScript(MODEL_VIEWER_SCRIPT);
      } catch (error) {
        console.warn('Failed to load model-viewer:', error);
      }
    };

    loadViewer();
  }, [currentModelUrl]);

  const handleSelectCustomOption = (attrIndex, optionIndex) => {
    setSelectedCustomOptions((prev) => ({
      ...prev,
      [attrIndex]: optionIndex
    }));
  };

  const handleSelectColor = (index) => {
    const nextVariant = colors[index] || colors[0] || {};
    const nextImages = normalizeImageList(nextVariant.images || []);
    const nextImage = nextImages[0] || images[0] || PLACEHOLDER_IMAGE;
    setSelectedColor(index);
    if (props.onActiveImgChange) {
      props.onActiveImgChange(nextImage);
    } else {
      setInternalSelectedImage(nextImage);
    }
  };

  const getSizeLabel = (sizeEntry) => {
    if (!sizeEntry) return '';
    if (typeof sizeEntry === 'string') return sizeEntry;
    return sizeEntry.label || sizeEntry.name || sizeEntry.value || '';
  };

  const handleAction = (action) => {
    const payload = {
      product: normalized,
      color: activeVariant,
      size: selectedSize,
      quantity,
      image: selectedImage,
      selectedCustomAttributes: selectedCustomAttributeSelections
    };
    if (action === 'cart') {
      props.onAddToCart?.(payload);
    }
    if (action === 'buy') {
      props.onBuyNow?.(payload);
    }
  };

  return (
    <div className="min-h-full bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1480px] rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_80px_-38px_rgba(15,23,42,0.24)]">
        {/* Grid Container */}
        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-[1.02fr_0.98fr] md:gap-8 lg:p-8">

          {/* LEFT COLUMN: Visuals & Gallery */}
          <section className="space-y-6">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 sm:p-6">

              {/* Main Image with Zoom */}
              <div
                className="relative mx-auto flex w-full max-w-[95%] justify-center overflow-hidden rounded-[22px] bg-white p-3 md:max-w-[80%] lg:max-w-[80%] xl:max-w-[80%] md:cursor-zoom-in"
                onMouseEnter={() => {
                  if (props.trackInteraction) {
                    props.trackInteraction('zoom_open', 4);
                  }
                }}
                onClick={() => setIsLightboxOpen(true)}
              >
                <div className="flex h-full w-full min-h-[420px] items-center justify-center rounded-[20px] bg-slate-100 p-4 shadow-inner sm:min-h-[520px] md:min-h-[560px]">
                  <ReactImageMagnify
                    {...{
                      smallImage: {
                        alt: titleLabel,
                        isFluidWidth: true,
                        src: selectedImage || PLACEHOLDER_IMAGE
                      },
                      largeImage: {
                        src: selectedImage || PLACEHOLDER_IMAGE,
                        width: 1200,
                        height: 1200
                      },
                      enlargedImageContainerDimensions: {
                        width: '160%',
                        height: '100%'
                      },
                      enlargedImagePosition: 'beside',
                      lensStyle: { backgroundColor: 'rgba(15, 23, 42, 0.2)' },
                      isHintEnabled: true,
                      isActivatedOnTouch: true,
                      isEnlargedImagePortalEnabled: true,
                      isEnlargedImagePortalEnabledForTouch: screenSize === 'lg',
                      enlargedImagePortalId: 'zoom-portal',
                      hoverDelayInMs: 100,
                      hoverOffDelayInMs: 50,
                      fadeDurationInMs: 200,
                      shouldUsePositiveSpaceLens: true,
                      enlargedImageContainerClassName: 'rounded-[28px] border border-slate-200 bg-white shadow-xl zoom-magnify-container',
                      enlargedImageClassName: 'rounded-[28px]',
                      enlargedImageContainerStyle: screenSize === 'lg' ? {
                        zIndex: 9999,
                        position: 'fixed',
                        top: '50%',
                        right: '2rem',
                        transform: 'translateY(-50%)',
                        width: '340px',
                        height: '440px',
                        borderRadius: '28px'
                      } : {
                        zIndex: 50,
                        position: 'relative',
                        top: 'auto',
                        right: 'auto',
                        transform: 'none',
                        width: '100%',
                        height: 'auto',
                        marginTop: '1rem',
                        borderRadius: '28px'
                      }
                    }}
                  />
+                <div
                    className="absolute inset-0 z-10 cursor-zoom-in lg:hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                  />
                </div>

                {/* Image Navigation Controls */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveGalleryImage('prev'); }}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-3 text-slate-700 shadow-lg transition hover:bg-white"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveGalleryImage('next'); }}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-3 text-slate-700 shadow-lg transition hover:bg-white"
                >
                  <FiChevronRight size={18} />
                </button>
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                  {activeVariant.name || 'Standard'}
                </div>
              </div>

              <div id="zoom-portal" className={screenSize === 'lg' ? 'pointer-events-none' : ''} />

              {/* Thumbnail Strip */}
              <div className="mt-4 rounded-[28px] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => slideThumbnails('prev')}
                    disabled={!canSlideThumbnailsPrev}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white px-2 py-3">
                    <div className="inline-flex items-center gap-3">
                      {visibleThumbnails.map((imgUrl, index) => (
                        <button
                          type="button"
                          key={`${imgUrl}-${thumbnailStartIndex + index}`}
                          className={`relative h-16 w-16 flex-shrink-0 rounded-3xl overflow-hidden border bg-white transition ${selectedImage === imgUrl ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'}`}
                          onClick={() => {
                            if (props.trackInteraction) {
                              props.trackInteraction('image_click', 2);
                            }
                            if (props.onActiveImgChange) {
                              props.onActiveImgChange(imgUrl);
                            } else {
                              setInternalSelectedImage(imgUrl);
                            }
                          }}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${thumbnailStartIndex + index + 1}`} className="h-full w-full object-cover" onError={handleImageError} />
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-1 text-[10px] text-white text-center">{thumbnailStartIndex + index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => slideThumbnails('next')}
                    disabled={!canSlideThumbnailsNext}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              </div>

            </div>

            {/* 3D Model Viewer Container */}
            {currentModelUrl && (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">3D preview</p>
                    <p className="text-sm text-slate-500">Interactive model support for select products</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Available
                  </span>
                </div>
                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2">
                  <model-viewer
                    src={currentModelUrl}
                    alt={titleLabel}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    camera-controls
                    touch-action="pan-y"
                    auto-rotate
                    className="h-[220px] w-full rounded-[16px] bg-slate-100 sm:h-[240px] md:h-[280px] lg:h-[320px]"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Lightbox Modal */}
          {isLightboxOpen && (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4" onClick={() => setIsLightboxOpen(false)}>
              <div className="max-w-[95%] max-h-[95%]">
                <img src={selectedImage || PLACEHOLDER_IMAGE} alt={titleLabel} className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl" />
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: Details, Pricing, Description, Options, Actions */}
          <aside className="space-y-5 lg:sticky lg:top-8">

            {/* 1. Header & Price Block */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                  {brand}
                </span>
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <FiCheckCircle />
                  Premium quality
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="relative z-10 mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px] break-words">{titleLabel}</h1>
              <p className="relative z-10 mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>

              {/* Price Details */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                  {activeDiscount > 0 ? `-${activeDiscount}% off` : 'Best price'}
                </span>
                <span className="text-4xl font-semibold text-slate-900">₹{formatPrice(activePrice)}</span>
                <span className="text-sm text-slate-500 line-through">₹{formatPrice(activeMrp)}</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  Estimated delivery: <span className="font-semibold text-slate-900">{deliveryDate}</span>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  Location: <span className="font-semibold text-slate-900">{location}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                  <FiTruck /> Free delivery over ₹499
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                  <FiRotateCcw /> Easy returns
                </span>
              </div>
            </div>

            {/* 2. Detailed Description (UPDATED WITH TOGGLE ACCORDION) */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsDescriptionOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 text-left focus:outline-none"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">Detailed description</p>
                  <p className="mt-1 text-sm text-slate-500">Everything you need to know about this product</p>
                </div>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  <FiChevronDown
                    className={`h-5 w-5 transform transition-transform duration-300 ${isDescriptionOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                  />
                </div>
              </button>

              {isDescriptionOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="space-y-3 text-sm leading-7 text-slate-700">
                    {hasRichDescription ? (
                      <div
                        className="prose prose-sm max-w-none [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescriptionHtml }}
                      />
                    ) : (
                      descriptionText.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                        <p key={`description-paragraph-${index}`}>{paragraph}</p>
                      ))
                    )}
                  </div>
                  {specEntries.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {specEntries.map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Color Selection */}
            {colors.length > 0 && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Select colour</p>
                  <span className="text-sm text-slate-500">{activeVariant.name || 'Standard'}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color, index) => {
                    const swatchImage = color.swatchImg || color.images?.[0] || color.img || color.image || PLACEHOLDER_IMAGE;
                    return (
                      <button
                        key={`${color.name}-${index}`}
                        type="button"
                        className={`flex min-w-[160px] items-center gap-3 rounded-[28px] border px-3 py-3 text-left transition ${selectedColor === index ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        onClick={() => handleSelectColor(index)}
                      >
                        <img src={swatchImage} alt={color.name || `Variant ${index + 1}`} className="h-14 w-14 rounded-2xl object-cover" onError={handleImageError} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{color.name}</p>
                          <p className="text-xs text-slate-500">₹{formatPrice(Number(color.price ?? activePrice ?? 0))}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Size Selection */}
            {sizes.length > 0 && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Choose size</p>
                  <span className="text-sm text-slate-500">{getSizeLabel(selectedSize)}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((sizeEntry, index) => {
                    const sizeLabel = getSizeLabel(sizeEntry);
                    return (
                      <button
                        key={`${sizeLabel}-${index}`}
                        type="button"
                        className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${selectedSize && getSizeLabel(selectedSize) === sizeLabel ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                        onClick={() => setSelectedSize(sizeEntry)}
                      >
                        {sizeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Custom Attribute Groups */}
            {customAttributes?.length > 0 && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Select Set</p>
                  <span className="text-sm text-slate-500">{customAttributes.length} group{customAttributes.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-5">
                  {customAttributes.map((attribute, attrIndex) => (
                    <div key={`${attribute.title || 'set'}-${attrIndex}`} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{attribute.title}</p>
                          <p className="text-xs text-slate-500">Choose one option below</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {attribute.options.map((option, optionIndex) => {
                          const isSelected = selectedCustomOptions[attrIndex] === optionIndex;
                          return (
                            <button
                              key={`${attribute.title}-${option.label}-${optionIndex}`}
                              type="button"
                              className={`rounded-2xl border p-4 text-left transition ${isSelected ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                              onClick={() => handleSelectCustomOption(attrIndex, optionIndex)}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-900">{option.label || 'Option'}</p>
                                {isSelected && <span className="text-xs font-semibold uppercase text-orange-600">Selected</span>}
                              </div>
                              <p className="mt-2 text-xs text-slate-500">Price: ₹{formatPrice(Number(option.priceModifier || 0))} · MRP: ₹{formatPrice(Number(option.mrpModifier || 0))}</p>
                              <p className="mt-2 text-xs text-slate-500">Stock: {option.stock ?? 0}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Selected set price change: <span className="font-semibold text-slate-900">₹{formatPrice(customAttributePriceModifier)}</span>
                    {customAttributeMrpModifier !== 0 && (
                      <span> · MRP change: ₹{formatPrice(customAttributeMrpModifier)}</span>
                    )}
                    <div className="mt-2 text-xs text-slate-500">Available stock for selected options: {customSelectionStock}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Pincode Check & Purchase Actions */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FiMapPin className="text-orange-500" />
                Delivery availability
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  value={pincodeInput}
                  onChange={(event) => setPincodeInput(event.target.value)}
                  placeholder="Enter PIN code"
                  maxLength={6}
                />
                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => {
                    const valid = /^[1-9][0-9]{5}$/.test(pincodeInput);
                    setDeliveryStatus(valid ? 'Delivery available for your location' : 'Enter a valid 6-digit PIN code');
                  }}
                >
                  Check
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-600">{deliveryStatus}</p>

              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span>Quantity</span>
                  <select
                    value={quantity}
                    onChange={(event) => {
                      const nextQuantity = Number(event.target.value);
                      if (props.onQuantityChange) {
                        props.onQuantityChange(nextQuantity);
                      } else {
                        setInternalQuantity(nextQuantity);
                      }
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  >
                    {[...Array(10)].map((_, index) => (
                      <option key={index + 1} value={index + 1}>{index + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" className="rounded-3xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600" onClick={() => handleAction('cart')}>
                    Add to cart
                  </button>
                  <button type="button" className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800" onClick={() => handleAction('buy')}>
                    Buy now
                  </button>
                </div>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-3xl border px-4 py-3 text-sm font-semibold transition ${isWishlisted ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                  onClick={() => {
                    setIsWishlisted((value) => !value);
                    props.onToggleWishlist?.({ product: normalized, color: activeVariant, size: selectedSize, quantity, image: selectedImage });
                  }}
                >
                  <FiHeart /> {isWishlisted ? 'Added to wishlist' : 'Add to wishlist'}
                </button>
              </div>
            </div>

            {/* Sidebar Promo Area */}
            {props.sidebarPromo && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                {props.sidebarPromo}
              </div>
            )}

            {/* Product Highlights */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-semibold text-slate-900">Why shoppers love this</p>
              <div className="mt-4 space-y-3">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={`${feature}-${index}`} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
                    <FiShield className="mt-0.5 text-orange-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;