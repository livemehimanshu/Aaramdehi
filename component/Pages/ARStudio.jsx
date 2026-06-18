import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axiosInstance';
import { getProductByIdAPI } from '@/api/authAndAdminApi';
import SEO from '../header/SEO';

const ARStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoRef = useRef(null);
  const [aiStatus, setAiStatus] = useState('AI Scanning Room Live...');
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [placementMode, setPlacementMode] = useState('floor');
  const [cameraError, setCameraError] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSelectedProduct, setLoadingSelectedProduct] = useState(true);

  useEffect(() => {
    async function loadAaramdehiProducts() {
      try {
        const response = await api.get('/products', { params: { limit: 200 } });
        const payload = response.data?.data ?? response.data ?? [];
        const arItems = Array.isArray(payload)
          ? payload.filter((p) => (p.model3dUrl || p.modelUrl) && (p.placementType || p.category))
          : [];

        setDbProducts(arItems);
        setAiStatus(arItems.length
          ? 'AI Ready. Scanning camera feed for surfaces...'
          : 'No AR-enabled products found in the catalog yet.');
      } catch (err) {
        console.error('Database se products load nahi ho paye:', err);
        setAiStatus('Failed to load AR product catalog.');
      } finally {
        setLoadingProducts(false);
      }
    }

    loadAaramdehiProducts();
  }, []);

  useEffect(() => {
    async function startLiveStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera initialization failed:', err);
        setCameraError('Bhai, camera permission chahiye ya browser supported nahi hai.');
        setAiStatus('Camera permission denied or unavailable.');
      }
    }

    startLiveStream();
  }, []);

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (!productId) {
      setLoadingSelectedProduct(false);
      return;
    }

    async function loadSelectedProduct() {
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
      } catch (err) {
        console.error('Selected product load failed:', err);
        setAiStatus('Selected product could not be loaded.');
      } finally {
        setLoadingSelectedProduct(false);
      }
    }

    loadSelectedProduct();
  }, [searchParams]);

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
        const bedsheetProduct = dbProducts.find((p) =>
          p.placementType === 'floor' ||
          p.placementType === 'bed' ||
          String(p.category || '').toLowerCase().includes('bed') ||
          String(p.category || '').toLowerCase().includes('bedding')
        );

        if (bedsheetProduct) {
          setAiStatus(`Detected floor/bed surface → Auto suggesting: ${bedsheetProduct.name || bedsheetProduct.productName || 'Product'}`);
          setCurrentModel(bedsheetProduct.model3dUrl || bedsheetProduct.modelUrl);
          setPlacementMode('floor');
        }
      } else {
        const paintingProduct = dbProducts.find((p) =>
          p.placementType === 'wall' ||
          String(p.category || '').toLowerCase().includes('decor') ||
          String(p.category || '').toLowerCase().includes('painting') ||
          String(p.category || '').toLowerCase().includes('art')
        );

        if (paintingProduct) {
          setAiStatus(`Detected wall surface → Auto suggesting: ${paintingProduct.name || paintingProduct.productName || 'Product'}`);
          setCurrentModel(paintingProduct.model3dUrl || paintingProduct.modelUrl);
          setPlacementMode('wall');
        }
      }
    }, 4000);

    return () => clearInterval(autoScanner);
  }, [dbProducts, cameraError, selectedProduct]);

  const selectedProductHasModel = selectedProduct && (selectedProduct.model3dUrl || selectedProduct.modelUrl);
  const currentProduct = selectedProduct || dbProducts.find((item) => (item.model3dUrl || item.modelUrl) === currentModel);
  const statusMessage = loadingSelectedProduct
    ? 'Loading selected product for 360 AR...' 
    : aiStatus;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <SEO
        title="360 AR Studio"
        description="Automatic AR room scanning and product placement for Aaramdehi."
        keywords="automatic AR, live room scan, product placement, aaramdehi"
      />

      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55))' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 'min(94%, 920px)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '16px 22px', textAlign: 'center', boxShadow: '0 28px 120px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Aaramdehi Live AI Studio</div>
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>{statusMessage}</div>
          {loadingProducts && <div style={{ marginTop: 8, color: '#cbd5e1' }}>Loading AR catalog…</div>}
          {cameraError && <div style={{ marginTop: 8, color: '#f87171' }}>{cameraError}</div>}
        </div>

        <div style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(15, 23, 42, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}
          >
            Back to Store
          </button>
        </div>

        {currentModel && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
            <model-viewer
              src={currentModel}
              ar
              ar-modes="webxr scene-viewer"
              camera-controls
              touch-action="none"
              ar-scale="fixed"
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <button
                slot="ar-button"
                style={{
                  position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                  padding: '14px 28px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 999,
                  fontWeight: 800, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', cursor: 'pointer'
                }}
              >
                ✨ Tap to Place AI Suggestion
              </button>
            </model-viewer>
          </div>
        )}

        <div style={{ position: 'absolute', left: 24, bottom: 32, zIndex: 10, width: 'min(420px, calc(100vw - 48px))', background: 'rgba(15, 23, 42, 0.9)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.08)', padding: 24 }}>
          <div style={{ color: '#e2e8f0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
            {selectedProduct ? 'Selected Product Preview' : 'Auto Recommendation'}
          </div>
          {currentProduct ? (
            <>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src={currentProduct.thumbnail || currentProduct.images?.[0]?.url || 'https://placehold.co/120x120?text=AR'} alt={currentProduct.name || 'AR Product'} style={{ width: 80, height: 80, borderRadius: 22, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>{currentProduct.name || 'Suggested Product'}</div>
                  <div style={{ marginTop: 6, color: '#9ca3af' }}>{currentProduct.category || currentProduct.placementType || 'Home decor'}</div>
                </div>
              </div>
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>₹{Number(currentProduct.sellingPrice || currentProduct.price || 0).toLocaleString()}</span>
                <span style={{ fontSize: 12, padding: '8px 14px', borderRadius: 999, background: 'rgba(34, 197, 94, 0.12)', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>{placementMode}</span>
              </div>
            </>
          ) : (
            <div style={{ color: '#cbd5e1', lineHeight: 1.8 }}>AI will automatically choose a product based on live surface detection. Koi manual selection nahi chahiye.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARStudio;
