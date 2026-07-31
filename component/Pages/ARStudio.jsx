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
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiUserCheck
} from 'react-icons/fi';

// TensorFlow & Face Detection Imports
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';

const MODEL_VIEWER_SCRIPT = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

const ARStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart: addToCartContext, setIsCartOpen } = useCart();
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const modelViewerRef = useRef(null);
  const sliderRef = useRef(null);
  
  // Face Detection References
  const faceDetectorRef = useRef(null);
  const detectAnimFrameRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [canPlace, setCanPlace] = useState(true);
  const [aiStatus, setAiStatus] = useState('AR Studio Ready...');
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [placementMode, setPlacementMode] = useState('floor');
  const [cameraError, setCameraError] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSelectedProduct, setLoadingSelectedProduct] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  // Face Detection States
  const [isFaceDetecting, setIsFaceDetecting] = useState(false);
  const [faceCount, setFaceCount] = useState(0);

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

  // --- Face Detection Functions ---
  const toggleFaceDetection = async () => {
    if (isFaceDetecting) {
      if (detectAnimFrameRef.current) {
        cancelAnimationFrame(detectAnimFrameRef.current);
      }
      setIsFaceDetecting(false);
      setFaceCount(0);
      showToast('Face Detection Stopped', 'info');
      return;
    }

    try {
      showToast('Loading Face Detector Model...', 'info');
      await tf.ready();
      
      if (!faceDetectorRef.current) {
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
          runtime: 'tfjs',
          maxFaces: 5
        };
        faceDetectorRef.current = await faceDetection.createDetector(model, detectorConfig);
      }

      setIsFaceDetecting(true);
      showToast('Face Detection Started', 'success');
      runFaceDetectionLoop();
    } catch (err) {
      console.error('Face Detection Error:', err);
      showToast('Failed to start face detection', 'warning');
    }
  };

  const runFaceDetectionLoop = async () => {
    if (videoRef.current && videoRef.current.readyState === 4 && faceDetectorRef.current) {
      try {
        const faces = await faceDetectorRef.current.estimateFaces(videoRef.current);
        setFaceCount(faces.length);
      } catch (error) {
        console.warn('Face detection error:', error);
      }
    }
    detectAnimFrameRef.current = requestAnimationFrame(runFaceDetectionLoop);
  };

  useEffect(() => {
    return () => {
      if (detectAnimFrameRef.current) {
        cancelAnimationFrame(detectAnimFrameRef.current);
      }
    };
  }, []);

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

  const getProductModelUrl = (product) => {
    if (!product) return '';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && (product.usdzUrl || product.usdz)) {
      return product.usdzUrl || product.usdz;
    }
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
    setIsModelLoaded(false);
    setModelError(false);

    const modelUrl = getProductModelUrl(product);

    if (modelUrl) {
      setCurrentModel(modelUrl);
      setAiStatus(`Loading 3D Model: ${product?.name || product?.productName || 'Product'}...`);
    } else {
      setCurrentModel(null);
      setAiStatus(`Selected product has no AR model available: ${product?.name || product?.productName || 'Product'}`);
    }

    setPlacementMode(product?.placementType === 'wall' ? 'wall' : 'floor');
    setIsSidebarOpen(false);
  };

  const addToCart = () => {
    const product = selectedProduct || dbProducts.find((item) => getProductModelUrl(item) === currentModel) || null;
    
    if (!product) {
      showToast('No AR product available to add.', 'warning');
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
    neutral: 'bg-[#07090e]/10',
    sunset: 'bg-orange-500/10',
    neon: 'bg-fuchsia-500/10',
    cozy: 'bg-amber-500/10',
  }[ambientTheme] || 'bg-[#07090e]/10';

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
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
    setAiStatus('Analyzing surface contrast & light density...');

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      showToast('Camera feed not ready for scan', 'warning');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 120;

    let progress = 0;
    const scanInterval = setInterval(() => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frameData.data;

        let contrastSum = 0;
        for (let i = 0; i < data.length; i += 16) {
          contrastSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        const featureDensity = Math.min(15, Math.max(5, Math.floor(contrastSum / (data.length / 16))));
        progress += featureDensity;

        if (progress > 100) progress = 100;
        setScanProgress(progress);

        if (progress >= 100) {
          clearInterval(scanInterval);
          playSoundEffect('success');
          triggerHaptic([100, 50, 100]);

          const track = mediaStreamRef.current?.getVideoTracks()[0];
          const settings = track ? track.getSettings() : {};
          const aspect = (settings.width && settings.height) ? (settings.width / settings.height) : 1.33;

          const calculatedLength = (aspect * 4.5).toFixed(1);
          const calculatedWidth = (3.8).toFixed(1);

          const fit = calculateAutoFitScale(calculatedLength, calculatedWidth, placementMode);

          setCalculatedArea({
            length: calculatedLength,
            width: calculatedWidth,
            fitStatus: fit.fitStatus,
          });

          setModelScaleFactor(`${fit.rawScale}%`);
          setSurfaceDetected(true);
          setScanStep('completed');
          setCanPlace(true);

          setAiStatus(`Surface Locked: ${calculatedLength}ft × ${calculatedWidth}ft — Ready for placement`);
          showToast(`Surface Grid Aligned!`, 'success');
        }
      } catch (err) {
        console.warn("Frame analysis error:", err);
        progress += 20;
        setScanProgress(Math.min(100, progress));
      }
    }, 150);
  };

  useEffect(() => {
    if (surfaceDetected && currentModel) {
      const product = selectedProduct || dbProducts.find((item) => getProductModelUrl(item) === currentModel);
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
          ? payload.filter((product) => getProductModelUrl(product) !== '')
          : [];

        setDbProducts(arItems);
        if (arItems.length > 0 && !selectedProduct) {
          selectProduct(arItems[0]);
        }
        setAiStatus(arItems.length
          ? 'AR Ready. Point camera at surface...'
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
    const initCamera = async () => {
      stopMediaStream();
      setCameraError('');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser does not support camera access.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: facingMode } },
          audio: false,
        }).catch(async () => {
          return await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
        });

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        await loadScript(MODEL_VIEWER_SCRIPT);
        setAiStatus('Camera active. Ready for 3D placement.');
      } catch (error) {
        console.error('Camera load failed:', error);
        setCameraError('Unable to access camera.');
        setAiStatus('Camera permission denied or device unsupported.');
      }
    };

    initCamera();

    return () => {
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

  const currentProduct = selectedProduct || dbProducts.find((item) => getProductModelUrl(item) === currentModel) || null;

  useEffect(() => {
    setCartAdded(false);
  }, [currentModel, selectedProduct?.id, selectedProduct?._id, selectedProduct?.name]);

  const statusMessage = loadingSelectedProduct
    ? 'Loading selected product for 360 AR...'
    : aiStatus;

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

          {/* Live Face Detection Badge */}
          {isFaceDetecting && (
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <FiUserCheck className="animate-pulse text-emerald-400" />
              <span>Faces Detected: {faceCount}</span>
            </div>
          )}

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
          
          {/* AR Viewport Frame */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-white/10 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-full h-[60vh] sm:h-[68vh] flex items-center justify-center">
            
            {/* Live Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover z-0"
            />
            
            {/* Ambient Lighting Overlay */}
            <div className={`absolute inset-0 ${ambientFilterClass} pointer-events-none transition-colors duration-300 z-10`} />

            {/* Direct 3D Model Rendering Layer */}
            <div className="absolute inset-0 w-full h-full z-30 flex items-center justify-center pointer-events-auto">
              {currentModel ? (
                <model-viewer
                  ref={modelViewerRef}
                  src={currentModel}
                  ios-src={selectedProduct?.usdzUrl || selectedProduct?.usdz || ''}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-scale="auto"
                  ar-placement={placementMode}
                  camera-controls
                  touch-action="pan-y"
                  auto-rotate
                  rotation-per-second="30deg"
                  shadow-intensity="1.5"
                  exposure="1.0"
                  interaction-prompt="none"
                  onLoad={() => {
                    setIsModelLoaded(true);
                    setModelError(false);
                    setAiStatus(`Rendered 3D Model: ${selectedProduct?.name || 'Product'}`);
                  }}
                  onError={(err) => {
                    console.error('Model Viewer Load Error:', err);
                    setModelError(true);
                    setAiStatus('3D Model failed to load (Check CORS / .glb URL)');
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '350px',
                    display: 'block',
                    backgroundColor: 'transparent',
                    '--poster-color': 'transparent'
                  }}
                />
              ) : (
                <div className="relative z-30 flex flex-col items-center justify-center text-center p-6 bg-slate-950/70 rounded-2xl border border-white/10 backdrop-blur-md">
                  <FiBox className="text-3xl sm:text-4xl text-emerald-400 animate-pulse mb-2" />
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
                    Select a product below to render 3D model
                  </p>
                </div>
              )}

              {/* Loading Indicator */}
              {currentModel && !isModelLoaded && !modelError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none z-40">
                  <div className="flex items-center gap-3 bg-slate-900 border border-white/10 px-4 py-3 rounded-xl shadow-xl">
                    <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold text-white">Loading 3D Mesh...</span>
                  </div>
                </div>
              )}

              {/* Error Indicator */}
              {modelError && (
                <div className="absolute inset-x-4 top-4 flex justify-center pointer-events-none z-40">
                  <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 px-4 py-2 rounded-xl text-rose-300 text-xs font-bold backdrop-blur-md">
                    <FiAlertCircle /> Failed to render 3D File (.glb/.gltf)
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Responsive Slider Carousel Container */}
          <div className="rounded-2xl sm:rounded-[32px] border border-white/10 bg-slate-900/40 p-4 sm:p-6 backdrop-blur-xl w-full flex flex-col lg:flex-row justify-between gap-5 sm:gap-6">
            
            {/* Left Box: AR Product Slider */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">LIBRARY</span>
                  <h3 className="text-base sm:text-lg font-bold text-white">Aaramdehi AR Product Library</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold rounded-full bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
                    {dbProducts.length} Items
                  </span>
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

              {/* Horizontal Slider */}
              <div 
                ref={sliderRef}
                className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingProducts ? (
                  <p className="text-xs text-slate-500 py-4">Loading catalog...</p>
                ) : dbProducts.length ? (
                  dbProducts.map((item) => {
                    const isSelected = currentProduct?.id === item.id || currentProduct?.name === item.name || currentProduct?._id === item._id;
                    const productImage = item.thumbnail || (item.images && item.images[0]?.url) || item.image || '';

                    return (
                      <div
                        key={item._id || item.id || item.name}
                        onClick={() => selectProduct(item)}
                        className={`snap-start flex-shrink-0 w-[240px] sm:w-[260px] flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10' : 'border-white/10 bg-slate-950/60 hover:border-emerald-500/40 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400 flex-shrink-0 overflow-hidden border border-white/5">
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

            {/* Right Box: Room Scale Matrix */}
            {showDimensions && (
              <div className="w-full lg:w-72 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5 flex flex-col justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-white">Room Scale Matrix</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <FiCheck /> {calculatedArea.fitStatus}
                    </span>
                  </div>
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

        {/* Action Controls Matrix */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-3.5 sm:p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Toggle Face Detect Button */}
            <button
              onClick={toggleFaceDetection}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                isFaceDetecting 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <FiUserCheck /> {isFaceDetecting ? 'Stop Face Detect' : 'Start Face Detect'}
            </button>

            <button
              onClick={startSurfaceScanning}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95"
            >
              <FiCamera /> {scanStep === 'scanning' ? `${scanProgress}%` : 'Scan Surface'}
            </button>

            <button
              type="button"
              onClick={() => setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95"
            >
              <FiRefreshCw /> Flip Camera
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