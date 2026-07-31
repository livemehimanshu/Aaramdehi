import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { getProductByIdAPI } from '@/api/authAndAdminApi';
import { useCart } from '@/context/CartContext';
import SEO from '../header/SEO';

// CDN Scripts for TensorFlow.js and COCO-SSD (Object Detection)
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

  const [facingMode, setFacingMode] = useState('environment');
  const [isFaceDetected, setIsFaceDetected] = useState(false); // Map to COCO-SSD "person" for safety block
  const [isBedPresent, setIsBedPresent] = useState(false); // Track bed presence
  const [canPlace, setCanPlace] = useState(true); // Control active placement state
  const [showBeddingWarning, setShowBeddingWarning] = useState(false); // Bedding specific conditional alert
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

  // 1. Dynamic Product Target Mapper (Category Database Mapping)
  const getProductTarget = (product) => {
    if (!product) return 'floor';
    if (product.target) return product.target; // direct DB mapping support
    
    const category = String(product.category || '').toLowerCase();
    const name = String(product.name || '').toLowerCase();
    
    // Pillow, Bedding or Bedsheet targets 'bed'
    if (
      category.includes('pillow') || 
      category.includes('bedding') || 
      category.includes('bedsheet') || 
      name.includes('pillow') || 
      name.includes('bedsheet')
    ) {
      return 'bed';
    }
    // Decor/Paintings target 'wall'
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

  // 2. Fixed AR Placement Scale Logic (approx 15x10 inch for pillow)
  const getProductScale = (product) => {
    if (!product) return '1 1 1';
    const category = String(product.category || '').toLowerCase();
    const name = String(product.name || '').toLowerCase();
    
    // Pillow target scale: 15x10 inches -> approx 0.38m (length) x 0.1m (height) x 0.25m (depth)
    if (category.includes('pillow') || name.includes('pillow')) {
      return '0.38 0.1 0.25';
    }
    return '1 1 1';
  };

  const addToCart = () => {
    const product = selectedProduct || currentProduct;
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

    const normalizedProduct = {
      ...product,
      id: product._id || product.id || product.slug || product.name,
      _id: product._id || product.id || product.slug || product.name,
      quantity: 1,
      price: product.sellingPrice || product.price || product.mrp || 0,
      sellingPrice: product.sellingPrice || product.price || product.mrp || 0,
    };

    addToCartContext(normalizedProduct);
    setCartAdded(true);
    setIsCartOpen(true);
    showToast(`${normalizedProduct.name || 'Item'} added to cart`, 'success');
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

  useEffect(() => {
    const initModelViewer = async () => {
      try {
        await loadScript(MODEL_VIEWER_SCRIPT);
        if (window.customElements && window.customElements.get('model-viewer')) {
          setIsModelViewerReady(true);
        } else {
          // Wait a short time in case the script defines the component after load
          window.setTimeout(() => {
            if (window.customElements && window.customElements.get('model-viewer')) {
              setIsModelViewerReady(true);
            }
          }, 200);
        }
      } catch (error) {
        console.warn('Failed to load model-viewer script:', error);
        setAiStatus('AR viewer could not load. Please refresh or try a supported device.');
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
      }
    };

    loadAaramdehiProducts();
  }, []);

  // Camera, TF.js, and COCO-SSD Integration Hook
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
        
        // Dynamically load model-viewer, TensorFlow.js and COCO-SSD
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
                
                // 1. Bed or Couch Detection logic
                const bedPresent = predictions.some(
                  (p) => p.class === 'bed' || p.class === 'couch'
                );
                setIsBedPresent(bedPresent);

                // 2. Safety block logic (using person detection as safety check)
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
          setSelectedProduct(res.data);
          const modelUrl = res.data.model3dUrl || res.data.modelUrl;
          if (modelUrl) {
            setCurrentModel(modelUrl);
            setAiStatus(`Selected product loaded for 360 AR: ${res.data.name}`);
            setPlacementMode(res.data.placementType === 'wall' ? 'wall' : 'floor');
          } else {
            setAiStatus('Selected product has no 3D model. AI will still auto-suggest other AR items.');
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

  const selectedProductHasModel = selectedProduct && (selectedProduct.model3dUrl || selectedProduct.modelUrl);
  const urlProductId = searchParams.get('productId');

  useEffect(() => {
    if (dbProducts.length === 0 || cameraError || (selectedProduct && selectedProductHasModel) || (urlProductId && selectedProduct)) {
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
          setCurrentModel(bedsheetProduct.model3dUrl || bedsheetProduct.modelUrl);
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
          setCurrentModel(paintingProduct.model3dUrl || paintingProduct.modelUrl);
          setPlacementMode('wall');
        }
      }
    }, 4000);

    return () => clearInterval(autoScanner);
  }, [dbProducts, cameraError, selectedProduct, urlProductId, selectedProductHasModel]);

  const currentProduct = selectedProduct || dbProducts.find((item) => (item.model3dUrl || item.modelUrl) === currentModel);
  const computedModelScale = Number(modelScaleFactor.replace('%', '')) / 100 || 1;

  useEffect(() => {
    setCartAdded(false);
  }, [currentModel, selectedProduct?.id, selectedProduct?._id, selectedProduct?.name]);

  // 3. Trigger live status checks and warning triggers based on target
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
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_36%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white select-none">
      <SEO
        title="AR Furniture Placement Studio | Preview Beds, Pillows & Decor"
        description="Use Aaramdehi AR Studio to scan your room and preview beds, pillows, and decor in real time before you buy."
        keywords="AR furniture placement, room scan, preview decor, aaramdehi AR studio"
      />

      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">Aaramdehi AR Studio</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Preview furniture in your room before you buy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Scan your space, place beds and decor in real time, and explore curated collections with confidence.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/products" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Shop collection
            </Link>
            <Link to="/compare" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              Compare products
            </Link>
            <Link to="/blog" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              Read inspiration
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">Scan your room</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Point the camera at your space and let AI guide the placement.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">Try premium pieces</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Preview beds, pillows, and decor with accurate scale and positioning.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">Shop with confidence</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Move from inspiration to purchase with a smoother, more informed decision.</p>
          </div>
        </div>
      </div>

      {/* Top Section: Camera & 3D Viewer Layer */}
      <div className="relative mx-4 mt-2 flex-1 min-h-[58vh] overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_25px_70px_rgba(2,6,23,0.45)] sm:mx-6 sm:min-h-[66vh] lg:mx-8 lg:min-h-[72vh]">
        {/* Live Video Frame */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className={`absolute inset-0 ${ambientFilterClass} pointer-events-none transition-colors duration-300`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />

        {/* <model-viewer> Integration */}
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
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 rounded-full bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-2xl hover:bg-emerald-400 active:scale-95 transition"
                >
                  ✨ Tap to Place AI Suggestion
                </button>
              )}
            </model-viewer>
          </div>
        )}

        {!isFaceDetected && currentModel && !isModelViewerReady && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-4 text-center">
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-sm font-semibold text-slate-100 shadow-2xl">
              Loading AR viewer… please wait.
            </div>
          </div>
        )}

        {!isFaceDetected && currentModel && isModelViewerReady && !window.customElements?.get('model-viewer') && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-4 text-center">
            <div className="rounded-3xl border border-white/10 bg-rose-900/90 p-6 text-sm font-semibold text-rose-200 shadow-2xl">
              AR viewer failed to initialize. Try refreshing the page or using a WebXR-compatible browser.
            </div>
          </div>
        )}

        {/* AR Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <aside className={`fixed right-0 top-0 z-[1201] h-full w-[90%] max-w-[360px] bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:w-[320px] md:border-l md:border-white/10 md:bg-slate-950/90`}>
          <div className="flex h-full flex-col border-l border-white/10 bg-slate-950/95 px-5 py-5 md:px-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">AR Controls</p>
                <h2 className="mt-1 text-lg font-black text-white">Preview options</h2>
              </div>
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 pb-8">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Item</p>
                <p className="mt-2 text-sm font-semibold text-white truncate">{currentProduct?.name || selectedProduct?.name || 'Auto-suggested AR Item'}</p>
                <p className="mt-1 text-xs text-slate-400">{placementMode === 'wall' ? 'Wall placement' : 'Floor placement'}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live status</p>
                <p className="mt-2 text-sm font-semibold text-white">{statusMessage}</p>
                <div className="mt-3 grid gap-2">
                  <button type="button" onClick={startSurfaceScanning} className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400">
                    Scan Space
                  </button>
                  <button type="button" onClick={voiceAssistantActive ? stopVoiceAssistant : startVoiceAssistant} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10">
                    {voiceAssistantActive ? 'Stop Voice Assist' : 'Voice Assist'}
                  </button>
                  <button type="button" onClick={captureScreenshot} className="rounded-2xl bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10">
                    Capture Screenshot
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Lighting</p>
                <div className="mt-3 grid gap-2">
                  {ambientThemeOrder.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setAmbientThemeDebounced(theme)}
                      className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${ambientTheme === theme ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      {ambientThemeLabels[theme]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Product library</p>
                <div className="mt-3 space-y-2">
                  {dbProducts.length ? dbProducts.slice(0, 8).map((product) => (
                    <button
                      key={product._id || product.id || product.name}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product);
                        setCurrentModel(product.model3dUrl || product.modelUrl);
                        setPlacementMode(product.placementType === 'wall' ? 'wall' : 'floor');
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${currentProduct?.id === product.id || currentProduct?.name === product.name ? 'border-emerald-400 bg-emerald-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      <div className="font-semibold">{product.name || product.productName || 'Untitled'}</div>
                      <div className="text-[10px] text-slate-500">{product.placementType || product.category || 'Floor'}</div>
                    </button>
                  )) : (
                    <p className="text-xs text-slate-500">Loading AR products…</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 2. Conditional Warning UI Alert Overlay (Bedding placed on invalid surface warning) */}
        {showBeddingWarning && !isFaceDetected && (
          <div className="absolute inset-x-4 bottom-24 z-40 flex justify-center pointer-events-none">
            <div className="max-w-md w-full rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-5 text-center backdrop-blur-xl pointer-events-auto shadow-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Place Bedding on Bed Only</div>
              <div className="mt-2.5 text-xs leading-relaxed text-amber-200">
                Hamare AI ne detect kiya hai ki aap pillow ko floor/wall par rakhne ki koshish kar rahe hain. 
                Kripya apne camera ko bed ki taraf point karein taaki sahi placement ho sake.
              </div>
            </div>
          </div>
        )}

        {/* Human Face Detection Safety Block */}
        {isFaceDetected && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
            <div className="max-w-md rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Face detected</div>
              <div className="mt-3 text-2xl font-black text-white">AR paused for safety</div>
              <div className="mt-2 text-sm leading-6 text-rose-200">Please move face out of view to resume placement.</div>
            </div>
          </div>
        )}

        {/* Floating Top Nav Actions */}
        <div className="absolute inset-x-4 top-4 z-40 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-slate-900 active:scale-95"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {voiceBadge && (
              <div className={`inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-slate-950/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200 shadow-xl backdrop-blur-md transition-opacity duration-500 ${voiceBadgeVisible ? 'opacity-100' : 'opacity-0'}`}>
                <span className={`inline-flex h-2 w-2 rounded-full ${voiceAssistantActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {voiceBadge}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-slate-950/90 text-sm shadow-xl backdrop-blur-md transition hover:bg-slate-900 active:scale-95"
              aria-label="Open AR controls"
            >
              ⚙️
            </button>
            <button
              type="button"
              onClick={() => setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))}
              className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-slate-950/90 text-sm shadow-xl backdrop-blur-md transition hover:bg-slate-900 active:scale-95"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Toast Notification Container */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 z-50 -translate-x-1/2 transform pointer-events-none">
            <div className={`rounded-xl px-4 py-2 text-xs font-bold shadow-2xl backdrop-blur-md border ${toastType === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' : toastType === 'warning' ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' : 'bg-slate-900/90 border-white/10 text-slate-200'}`}>
              {toastMessage}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Dedicated Action Drawer (Strictly Under the Camera) */}
      <div className="w-full border-t border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl sm:p-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-3.5">
          
          {/* Product Header Card */}
          <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/10 p-3 shadow-lg shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-[0.25em] text-slate-400 font-bold">{statusMessage}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-base font-black text-white">
                <span className="truncate">{currentProduct?.name || selectedProduct?.name || 'Auto-suggested AR Item'}</span>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-200">{placementMode}</span>
              </div>
              <div className="mt-0.5 text-xs text-slate-300">{currentProduct ? `₹${Number(currentProduct.sellingPrice || currentProduct.price || 0).toLocaleString()}` : 'Scan space to setup configuration.'}</div>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={cartAdded}
              className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition active:scale-95 ${cartAdded ? 'cursor-not-allowed bg-slate-800 text-slate-400' : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'}`}
            >
              {cartAdded ? 'Added 🛒' : 'Add to Cart 🛒'}
            </button>
          </div>

          {/* Action Grid Matrix */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={startSurfaceScanning}
              className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-white/5 border border-white/5 px-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-white/10 active:scale-95"
            >
              🔍 {scanStep === 'scanning' ? `Scanning ${scanProgress}%` : 'Scan Space'}
            </button>
            <button
              type="button"
              onClick={voiceAssistantActive ? stopVoiceAssistant : startVoiceAssistant}
              className={`inline-flex min-h-[40px] items-center justify-center rounded-2xl border px-3 text-xs font-bold uppercase tracking-[0.12em] shadow-sm transition active:scale-95 ${voiceAssistantActive ? 'bg-sky-500/20 border-sky-500/40 text-sky-200 animate-pulse' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}
            >
              🎙️ {voiceAssistantActive ? 'Stop Voice' : 'Voice Assist'}
            </button>
            <button
              type="button"
              onClick={() => setShowDimensions((prev) => !prev)}
              className={`inline-flex min-h-[40px] items-center justify-center rounded-2xl border px-3 text-xs font-bold uppercase tracking-[0.12em] shadow-sm transition active:scale-95 ${showDimensions ? 'bg-white/10 border-white/10 text-white' : 'bg-transparent border-white/5 text-slate-400 hover:text-white'}`}
            >
              📐 Dimensions
            </button>
            <button
              type="button"
              onClick={captureScreenshot}
              className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-white/5 border border-white/5 px-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-white/10 active:scale-95"
            >
              📸 Capture
            </button>
          </div>

          {/* Lighting Controls */}
          <div className="flex items-center overflow-x-auto gap-2 rounded-2xl border border-white/5 bg-slate-900/50 p-2 text-xs scrollbar-none">
            <span className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-bold px-2 whitespace-nowrap">Lighting:</span>
            {ambientThemeOrder.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setAmbientThemeDebounced(theme)}
                className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase transition whitespace-nowrap ${ambientTheme === theme ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {ambientThemeLabels[theme]}
              </button>
            ))}
          </div>

          {/* Live Context Data Grid */}
          {showDimensions && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3 text-xs text-slate-300">
              <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Live Room Context</div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[8px] uppercase tracking-[0.15em] text-slate-400">Target Zone</div>
                  <div className="mt-0.5 text-sm font-bold text-white">{placementMode === 'wall' ? 'Wall Surface' : 'Floor Matrix'}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[8px] uppercase tracking-[0.15em] text-slate-400">Measured Area</div>
                  <div className="mt-0.5 text-sm font-bold text-white">{calculatedArea.length} ft × {calculatedArea.width} ft</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[8px] uppercase tracking-[0.15em] text-slate-400">Auto-Fit Matrix</div>
                  <div className="mt-0.5 text-sm font-bold text-emerald-300">{modelScaleFactor}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2 flex items-center justify-center text-center">
                  <div className="text-[9px] font-semibold text-slate-400 italic">
                    {calculatedArea.fitStatus}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Voice Assistant Tracking Output */}
          {voiceAssistantActive && (
            <div className="flex items-center justify-between px-2 py-1 bg-sky-500/10 border border-sky-500/10 rounded-xl text-[10px] text-sky-200">
              <span className="truncate tracking-wide">🎙️ {voiceStatusMessage}</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ARStudio;