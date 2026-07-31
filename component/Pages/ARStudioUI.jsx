import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMaximize2 } from 'react-icons/fi';
import api from '@/api/axiosInstance';
import { useCart } from '@/context/CartContext';
import SEO from '../header/SEO';

const MODEL_VIEWER_SCRIPT = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

// Utility helper to inject script tags dynamically
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

const lightingOptions = {
  neutral: {
    label: 'Neutral',
    overlay: 'bg-slate-950/20',
    glow: 'from-slate-600/20 via-slate-900/20 to-slate-950/30',
  },
  sunset: {
    label: 'Sunset',
    overlay: 'bg-amber-500/20',
    glow: 'from-orange-400/25 via-amber-500/10 to-rose-500/20',
  },
  neon: {
    label: 'Neon',
    overlay: 'bg-cyan-500/20',
    glow: 'from-cyan-400/20 via-fuchsia-500/15 to-violet-700/20',
  },
  cozy: {
    label: 'Cozy',
    overlay: 'bg-amber-300/15',
    glow: 'from-amber-200/20 via-rose-300/15 to-orange-500/20',
  },
};

const initialProduct = {
  id: '1',
  name: 'Pillow / Decor',
  price: 1299,
  image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
};

const ARStudioUI = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const listenTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const { addToCart: addToCartContext, cartCount, setIsCartOpen } = useCart();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeLighting, setActiveLighting] = useState('neutral');
  const [lightingMenuOpen, setLightingMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [currentModel, setCurrentModel] = useState('');
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);
  const [arProducts, setArProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [toast, setToast] = useState('');
  const [statusText, setStatusText] = useState('Ready');

  const [roomMetrics, setRoomMetrics] = useState({
    length: '4.8',
    width: '3.2',
    fit: '100% Calibrated / Ready',
  });

  const getProductModelUrl = (product) => {
    if (!product) return '';
    return (
      product.model3dUrl ||
      product.modelUrl ||
      product.model ||
      product.glb ||
      product.gltf ||
      product.threeDModel ||
      ''
    );
  };

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
    const modelUrl = getProductModelUrl(product);
    setCurrentModel(modelUrl);
    setStatusText(
      modelUrl ? `${product.name} ready in camera preview` : `${product.name} selected, no 3D model found`
    );
    setIsAdded(false);
  }, []);

  const getProductPrice = (product) => {
    return Number(product?.sellingPrice || product?.price || product?.mrp || 0);
  };

  useEffect(() => {
    const loadArProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await api.get('/products', { params: { limit: 100 } });
        const payload = response.data?.data ?? response.data ?? [];
        const products = Array.isArray(payload) ? payload : [];
        const arItems = products.filter((product) => Boolean(getProductModelUrl(product)));
        
        setArProducts(arItems);
        if (arItems.length) {
          selectProduct(arItems[0]);
        }
      } catch (error) {
        console.error('Failed to load AR products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadArProducts();
  }, [selectProduct]);

  useEffect(() => {
    const initModelViewer = async () => {
      if (isModelViewerReady) return;
      if (!window.customElements?.get('model-viewer')) {
        try {
          await loadScript(MODEL_VIEWER_SCRIPT);
          if (window.customElements?.get('model-viewer')) {
            setIsModelViewerReady(true);
          }
        } catch (error) {
          console.warn('Failed to load model-viewer script:', error);
        }
      } else {
        setIsModelViewerReady(true);
      }
    };

    initModelViewer();
  }, [isModelViewerReady]);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 1800);
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const startCameraPreview = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setIsCameraActive(false);
        setStatusText('Camera unavailable — showing mock preview');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
        setStatusText('Live camera preview active');
      } catch (error) {
        console.warn('Camera access denied or unsupported:', error);
        setIsCameraActive(false);
        setStatusText('Mock preview active');
      }
    };

    startCameraPreview();

    return () => {
      stopCamera();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      clearTimeout(scanTimerRef.current);
      clearTimeout(listenTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleScanSpace = () => {
    setIsScanning(true);
    setStatusText('Calibrating...');
    setRoomMetrics({ length: '4.8', width: '3.2', fit: 'Scanning room map...' });
    setIsCameraActive(true);
    showToast('Scanning space...');

    clearTimeout(scanTimerRef.current);
    scanTimerRef.current = window.setTimeout(() => {
      setIsScanning(false);
      setStatusText('100% Calibrated / Ready');
      setRoomMetrics({ length: '4.8', width: '3.2', fit: '100% Calibrated / Ready' });
      showToast('Scan complete');
    }, 2500);
  };

  const handleLightingSelect = (value) => {
    setActiveLighting(value);
    setLightingMenuOpen(false);
    showToast(`${lightingOptions[value].label} lighting enabled`);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening for commands...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || 'Command received';
        setIsListening(false);
        showToast(`Heard: ${transcript}`);
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Voice input unavailable');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      return;
    }

    setIsListening(true);
    showToast('Voice assist demo active');
    clearTimeout(listenTimerRef.current);
    listenTimerRef.current = window.setTimeout(() => {
      setIsListening(false);
      showToast('Voice ready');
    }, 4000);
  };

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await stageRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.warn('Fullscreen failed:', error);
      }
      return;
    }

    try {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } catch (error) {
      console.warn('Fullscreen exit failed:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleAddToCart = () => {
    const productId = String(selectedProduct._id || selectedProduct.id || Date.now());
    const price = getProductPrice(selectedProduct);
    
    const productToAdd = {
      ...selectedProduct,
      id: productId,
      _id: productId,
      quantity: 1,
      name: selectedProduct.name || selectedProduct.productName || 'AR Product',
      price: price,
      sellingPrice: price,
      image: selectedProduct.thumbnail || selectedProduct.image || selectedProduct.images?.[0]?.url || '',
    };

    addToCartContext(productToAdd);
    setIsCartOpen(true);
    setIsAdded(true);
    showToast(`Added ${productToAdd.name} to Cart!`);

    window.setTimeout(() => setIsAdded(false), 700);
  };

  const activeTheme = lightingOptions[activeLighting];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white">
      <SEO
        title="AR Studio | Aaramdehi"
        description="Interactive AR studio with camera preview, lighting controls, voice assist, and quick add-to-cart."
        keywords="AR studio, room preview, 3d product viewer, aaramdehi"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">
                Aaramdehi AR Studio
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Preview your room in immersive AR
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Scan, style, and shop with a smooth live preview experience built for modern furniture browsing.
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200">
              Cart {cartCount}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <div
            ref={stageRef}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.4)] min-h-[400px]"
          >
            <div className="absolute left-4 top-4 z-30 flex items-center gap-2">
              <span className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                Aaramdehi AR Studio • Camera Preview
              </span>
              <button
                onClick={toggleFullscreen}
                className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-white backdrop-blur-md hover:bg-white/10 transition"
              >
                <FiMaximize2 className="h-4 w-4" />
              </button>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                isCameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {currentModel && isModelViewerReady && (
              <div className="absolute inset-0 z-10 pointer-events-auto">
                <model-viewer
                  src={currentModel}
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="1000"
                  exposure="1.2"
                  interaction-policy="always"
                  reveal="auto"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme.glow} transition-all duration-500`} />
            <div className={`absolute inset-0 ${activeTheme.overlay} transition-all duration-500`} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />

            {isScanning && (
              <div className="absolute inset-0 z-20 animate-pulse bg-emerald-400/10" />
            )}

            {!isCameraActive && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 px-4">
                <div className="max-w-sm rounded-[24px] border border-white/10 bg-slate-900/80 p-6 text-center shadow-2xl backdrop-blur-xl">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-emerald-400/30 bg-emerald-500/10">
                    <div className="h-14 w-14 rounded-xl border border-emerald-300/40 shadow-[0_0_40px_rgba(16,185,129,0.25)]" />
                  </div>
                  <p className="text-sm font-semibold text-white">Mock AR preview active</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Camera permission was denied or unsupported, so a styled 3D grid preview is shown instead.
                  </p>
                </div>
              </div>
            )}

            {isListening && (
              <div className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-full border border-sky-400/20 bg-slate-950/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400" />
                Listening...
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl backdrop-blur-xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Room Metrics
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-white">
                <span>Length</span>
                <span className="font-semibold">{roomMetrics.length} m</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-white">
                <span>Width</span>
                <span className="font-semibold">{roomMetrics.width} m</span>
              </div>
              <div className="mt-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                {roomMetrics.fit}
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleScanSpace}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                {isScanning ? 'Scanning...' : 'Scan Space'}
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg transition ${
                  isAdded ? 'bg-amber-400' : 'bg-white hover:bg-slate-100'
                }`}
              >
                {isAdded ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">Dosa Box</p>
                <h2 className="mt-2 text-2xl font-black text-white">Aaramdehi Dosa Box</h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                New
              </span>
            </div>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <p>
                Khaas AR experience ke saath ab Aaramdehi Dosa Box bhi dekh sakte hain. Yeh container aapki product aur room preview ko ek saath present karta hai.
              </p>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  AR Product Library
                </div>
                {loadingProducts ? (
                  <div className="text-sm text-slate-400">Loading AR products...</div>
                ) : arProducts.length ? (
                  <div className="space-y-3">
                    {arProducts.slice(0, 4).map((product) => {
                      const isSelected =
                        selectedProduct?.id === product.id || selectedProduct?.name === product.name;
                      return (
                        <button
                          key={product._id || product.id || product.name}
                          type="button"
                          onClick={() => selectProduct(product)}
                          className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/10 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-sm truncate">
                              {product.name || 'Untitled AR Item'}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                              ₹{getProductPrice(product).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-slate-400">
                            {getProductModelUrl(product) ? 'AR model available' : 'No model'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">No AR products available yet.</div>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Selected AR product</div>
                <div className="mt-3 grid gap-3">
                  <img
                    src={
                      selectedProduct?.thumbnail ||
                      selectedProduct?.image ||
                      'https://placehold.co/400x280?text=No+Image'
                    }
                    alt={selectedProduct?.name || 'Selected product'}
                    className="h-28 w-full rounded-3xl object-cover"
                  />
                  <div>
                    <div className="font-black text-white">
                      {selectedProduct?.name || 'No product selected'}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {selectedProduct?.category || selectedProduct?.placementType || 'AR product'}
                    </div>
                    <div className="mt-2 text-lg font-black text-emerald-300">
                      ₹{getProductPrice(selectedProduct).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {getProductModelUrl(selectedProduct)
                        ? 'Blend/glTF model ready for camera preview'
                        : 'Static preview only'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-emerald-400"
            >
              Add Selected Product to Cart
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Selected Product
              </div>
              <div className="mt-1 text-xl font-black text-white">{selectedProduct?.name}</div>
              <div className="mt-1 text-sm text-slate-300">
                ₹{getProductPrice(selectedProduct).toLocaleString()} • AR-ready preview
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => selectProduct(initialProduct)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-emerald-400"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-emerald-400/20 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}
    </div>
  );
};

export default ARStudioUI;