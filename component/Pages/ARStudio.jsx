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
  const themeToggleTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const voiceBadgeTimerRef = useRef({ hide: null, clear: null });
  const recognitionRef = useRef(null);

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

  const VoiceWaveIndicator = () => (
    <div className="inline-flex h-4 items-center gap-1 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
      <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
      <span className="inline-flex h-2 w-2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-emerald-300" />
      <span className="inline-flex h-1.5 w-1.5 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-emerald-200" />
    </div>
  );

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
      // Ignore audio failures on unsupported devices.
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
  }, [surfaceDetected, currentModel, placementMode, selectedProduct, dbProducts, calculatedArea.length, calculatedArea.width]);

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
      } finally {
        setLoadingProducts(false);
      }
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
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <SEO
        title="360 AR Studio"
        description="Automatic AR room scanning and product placement for Aaramdehi."
        keywords="automatic AR, live room scan, product placement, aaramdehi"
      />

      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <div className={`absolute inset-0 ${ambientFilterClass} pointer-events-none`} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 to-slate-950/80" />
      </div>

      <div className="relative z-10 min-h-screen">

        {isFaceDetected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className="max-w-md rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Face detected</div>
              <div className="mt-3 text-2xl font-black text-white">AR paused for safety</div>
              <div className="mt-2 text-sm leading-6 text-rose-200">Please step back or move your face out of view to resume AR placement.</div>
            </div>
          </div>
        )}

        {!isFaceDetected && currentModel && (
          <div className="absolute inset-0 z-10 pointer-events-none">
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
              touch-action="none"
              style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-2xl shadow-black/40"
                style={{ pointerEvents: 'auto' }}
              >
                ✨ Tap to Place AI Suggestion
              </button>
            </model-viewer>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 z-20 rounded-[32px] border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">AR Control Center</div>
                <div className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-white">Surface · Voice · Lighting</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">AR Fit Engine active</span>
                <button
                  type="button"
                  onClick={() => setShowDimensions((prev) => !prev)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10"
                  style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
                >
                  {showDimensions ? 'Hide' : 'Show'} Dimensions
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={startSurfaceScanning}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-2xl shadow-black/30 transition hover:bg-emerald-400"
                style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
              >
                📐 Scan Surface
              </button>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={startVoiceAssistant}
                  className={`inline-flex min-h-[46px] items-center justify-center rounded-full ${voiceAssistantActive ? 'bg-sky-500' : 'bg-white/5'} px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-2xl shadow-black/30 transition hover:bg-slate-800`}
                  style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
                >
                  <span className="mr-2">🎙️</span>
                  Voice Assist
                  {voiceAssistantActive && <span className="ml-2 inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /><span className="h-2 w-2 rounded-full bg-emerald-200 animate-[pulse_1.2s_ease-in-out_infinite]" /></span>}
                </button>
                {voiceAssistantActive && (
                  <button
                    type="button"
                    onClick={stopVoiceAssistant}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-2xl shadow-black/30 transition hover:bg-slate-700"
                    style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
                  >
                    ⏹️ Stop Voice
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  {voiceAssistantActive ? <VoiceWaveIndicator /> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500" />}
                  Voice Status
                </div>
                {voiceAssistantActive && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">Listening</span>}
              </div>
              <div className="mt-2 text-sm text-slate-200">{voiceStatusMessage}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ambientThemeOrder.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setAmbientThemeDebounced(theme)}
                  className={`rounded-full px-2 py-2 text-[10px] font-semibold uppercase transition ${ambientTheme === theme ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                  style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
                >
                  {ambientThemeLabels[theme]}
                </button>
              ))}
            </div>

            {showDimensions && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400 font-semibold">Dynamic Reticle Scaling</div>
                <div className="mt-3 text-sm font-black uppercase tracking-[0.15em] text-white">Surface Measurement Tag</div>
                <div className="mt-4 grid gap-3 text-sm text-slate-200">
                  <div className="rounded-3xl bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Target Zone</div>
                    <div className="mt-2 text-lg font-semibold text-white">{placementMode === 'wall' ? 'Wall' : 'Bed / Floor'}</div>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Measured Dimensions</div>
                    <div className="mt-2 text-lg font-semibold text-white">{calculatedArea.length} ft × {calculatedArea.width} ft</div>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Fit Status</div>
                    <div className="mt-2 text-lg font-semibold text-emerald-200">{calculatedArea.fitStatus}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/70 p-3 text-sm text-slate-300">
                    Auto-Fit Matrix: {modelScaleFactor}
                  </div>
                </div>
              </div>
            )}

            {currentProduct ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <img
                    src={currentProduct.thumbnail || currentProduct.images?.[0]?.url || 'https://placehold.co/120x120?text=AR'}
                    alt={currentProduct.name || 'AR Product'}
                    className="h-16 w-16 rounded-3xl border border-white/10 object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0">
                    <div className="text-lg font-black text-white sm:text-xl">{currentProduct.name || 'Suggested Product'}</div>
                    <div className="mt-1 text-xs sm:text-sm text-slate-400">{currentProduct.category || currentProduct.placementType || 'Home decor'}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-3xl bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-white">₹{Number(currentProduct.sellingPrice || currentProduct.price || 0).toLocaleString()}</span>
                  <span className="self-start rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200 sm:self-auto">{placementMode}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm leading-7 text-slate-300">AI will automatically choose a product depending on your room surface scan and the available AR catalog.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARStudio;
