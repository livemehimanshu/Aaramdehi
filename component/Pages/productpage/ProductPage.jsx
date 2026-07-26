import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  FiPackage
} from 'react-icons/fi';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600?text=No+Image';

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
    modelUrl
  } = normalized;

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [internalSelectedImage, setInternalSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [internalQuantity, setInternalQuantity] = useState(props.quantity || 1);
  const [pincodeInput, setPincodeInput] = useState('250001');
  const [deliveryStatus, setDeliveryStatus] = useState('Free delivery by Sunday, 2 Aug');
  const [isWishlisted, setIsWishlisted] = useState(Boolean(props.isInWishlist));

  const selectedImage = props.activeImg || internalSelectedImage;
  const quantity = props.quantity ?? internalQuantity;

  const mainImageRef = useRef(null);
  const thumbnailRef = useRef(null);

  const activeVariant = colors[selectedColor] || colors[0] || {};
  const activeImages = useMemo(() => {
    const variantImages = normalizeImageList(activeVariant.images || []);
    if (variantImages.length > 0) return variantImages;
    if (images.length > 0) return images;
    return [PLACEHOLDER_IMAGE];
  }, [activeVariant, images]);

  const activePrice = Number(selectedSize?.price ?? activeVariant.price ?? price ?? 0);
  const activeMrp = Number(selectedSize?.mrp ?? activeVariant.mrp ?? mrp ?? 0);
  const activeDiscount = discountPercent || (activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0);
  const titleLabel = activeVariant.name ? `${title} — ${activeVariant.name}` : title;
  const currentModelUrl = activeVariant.modelUrl || modelUrl || '';

  useEffect(() => {
    setSelectedSize(sizes[0] || null);
  }, [sizes]);

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

  const handleImageError = (event) => {
    if (!event?.target) return;
    const currentSrc = event.target.getAttribute('src');
    if (!currentSrc || currentSrc === PLACEHOLDER_IMAGE || event.target.dataset.fallbackApplied === 'true') {
      return;
    }
    event.target.setAttribute('src', PLACEHOLDER_IMAGE);
    event.target.dataset.fallbackApplied = 'true';
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
    const payload = { product: normalized, color: activeVariant, size: selectedSize, quantity, image: selectedImage };
    if (action === 'cart') {
      props.onAddToCart?.(payload);
    }
    if (action === 'buy') {
      props.onBuyNow?.(payload);
    }
  };

  const galleryImages = activeImages.slice(0, 5);

  return (
    <div className="min-h-full bg-slate-50 px-2 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-[1.08fr_0.92fr] md:gap-8 lg:p-8">
          <section className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="relative overflow-hidden rounded-[20px] bg-white" ref={mainImageRef}>
                <img
                  src={selectedImage || PLACEHOLDER_IMAGE}
                  alt={titleLabel}
                  className="h-[220px] w-full object-contain sm:h-[300px] md:h-[380px] lg:h-[520px]"
                  onError={handleImageError}
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                  {activeVariant.name || 'Standard'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, index) => (
                <button
                  type="button"
                  key={`${imgUrl}-${index}`}
                  className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border bg-white transition ${selectedImage === imgUrl ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => {
                    if (props.onActiveImgChange) {
                      props.onActiveImgChange(imgUrl);
                    } else {
                      setInternalSelectedImage(imgUrl);
                    }
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" onError={handleImageError} />
                </button>
              ))}
            </div>

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
                <span className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Available
                </span>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                  {brand}
                </span>
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <FiCheckCircle />
                  Premium quality
                </div>
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px] break-words">{titleLabel}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                  {activeDiscount > 0 ? `-${activeDiscount}% off` : 'Best price'}
                </span>
                <span className="text-4xl font-semibold text-slate-900">₹{formatPrice(activePrice)}</span>
                <span className="text-sm text-slate-500 line-through">₹{formatPrice(activeMrp)}</span>
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

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
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
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${selectedColor === index ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      onClick={() => handleSelectColor(index)}
                    >
                      <img src={swatchImage} alt={color.name || `Variant ${index + 1}`} className="h-12 w-12 rounded-xl object-cover" onError={handleImageError} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{color.name}</p>
                        <p className="text-xs text-slate-500">₹{formatPrice(Number(color.price ?? price ?? 0))}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Choose size</p>
                <span className="text-sm text-slate-500">{getSizeLabel(selectedSize)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sizeEntry, index) => {
                  const sizeLabel = getSizeLabel(sizeEntry);
                  return (
                    <button
                      key={`${sizeLabel}-${index}`}
                      type="button"
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${selectedSize && getSizeLabel(selectedSize) === sizeLabel ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                      onClick={() => setSelectedSize(sizeEntry)}
                    >
                      {sizeLabel}
                    </button>
                  );
                })}
              </div>
            </div>

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
                  <button type="button" className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600" onClick={() => handleAction('cart')}>
                    Add to cart
                  </button>
                  <button type="button" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" onClick={() => handleAction('buy')}>
                    Buy now
                  </button>
                </div>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isWishlisted ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                  onClick={() => {
                    setIsWishlisted((value) => !value);
                    props.onToggleWishlist?.({ product: normalized, color: activeVariant, size: selectedSize, quantity, image: selectedImage });
                  }}
                >
                  <FiHeart /> {isWishlisted ? 'Added to wishlist' : 'Add to wishlist'}
                </button>
              </div>
            </div>

            {props.sidebarPromo && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                {props.sidebarPromo}
              </div>
            )}

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
