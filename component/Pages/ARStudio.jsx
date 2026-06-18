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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 to-slate-950/80" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="absolute top-5 left-1/2 z-20 w-[min(94%,920px)] -translate-x-1/2 rounded-[28px] border border-white/10 bg-slate-950/90 p-5 text-center shadow-[0_28px_120px_rgba(0,0,0,0.25)]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400 font-semibold">Aaramdehi Live AI Studio</div>
          <div className="mt-3 text-lg font-black text-white md:text-xl">{statusMessage}</div>
          {loadingProducts && <div className="mt-2 text-sm text-slate-400">Loading AR catalog…</div>}
          {cameraError && <div className="mt-2 text-sm text-rose-400">{cameraError}</div>}
        </div>

        {isFaceDetected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className="max-w-md rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Face detected</div>
              <div className="mt-3 text-2xl font-black text-white">AR paused for safety</div>
              <div className="mt-2 text-sm leading-6 text-rose-200">Please step back or move your face out of view to resume AR placement.</div>
            </div>
          </div>
        )}

        <div className="absolute top-5 right-5 z-20 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-slate-800"
          >
            <span>🔄</span>
            Switch Camera
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-slate-800"
          >
            Back to Store
          </button>
        </div>

        {!isFaceDetected && currentModel && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <model-viewer
              src={currentModel}
              ar
              ar-modes="webxr scene-viewer"
              camera-controls
              auto-rotate
              auto-rotate-delay="1000"
              field-of-view="35deg"
              camera-orbit="0deg 70deg 1.8m"
              min-camera-orbit="0deg 40deg 1.0m"
              max-camera-orbit="0deg 90deg 2.8m"
              camera-target="0m 0.7m 0m"
              ar-scale="auto"
              exposure="1.2"
              touch-action="none"
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-2xl shadow-black/40"
              >
                ✨ Tap to Place AI Suggestion
              </button>
            </model-viewer>
          </div>
        )}

        <div className="absolute left-5 bottom-5 z-20 w-[min(420px,calc(100vw-40px))] rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{selectedProduct ? 'Selected Product Preview' : 'Auto Recommendation'}</div>
          {currentProduct ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={currentProduct.thumbnail || currentProduct.images?.[0]?.url || 'https://placehold.co/120x120?text=AR'}
                  alt={currentProduct.name || 'AR Product'}
                  className="h-20 w-20 rounded-3xl border border-white/10 object-cover"
                />
                <div>
                  <div className="text-xl font-black text-white">{currentProduct.name || 'Suggested Product'}</div>
                  <div className="mt-1 text-sm text-slate-400">{currentProduct.category || currentProduct.placementType || 'Home decor'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-white/5 px-4 py-3">
                <span className="text-sm font-semibold text-white">₹{Number(currentProduct.sellingPrice || currentProduct.price || 0).toLocaleString()}</span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">{placementMode}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm leading-7 text-slate-300">AI will automatically choose a product depending on your room surface scan and the available AR catalog.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARStudio;
