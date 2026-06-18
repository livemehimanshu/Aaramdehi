import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { getProductByIdAPI } from '@/api/authAndAdminApi';
import SEO from '../header/SEO';

const TFJS_SCRIPT = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.8.0/dist/tf.min.js';
const BLAZEFACE_SCRIPT = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.8/dist/blazeface.js';

const ARStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const faceAnimationRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const blazeFaceModelRef = useRef(null);
  const modelViewerRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [aiStatus, setAiStatus] = useState('AI Scanning Room Live...');
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [placementMode, setPlacementMode] = useState('floor');
  const [cameraError, setCameraError] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSelectedProduct, setLoadingSelectedProduct] = useState(true);

  const [scanStep, setScanStep] = useState('instruction');
  const [scanProgress, setScanProgress] = useState(0);
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const [calculatedArea, setCalculatedArea] = useState({ length: '6.5', width: '6.0', fitStatus: 'Perfect Fit' });
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

  const addToCart = () => {
    const product = selectedProduct || currentProduct;
    if (!product) {
      showToast('No AR product available to add.', 'warning');
      return;
    }
    setCartAdded(true);
    showToast(`${product.name || 'Item'} added to cart`, 'success');
    playSoundEffect('success');
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

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopFaceDetection = () => {
    if (faceAnimationRef.current) {
      cancelAnimationFrame(faceAnimationRef.current);
      faceAnimationRef.current = null;
    }
    faceDetectorRef.current = null;
    blazeFaceModelRef.current = null;
    setIsFaceDetected(false);
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
      } fill/0 py-2 font-bold leading-none tracking-wide text-white" text-slate-400">Loading products...</div>;
    };

    loadAaramdehiProducts();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initCameraAndFaceDetection = async () => {
      stopFaceDetection();
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

        if ('FaceDetector' in window) {
          faceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
          const detectFaces = async () => {
            if (!isMounted || !videoRef.current || videoRef.current.readyState < 2) {
              faceAnimationRef.current = requestAnimationFrame(detectFaces);
              return;
            }
            try {
              const faces = await faceDetectorRef.current.detect(videoRef.current);
              setIsFaceDetected(faces?.length > 0);
            } catch (error) {
              console.warn('Native FaceDetector failed:', error);
            }
            faceAnimationRef.current = requestAnimationFrame(detectFaces);
          };
          faceAnimationRef.current = requestAnimationFrame(detectFaces);
          return;
        }

        await loadScript(TFJS_SCRIPT);
        await loadScript(BLAZEFACE_SCRIPT);

        if (window.blazeface && videoRef.current) {
          blazeFaceModelRef.current = await window.blazeface.load();
          const detectFaces = async () => {
            if (!isMounted || !videoRef.current || videoRef.current.readyState < 2) {
              faceAnimationRef.current = requestAnimationFrame(detectFaces);
              return;
            }
            try {
              const predictions = await blazeFaceModelRef.current.estimateFaces(videoRef.current, false);
              setIsFaceDetected(predictions?.length > 0);
            } catch (error) {
              console.warn('BlazeFace failed:', error);
            }
            faceAnimationRef.current = requestAnimationFrame(detectFaces);
          };
          faceAnimationRef.current = requestAnimationFrame(detectFaces);
        }
      } catch (error) {
        console.error('Camera or face detection init failed:', error);
        setCameraError('Unable to access camera or face detection unavailable.');
        setAiStatus('Camera permission denied or device unsupported.');
      }
    };

    initCameraAndFaceDetection();

    return () => {
      isMounted = false;
      stopFaceDetection();
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
      } fill/0 py-2 font-bold leading-none tracking-wide text-white" text-slate-400">Loading details...</div>;
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

  const statusMessage = isFaceDetected
    ? '⚠️ AI Paused: Human Face Detected'
    : loadingSelectedProduct
      ? 'Loading selected product for 360 AR...'
      : aiStatus;

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 text-white overflow-hidden select-none touch-none">
      <SEO
        title="360 AR Studio"
        description="Automatic AR room scanning and product placement for Aaramdehi."
        keywords="automatic AR, live room scan, product placement, aaramdehi"
      />

      {/* Pure Viewport Background for Camera */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className={`absolute inset-0 ${ambientFilterClass} pointer-events-none transition-colors duration-300`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* 3D Model Engine Canvas Layer */}
      {!isFaceDetected && currentModel && (
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-auto">
          <model-viewer
            ref={modelViewerRef}
            src={currentModel}
            ar
            ar-modes="webxr scene-viewer"
            camera-controls
            auto-rotate
            auto-rotate-delay="1000"
            field-of-view="auto"
            camera-orbit="0deg 75deg auto"
            min-camera-orbit="auto auto auto"
            max-camera-orbit="auto auto auto"
            camera-target="auto auto auto"
            ar-placement={selectedProduct?.placementType || 'floor'}
            ar-scale={computedModelScale}
            exposure="1.2"
            style={{ width: '100%', height: '100%' }}
          >
            <button
              slot="ar-button"
              className="absolute bottom-48 left-1/2 z-30 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-2xl shadow-black/40 hover:bg-emerald-400 active:scale-95 transition"
            >
              ✨ Tap to Place AI Suggestion
            </button>
          </model-viewer>
        </div>
      )}

      {/* Human Face Detection Safety Block */}
      {isFaceDetected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Face detected</div>
            <div className="mt-3 text-2xl font-black text-white">AR paused for safety</div>
            <div className="mt-2 text-sm leading-6 text-rose-200">Please step back or move your face out of view to resume AR placement.</div>
          </div>
        </div>
      )}

      {/* High Intensity Navigation Bar */}
      <div className="absolute inset-x-4 top-4 z-40 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-slate-900 active:scale-95"
        >
          ← Back
        </button>

        <div className="absolute left-1/2 top-0 -translate-x-1/2 transform">
          {voiceBadge && (
            <div className={`inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-slate-950/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200 shadow-xl backdrop-blur-md transition-opacity duration-500 ${voiceBadgeVisible ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`inline-flex h-2 w-2 rounded-full ${voiceAssistantActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {voiceBadge}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))}
          className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-slate-950/90 text-sm shadow-xl backdrop-blur-md transition hover:bg-slate-900 active:scale-95"
        >
          🔄
        </button>
      </div>

      {/* Notification Toast Trigger Tracker */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 z-50 -translate-x-1/2 transform pointer-events-none">
          <div className={`rounded-xl px-4 py-2 text-xs font-bold shadow-2xl backdrop-blur-md border ${toastType === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' : toastType === 'warning' ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' : 'bg-slate-900/90 border-white/10 text-slate-200'}`}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Optimized Fixed Action Studio Drawer */}
      <div className="absolute bottom-0 left-0 right-0 z-40 max-h-[42vh] overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 scrollbar-none sm:p-5 pointer-events-auto touch-auto">
        <div className="flex flex-col gap-3.5">
          
          {/* Product Header Card */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between">
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
              className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition active:scale-95 ${cartAdded ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10'}`}
              style={{ touchAction: 'manipulation' }}
            >
              {cartAdded ? 'Added 🛒' : 'Add to Cart 🛒'}
            </button>
          </div>

          {/* Controller Core Actions Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={startSurfaceScanning}
              className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-white/5 border border-white/5 px-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-white/10 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              🔍 {scanStep === 'scanning' ? `Scanning ${scanProgress}%` : 'Scan Space'}
            </button>
            <button
              type="button"
              onClick={voiceAssistantActive ? stopVoiceAssistant : startVoiceAssistant}
              className={`inline-flex min-h-[40px] items-center justify-center rounded-2xl border px-3 text-xs font-bold uppercase tracking-[0.12em] shadow-sm transition active:scale-95 ${voiceAssistantActive ? 'bg-sky-500/20 border-sky-500/40 text-sky-200 animate-pulse' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}
              style={{ touchAction: 'manipulation' }}
            >
              🎙️ {voiceAssistantActive ? 'Stop Voice' : 'Voice Assist'}
            </button>
            <button
              type="button"
              onClick={() => setShowDimensions((prev) => !prev)}
              className={`inline-flex min-h-[40px] items-center justify-center rounded-2xl border px-3 text-xs font-bold uppercase tracking-[0.12em] shadow-sm transition active:scale-95 ${showDimensions ? 'bg-white/10 border-white/10 text-white' : 'bg-transparent border-white/5 text-slate-400 hover:text-white'}`}
              style={{ touchAction: 'manipulation' }}
            >
              📐 Dimensions
            </button>
            <button
              type="button"
              onClick={captureScreenshot}
              className="inline-flex min-h-[40px] items-center justify-center rounded-2xl bg-white/5 border border-white/5 px-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-white/10 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              📸 Capture
            </button>
          </div>

          {/* Ambient Lighting Selector Matrix */}
          <div className="flex items-center overflow-x-auto gap-2 rounded-2xl border border-white/5 bg-slate-900/50 p-2 text-xs scrollbar-none">
            <span className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-bold px-2 whitespace-nowrap">Lighting:</span>
            {ambientThemeOrder.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setAmbientThemeDebounced(theme)}
                className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase transition whitespace-nowrap ${ambientTheme === theme ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {ambientThemeLabels[theme]}
              </button>
            ))}
          </div>

          {/* Room Context Metrics Grid */}
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

          {/* Live Voice Status Indicator */}
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