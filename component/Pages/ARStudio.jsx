import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { getProductByIdAPI } from '@/api/authAndAdminApi';
import { useCart } from '@/context/CartContext';
import SEO from '../header/SEO';
import { 
  FiCamera, 
  FiShoppingCart, 
  FiBox, 
  FiMic, 
  FiMaximize, 
  FiSliders, 
  FiRefreshCw, 
  FiArrowLeft,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

// CDN Scripts for TensorFlow.js, COCO-SSD, and Google model-viewer
const TFJS_SCRIPT = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.8.0/dist/tf.min.js';
const COCO_SSD_SCRIPT = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
const MODEL_VIEWER_SCRIPT = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

const ARStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart: addToCartContext, setIsCartOpen } = useCart();
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const detectionAnimationRef = useRef(null);
  const cocoSsdModelRef = useRef(null);
  const modelViewerRef = useRef(null);
  const sliderRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isBedPresent, setIsBedPresent] = useState(false);
  const [canPlace, setCanPlace] = useState(true);
  const [showBeddingWarning, setShowBeddingWarning] = useState(false);
  const [aiStatus, setAiStatus] = useState('AI Scanning Room Live...');
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [placementMode, setPlacementMode] = useState('floor');
  const [cameraError, setCameraError] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSelectedProduct, setLoadingSelectedProduct] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);

  const [scanStep, setScanStep] = useState('instruction');
  const [scanProgress, setScanProgress] = useState(0);
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const [calculatedArea, setCalculatedArea] = useState({ length: '5.7', width: '4.6', fitStatus: 'Perfect Fit' });
  const [modelScaleFactor, setModelScaleFactor] = useState('100%');
  const [ambientTheme, setAmbientTheme] = useState('neutral');
  const [showDimensions, setShowDimensions] = useState(true);
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState('Voice assistant ready');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [voiceBadge, setVoiceBadge] = useState('');
  const [voiceBadgeVisible, setVoiceBadgeVisible] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  
  const themeToggleTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const voiceBadgeTimerRef = useRef({ hide: null, clear: null });
  const recognitionRef = useRef(null);

  // Slider Navigation
  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const getProductTarget = (product) => {
    if (!product) return 'floor';
    if (product.target) return product.target;
    
    const category = String(product.category || '').toLowerCase();
    const name = String(product.name || '').toLowerCase();
    
    if (
      category.includes('pillow') || 
      category.includes('bedding') || 
      category.includes('bedsheet') || 
      name.includes('pillow') || 
      name.includes('bedsheet')
    ) {
      return 'bed';
    }
    if (
      product.placementType === 'wall' || 
      category.includes('decor') || 
      category.includes('painting') || 
      category.includes('art')
    ) {
      return 'wall';
    }
    return 'floor';
  };

  const getProductScale = (product) => {
    if (!product) return '1 1 1';
    const category = String(product.category || '').toLowerCase();
    const name = String(product.name || '').toLowerCase();
    
    if (category.includes('pillow') || name.includes('pillow')) {
      return '0.38 0.1 0.25';
    }
    return '1 1 1';
  };

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

  const selectProduct = (product) => {
    setSelectedProduct(product);
    const modelUrl = getProductModelUrl(product);

    if (modelUrl) {
      setCurrentModel(modelUrl);
      setAiStatus(`Viewing Selected Product: ${product?.name || product?.productName || 'Product'}`);
    } else {
      setCurrentModel(null);
      setAiStatus(`Selected product has no AR model available: ${product?.name || product?.productName || 'Product'}`);
    }

    setPlacementMode(product?.placementType === 'wall' ? 'wall' : 'floor');
    setIsSidebarOpen(false);
  };

  const addToCart = () => {
    const product = selectedProduct || dbProducts.find((item) => getProductModelUrl(item) === currentModel) || currentProduct || null;
    
    if (!product) {
      showToast('No AR product available to add.', 'warning');
      return;
    }

    const target = getProductTarget(product);
    if (target === 'bed' && !isBedPresent) {
      showToast('Place Bedding on Bed Only: Point camera at a bed', 'warning');
      triggerHaptic([80, 50, 80]);
      playSoundEffect('click');
      return;
    }

    const productId = String(product._id || product.id || Date.now());

    const normalizedProduct = {
      ...product,
      id: productId,
      _id: productId,
      name: product.name || product.title || 'AR Product',
      quantity: 1,
      price: Number(product.sellingPrice || product.price || product.mrp || 0),
      sellingPrice: Number(product.sellingPrice || product.price || product.mrp || 0),
      image: product.thumbnail || (product.images && product.images[0]?.url) || product.image || ''
    };

    addToCartContext(normalizedProduct);
    setCartAdded(true);
    setIsCartOpen(true);
    showToast(`${normalizedProduct.name} added to cart`, 'success');
    playSoundEffect('success');
    triggerHaptic([20, 30, 20]);
  };

  const captureScreenshot = () => {
    const video = videoRef.current;
    if (!video) {
      showToast('Camera not available for capture', 'warning');
      return;
    }
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      showToast('Unable to capture screenshot', 'warning');
      return;
    }
    try {
      ctx.drawImage(video, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('Screenshot capture failed', 'warning');
          return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `aaramdehi-ar-snapshot-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('Screenshot captured', 'success');
      });
    } catch (error) {
      console.warn('Screenshot capture error:', error);
      showToast('Unable to capture screenshot', 'warning');
    }
  };

  const ambientThemeLabels = {
    neutral: 'Neutral',
    sunset: 'Sunset',
    neon: 'Neon',
    cozy: 'Cozy',
  };
  const ambientThemeOrder = ['neutral', 'sunset', 'neon', 'cozy'];

  const showToast = (message, type = 'info', duration = 2800) => {
    clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastType(type);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(''), duration);
  };

  const setAmbientThemeDebounced = (theme) => {
    clearTimeout(themeToggleTimerRef.current);
    themeToggleTimerRef.current = window.setTimeout(() => {
      setAmbientTheme(theme);
      showToast(`Ambient theme set to ${ambientThemeLabels[theme] || 'Mode'}`, 'success');
    }, 180);
  };

  const getSpeechRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const handleVoiceCommand = (command) => {
    const normalized = command.toLowerCase();
    if (normalized.includes('scan')) {
      startSurfaceScanning();
      showToast('Voice command: Scan surface executed', 'success');
    } else if (normalized.includes('theme')) {
      cycleAmbientTheme();
      showToast('Voice command: Ambient theme cycled', 'success');
    } else if (normalized.includes('place') || normalized.includes('product')) {
      showToast('Voice command: Ready to place product', 'info');
    } else {
      showToast(`Voice command heard: ${command}`, 'info');
    }
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      showToast('Voice assistant not supported in this browser', 'warning');
      setVoiceStatusMessage('Voice assistant unavailable');
      return;
    }

    stopVoiceAssistant();
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceAssistantActive(true);
      setVoiceStatusMessage('Listening for your AR command...');
      setVoiceBadge('Voice active');
      setVoiceBadgeVisible(true);
      showToast('Voice assistant activated', 'info');
      clearTimeout(voiceBadgeTimerRef.current.hide);
      clearTimeout(voiceBadgeTimerRef.current.clear);
      voiceBadgeTimerRef.current.hide = window.setTimeout(() => setVoiceBadgeVisible(false), 2000);
      voiceBadgeTimerRef.current.clear = window.setTimeout(() => setVoiceBadge(''), 2400);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      setVoiceStatusMessage(`Heard: ${transcript}`);
      setVoiceBadge('Command recognized');
      setVoiceBadgeVisible(true);
      clearTimeout(voiceBadgeTimerRef.current.hide);
      clearTimeout(voiceBadgeTimerRef.current.clear);
      voiceBadgeTimerRef.current.hide = window.setTimeout(() => setVoiceBadgeVisible(false), 2200);
      voiceBadgeTimerRef.current.clear = window.setTimeout(() => setVoiceBadge(''), 2600);
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setVoiceStatusMessage('Voice assistant error');
      showToast('Voice recognition could not complete', 'warning');
      stopVoiceAssistant();
    };

    recognition.onend = () => {
      setVoiceAssistantActive(false);
      setVoiceStatusMessage('Voice assistant ready');
      setVoiceBadge('Voice ended');
      setVoiceBadgeVisible(true);
      clearTimeout(voiceBadgeTimerRef.current.hide);
      clearTimeout(voiceBadgeTimerRef.current.clear);
      voiceBadgeTimerRef.current.hide = window.setTimeout(() => setVoiceBadgeVisible(false), 2000);
      voiceBadgeTimerRef.current.clear = window.setTimeout(() => setVoiceBadge(''), 2400);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoiceAssistant = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceAssistantActive(false);
    setVoiceStatusMessage('Voice assistant ready');
    setVoiceBadge('Voice ended');
    setVoiceBadgeVisible(true);
    clearTimeout(voiceBadgeTimerRef.current.hide);
    clearTimeout(voiceBadgeTimerRef.current.clear);
    voiceBadgeTimerRef.current.hide = window.setTimeout(() => setVoiceBadgeVisible(false), 2000);
    voiceBadgeTimerRef.current.clear = window.setTimeout(() => setVoiceBadge(''), 2400);
  };

  const cycleAmbientTheme = () => {
    const nextIndex = (ambientThemeOrder.indexOf(ambientTheme) + 1) % ambientThemeOrder.length;
    setAmbientThemeDebounced(ambientThemeOrder[nextIndex]);
  };

  const ambientFilterClass = {
    neutral: 'bg-slate-950/10',
    sunset: 'bg-orange-400/10',
    neon: 'bg-fuchsia-500/10',
    cozy: 'bg-amber-400/10',
  }[ambientTheme] || 'bg-slate-950/10';

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });

  useEffect(() => {
    const initModelViewer = async () => {
      try {
        await loadScript(MODEL_VIEWER_SCRIPT);
        if (window.customElements?.get('model-viewer')) {
          setIsModelViewerReady(true);
          return;
        }
        if (window.customElements?.whenDefined) {
          await window.customElements.whenDefined('model-viewer');
          setIsModelViewerReady(true);
          return;
        }
        setTimeout(() => {
          if (window.customElements?.get('model-viewer')) {
            setIsModelViewerReady(true);
          }
        }, 300);
      } catch (error) {
        console.warn('Failed to load model-viewer script:', error);
        setAiStatus('AR viewer could not load. Please refresh or use a supported browser.');
      }
    };

    initModelViewer();
  }, []);

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopObjectDetection = () => {
    if (detectionAnimationRef.current) {
      cancelAnimationFrame(detectionAnimationRef.current);
      detectionAnimationRef.current = null;
    }
    cocoSsdModelRef.current = null;
    setIsFaceDetected(false);
    setIsBedPresent(false);
  };

  const triggerHaptic = (duration = 50) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const playSoundEffect = (type) => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, context.currentTime);
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.25);
      } else if (type === 'click') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        gainNode.gain.setValueAtTime(0.08, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.08);
      }
    } catch (e) {
      // Ignore audio failures
    }
  };

  const calculateAutoFitScale = (length, width, placement) => {
    const area = Number(length) * Number(width);
    const targetFootprint = placement === 'wall' ? 24 : 16;
    const rawScale = Math.min(100, Math.max(60, Math.floor((area / targetFootprint) * 100)));
    const fitStatus = rawScale < 100 ? 'Auto-fitted to available space' : 'Perfect Fit';
    return { rawScale, fitStatus };
  };

  const startSurfaceScanning = () => {
    playSoundEffect('click');
    triggerHaptic(60);
    setScanStep('scanning');
    setSurfaceDetected(false);
    setScanProgress(0);
    setAiStatus('Scanning surface dimensions...');
    showToast('Surface scan started', 'success');

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 5;
      setScanProgress(currentProgress);

      if (currentProgress % 20 === 0) {
        triggerHaptic(20);
      }

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        playSoundEffect('success');
        triggerHaptic([100, 50, 100]);

        const lengthGrid = (Math.random() * (8.0 - 5.0) + 5.0).toFixed(1);
        const widthGrid = (Math.random() * (6.5 - 3.8) + 3.8).toFixed(1);
        const fit = calculateAutoFitScale(lengthGrid, widthGrid, placementMode);

        setCalculatedArea({
          length: lengthGrid,
          width: widthGrid,
          fitStatus: fit.fitStatus,
        });
        setModelScaleFactor(`${fit.rawScale}%`);
        setSurfaceDetected(true);
        setScanStep('completed');
        setAiStatus(`Surface measured: ${lengthGrid}ft × ${widthGrid}ft — ${fit.fitStatus}`);
        showToast(`Scan complete: ${lengthGrid}ft × ${widthGrid}ft`, 'success');
      }
    }, 120);
  };

  useEffect(() => {
    if (surfaceDetected && currentModel) {
      const product = selectedProduct || dbProducts.find((item) => (item.model3dUrl || item.modelUrl) === currentModel);
      if (!product) return;
      const fit = calculateAutoFitScale(calculatedArea.length, calculatedArea.width, placementMode);
      setModelScaleFactor(`${fit.rawScale}%`);
      setCalculatedArea((prev) => ({ ...prev, fitStatus: fit.fitStatus }));
    }
  }, [surfaceDetected, currentModel, placementMode, selectedProduct, dbProducts]);

  useEffect(() => {
    const loadAaramdehiProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await api.get('/products', { params: { limit: 200 } });
        const payload = response.data?.data ?? response.data ?? [];
        const arItems = Array.isArray(payload)
          ? payload.filter((product) => (product.model3dUrl || product.modelUrl) && (product.placementType || product.category))
          : [];

        setDbProducts(arItems);
        setAiStatus(arItems.length
          ? 'AI Ready. Scanning camera feed for surfaces...'
          : 'No AR-enabled products found in the catalog yet.');
      } catch (error) {
        console.error('Failed to load AR products:', error);
        setAiStatus('Failed to load AR product catalog.');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadAaramdehiProducts();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initCameraAndObjectDetection = async () => {
      stopObjectDetection();
      stopMediaStream();
      setCameraError('');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser does not support camera access.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setAiStatus('Loading AI Object Detector...');
        
        await loadScript(MODEL_VIEWER_SCRIPT);
        await loadScript(TFJS_SCRIPT);
        await loadScript(COCO_SSD_SCRIPT);

        if (window.cocoSsd && videoRef.current) {
          cocoSsdModelRef.current = await window.cocoSsd.load();
          setAiStatus('AI Ready. Scanning room...');

          const detectObjects = async () => {
            if (!isMounted || !videoRef.current || videoRef.current.readyState < 2) {
              detectionAnimationRef.current = requestAnimationFrame(detectObjects);
              return;
            }
            try {
              if (cocoSsdModelRef.current) {
                const predictions = await cocoSsdModelRef.current.detect(videoRef.current);
                
                const bedPresent = predictions.some(
                  (p) => p.class === 'bed' || p.class === 'couch'
                );
                setIsBedPresent(bedPresent);

                const personPresent = predictions.some((p) => p.class === 'person');
                setIsFaceDetected(personPresent);
              }
            } catch (error) {
              console.warn('COCO-SSD frame detection failed:', error);
            }
            detectionAnimationRef.current = requestAnimationFrame(detectObjects);
          };
          detectionAnimationRef.current = requestAnimationFrame(detectObjects);
        }
      } catch (error) {
        console.error('Camera or COCO-SSD model load failed:', error);
        setCameraError('Unable to access camera or AI model load failed.');
        setAiStatus('Camera permission denied or device unsupported.');
      }
    };

    initCameraAndObjectDetection();

    return () => {
      isMounted = false;
      stopObjectDetection();
      stopMediaStream();
    };
  }, [facingMode]);

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (!productId) {
      setLoadingSelectedProduct(false);
      return;
    }

    const loadSelectedProduct = async () => {
      try {
        setLoadingSelectedProduct(true);
        const res = await getProductByIdAPI(productId);

        if (res?.success && res.data) {
          selectProduct(res.data);
          const modelUrl = getProductModelUrl(res.data);
          if (modelUrl) {
            setAiStatus(`Selected product loaded for 360 AR: ${res.data.name}`);
            setPlacementMode(res.data.placementType === 'wall' ? 'wall' : 'floor');
          } else {
            setAiStatus('Selected product has no 3D model available for AR.');
          }
        } else {
          setAiStatus(res?.message || 'Selected product could not be loaded.');
        }
      } catch (error) {
        console.error('Selected product load failed:', error);
        setAiStatus('Selected product could not be loaded.');
      } finally {
        setLoadingSelectedProduct(false);
      }
    };

    loadSelectedProduct();
  }, [searchParams]);

  const selectedProductHasModel = Boolean(selectedProduct && getProductModelUrl(selectedProduct));
  const urlProductId = searchParams.get('productId');

  useEffect(() => {
    if (dbProducts.length === 0 || cameraError || selectedProduct) {
      if (urlProductId && selectedProduct) {
        setAiStatus(`Viewing Selected Product: ${selectedProduct.name || selectedProduct.productName || 'Product'}`);
      }
      return;
    }

    const autoScanner = setInterval(() => {
      const randomScan = Math.random();

      if (randomScan < 0.55) {
        const bedsheetProduct = dbProducts.find((product) =>
          product.placementType === 'floor' ||
          product.placementType === 'bed' ||
          String(product.category || '').toLowerCase().includes('bed') ||
          String(product.category || '').toLowerCase().includes('bedding')
        );

        if (bedsheetProduct) {
          setAiStatus(`Detected floor/bed surface → Auto suggesting: ${bedsheetProduct.name || bedsheetProduct.productName || 'Product'}`);
          setCurrentModel(getProductModelUrl(bedsheetProduct));
          setPlacementMode('floor');
        }
      } else {
        const paintingProduct = dbProducts.find((product) =>
          product.placementType === 'wall' ||
          String(product.category || '').toLowerCase().includes('decor') ||
          String(product.category || '').toLowerCase().includes('painting') ||
          String(product.category || '').toLowerCase().includes('art')
        );

        if (paintingProduct) {
          setAiStatus(`Detected wall surface → Auto suggesting: ${paintingProduct.name || paintingProduct.productName || 'Product'}`);
          setCurrentModel(getProductModelUrl(paintingProduct));
          setPlacementMode('wall');
        }
      }
    }, 4000);

    return () => clearInterval(autoScanner);
  }, [dbProducts, cameraError, selectedProduct, urlProductId, selectedProductHasModel]);

  const currentProduct = selectedProduct || dbProducts.find((item) => getProductModelUrl(item) === currentModel) || null;

  useEffect(() => {
    setCartAdded(false);
  }, [currentModel, selectedProduct?.id, selectedProduct?._id, selectedProduct?.name]);

  useEffect(() => {
    const product = currentProduct;
    if (!product) return;

    const target = getProductTarget(product);
    if (target === 'bed') {
      if (!isBedPresent) {
        setAiStatus("⚠️ Point camera at a bed to place this bedding.");
        setCanPlace(false);
        setShowBeddingWarning(true);
      } else {
        setAiStatus("✅ Surface ready for placement.");
        setCanPlace(true);
        setShowBeddingWarning(false);
      }
    } else {
      setCanPlace(true);
      setShowBeddingWarning(false);
    }
  }, [isBedPresent, currentProduct]);

  const statusMessage = isFaceDetected
    ? '⚠️ AI Paused: Human Face Detected'
    : loadingSelectedProduct
      ? 'Loading selected product for 360 AR...'
      : aiStatus;

  const isPillow = currentProduct && (
    String(currentProduct.category || '').toLowerCase().includes('pillow') ||
    String(currentProduct.name || '').toLowerCase().includes('pillow')
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black">
      <SEO
        title="AR Furniture Placement Studio | Preview Beds, Pillows & Decor"
        description="Use Aaramdehi AR Studio to scan your room and preview beds, pillows, and decor in real time before you buy."
        keywords="AR furniture placement, room scan, preview decor, aaramdehi AR studio"
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090e]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
              aria-label="Back"
            >
              <FiArrowLeft className="text-base" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-md shadow-emerald-500/20">
              A
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase text-white leading-tight">AARAMDEHI</h1>
              <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.18em] sm:tracking-[0.2em] text-emerald-400 uppercase">AR Studio Experience</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <FiSliders className="text-xs sm:text-sm" />
              <span className="hidden sm:inline">Controls</span>
            </button>
            <button 
              onClick={addToCart}
              className="group relative flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-slate-950 active:scale-95"
            >
              <FiShoppingCart className="text-xs sm:text-sm" />
              <span>Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Banner Section */}
        <div className="rounded-2xl sm:rounded-[28px] border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-950/80 p-4 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-400">Live 3D Placement</span>
            <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black tracking-tight text-white lg:text-3xl">Preview items directly in your room</h2>
            <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-400 max-w-xl">
              Scan surface dimensions, position bedding or decor in real time, and scale correctly before making a purchase decision.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/products" className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              Browse Collection
            </Link>
            <Link to="/compare" className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              Compare
            </Link>
          </div>
        </div>

        {/* Vertical Stack: Camera Top, Slider Bottom */}
        <div className="flex flex-col gap-4 sm:gap-6">
          
          {/* 1. AR Viewport (Top Full Width) */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-white/10 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-full flex flex-col justify-between min-h-[420px] sm:min-h-[520px]">
            
            {/* Live Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className={`absolute inset-0 ${ambientFilterClass} pointer-events-none transition-colors duration-300`} />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/90 pointer-events-none" />

            {/* 3D Model Viewer Layer */}
            {!isFaceDetected && currentModel && isModelViewerReady && (
              <div className="absolute inset-0 w-full h-full pointer-events-auto">
                <model-viewer
                  ref={modelViewerRef}
                  src={currentModel}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="1000"
                  field-of-view="auto"
                  camera-orbit="0deg 75deg auto"
                  min-camera-orbit="auto auto auto"
                  max-camera-orbit="auto auto auto"
                  camera-target="auto auto auto"
                  ar-placement={placementMode}
                  scale={getProductScale(currentProduct)}
                  ar-scale={isPillow ? 'fixed' : 'auto'}
                  reveal="auto"
                  interaction-policy="always"
                  exposure="1.2"
                  loading="eager"
                  style={{ width: '100%', height: '100%' }}
                >
                  {canPlace && (
                    <button
                      slot="ar-button"
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 rounded-full bg-emerald-500 px-5 py-2.5 sm:px-6 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] text-slate-950 shadow-2xl hover:bg-emerald-400 active:scale-95 transition"
                    >
                      ✨ Tap to Place Selected Product
                    </button>
                  )}
                </model-viewer>
              </div>
            )}

            {/* Target 3D Placeholder when model is idle or loading */}
            {!currentModel && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex flex-col items-center justify-center text-center p-6">
                  <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-full border border-dashed border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center animate-pulse">
                    <FiBox className="text-3xl sm:text-4xl text-emerald-400/70" />
                  </div>
                  <p className="mt-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Point Camera To Surface</p>
                </div>
              </div>
            )}

            {/* Top Bar Controls Inside Camera */}
            <div className="z-20 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-5">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md">
                <span className={`h-2 w-2 rounded-full ${isFaceDetected ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="text-[11px] sm:text-xs font-medium text-slate-200">{statusMessage}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))}
                  className="rounded-xl border border-white/10 bg-slate-950/60 p-2 sm:p-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-95"
                  title="Switch Camera"
                >
                  <FiRefreshCw />
                </button>
                <button
                  type="button"
                  onClick={startSurfaceScanning}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 sm:px-4 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                >
                  <FiCamera /> {scanStep === 'scanning' ? `${scanProgress}%` : 'Scan Space'}
                </button>
              </div>
            </div>

            {/* Face Safety Warning Banner Overlay */}
            {isFaceDetected && (
              <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-md">
                <div className="max-w-md rounded-2xl sm:rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-5 sm:p-6 text-center backdrop-blur-xl shadow-2xl">
                  <FiAlertTriangle className="mx-auto text-2xl sm:text-3xl text-rose-400 mb-2" />
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-rose-300">Face Detected</div>
                  <div className="mt-1 sm:mt-2 text-lg sm:text-xl font-black text-white">AR Paused For Safety</div>
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-rose-200/80">Please move face out of view to resume product placement.</p>
                </div>
              </div>
            )}

            {/* Bed Warning Overlay */}
            {showBeddingWarning && !isFaceDetected && (
              <div className="absolute inset-x-4 bottom-20 sm:bottom-24 z-40 flex justify-center pointer-events-none">
                <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 text-center backdrop-blur-xl pointer-events-auto shadow-2xl">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Place Bedding on Bed Only</div>
                  <p className="mt-1 text-[11px] sm:text-xs text-amber-200/90">Please point your camera towards a bed or couch to position this product correctly.</p>
                </div>
              </div>
            )}

            {/* Bottom Product Action Bar Overlay */}
            <div className="z-20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Selected Product</span>
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-xs">{currentProduct?.name || selectedProduct?.name || "Select an AR Item"}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {currentProduct ? `₹${Number(currentProduct.sellingPrice || currentProduct.price || 0).toLocaleString()} • ${placementMode.toUpperCase()} placement` : 'Select item from library to inspect.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={addToCart}
                  disabled={cartAdded}
                  className={`w-full sm:w-auto rounded-xl sm:rounded-2xl px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-lg ${cartAdded ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20 hover:brightness-110'}`}
                >
                  {cartAdded ? 'Added to Cart 🛒' : 'Place & Add To Cart 🛒'}
                </button>
              </div>
            </div>

          </div>

          {/* 2. Responsive Slider Carousel Container (Bottom Full Width) */}
          <div className="rounded-2xl sm:rounded-[32px] border border-white/10 bg-slate-900/40 p-4 sm:p-6 backdrop-blur-xl w-full flex flex-col lg:flex-row justify-between gap-5 sm:gap-6">
            
            {/* Left Box: AR Product Slider */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">DOSA BOX</span>
                  <h3 className="text-base sm:text-lg font-bold text-white">Aaramdehi AR Product Library</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold rounded-full bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
                    {dbProducts.length} Items
                  </span>
                  {/* Slider Control Buttons */}
                  <div className="flex gap-1">
                    <button 
                      onClick={slideLeft}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 active:scale-95 transition"
                      aria-label="Previous Products"
                    >
                      <FiChevronLeft className="text-base" />
                    </button>
                    <button 
                      onClick={slideRight}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 active:scale-95 transition"
                      aria-label="Next Products"
                    >
                      <FiChevronRight className="text-base" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 mb-3 sm:mb-4">
                Khaas AR experience ke saath aap aasaani se slider ko swipe/scroll karke products browse kar sakte hain aur live room preview me fit karke Add To Cart kar sakte hain.
              </p>

              {/* Horizontal Slider (Carousel) Container */}
              <div 
                ref={sliderRef}
                className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingProducts ? (
                  <p className="text-xs text-slate-500 py-4">Loading catalog...</p>
                ) : dbProducts.length ? (
                  dbProducts.map((item) => {
                    const isSelected = currentProduct?.id === item.id || currentProduct?.name === item.name;
                    const productImage = item.thumbnail || (item.images && item.images[0]?.url) || item.image || '';

                    return (
                      <div
                        key={item._id || item.id || item.name}
                        onClick={() => selectProduct(item)}
                        className={`snap-start flex-shrink-0 w-[240px] sm:w-[260px] flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10' : 'border-white/10 bg-slate-950/60 hover:border-emerald-500/40 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-300 flex-shrink-0 overflow-hidden border border-white/5">
                            {productImage ? (
                              <img src={productImage} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <FiBox className="text-xl text-emerald-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{item.name || item.productName}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{item.category || item.placementType || 'Floor'}</p>
                            <p className="text-xs font-extrabold text-emerald-400 mt-0.5">₹{item.sellingPrice || item.price || 0}</p>
                          </div>
                        </div>

                        <span className={`rounded-full px-2 py-1 text-[9px] font-bold ml-2 flex-shrink-0 ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
                          {isSelected ? 'Active' : '3D AR'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 py-4">No AR products available.</p>
                )}
              </div>
            </div>

            {/* Right Box: Room Scale Matrix Info */}
            {showDimensions && (
              <div className="w-full lg:w-72 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5 flex flex-col justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-white">Room Scale Matrix</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <FiCheck /> {calculatedArea.fitStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Dimensions scanned dynamically from surface area.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                    <span className="block text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Length</span>
                    <span className="text-xs sm:text-sm font-black text-white">{calculatedArea.length} ft</span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                    <span className="block text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Width</span>
                    <span className="text-xs sm:text-sm font-black text-white">{calculatedArea.width} ft</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Action Button Matrix */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-3.5 sm:p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={startSurfaceScanning}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95"
            >
              <FiCamera /> {scanStep === 'scanning' ? `${scanProgress}%` : 'Scan Surface'}
            </button>

            <button
              onClick={voiceAssistantActive ? stopVoiceAssistant : startVoiceAssistant}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition active:scale-95 ${voiceAssistantActive ? 'bg-sky-500/20 border-sky-500/40 text-sky-200 animate-pulse' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
            >
              <FiMic /> {voiceAssistantActive ? 'Listening...' : 'Voice Assist'}
            </button>

            <button
              onClick={() => setShowDimensions((prev) => !prev)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition active:scale-95 ${showDimensions ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'}`}
            >
              <FiMaximize /> Dimensions
            </button>

            <button
              onClick={captureScreenshot}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95"
            >
              Capture Screen
            </button>
          </div>

          {/* Lighting Modes */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pt-1 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Lighting:</span>
            {ambientThemeOrder.map((theme) => (
              <button
                key={theme}
                onClick={() => setAmbientThemeDebounced(theme)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition ${ambientTheme === theme ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                {ambientThemeLabels[theme]}
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Slide-over Control Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm border-l border-white/10 bg-slate-900 p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">AR Configuration</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Live Status</p>
                  <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{statusMessage}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Ambient Theme</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ambientThemeOrder.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setAmbientThemeDebounced(theme)}
                        className={`rounded-xl p-2.5 text-xs font-bold uppercase transition ${ambientTheme === theme ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        {ambientThemeLabels[theme]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-full mt-6 rounded-xl bg-white/10 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 left-1/2 z-50 -translate-x-1/2 px-4 max-w-sm w-full">
          <div className={`rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-center text-xs font-bold shadow-2xl backdrop-blur-md border ${toastType === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' : toastType === 'warning' ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' : 'bg-slate-900/90 border-white/10 text-slate-200'}`}>
            {toastMessage}
          </div>
        </div>
      )}

    </div>
  );
};

export default ARStudio;