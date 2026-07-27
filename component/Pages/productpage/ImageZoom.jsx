import React, { useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ImageZoom = ({ smallImageSrc, largeImageSrc }) => {
  const containerRef = useRef(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [lensState, setLensState] = useState({ left: 0, top: 0, xPercent: 50, yPercent: 50, size: 120 });

  const getPointerEvent = (event) => {
    if (event.touches && event.touches[0]) return event.touches[0];
    if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0];
    return event;
  };

  const updateLens = (event) => {
    const pointer = getPointerEvent(event);
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const lensSize = Math.min(140, Math.max(100, rect.width * 0.22));
    const rawX = pointer.clientX - rect.left;
    const rawY = pointer.clientY - rect.top;
    const left = clamp(rawX - lensSize / 2, 0, rect.width - lensSize);
    const top = clamp(rawY - lensSize / 2, 0, rect.height - lensSize);
    const xPercent = clamp(((left + lensSize / 2) / rect.width) * 100, 0, 100);
    const yPercent = clamp(((top + lensSize / 2) / rect.height) * 100, 0, 100);

    setLensState({ left, top, xPercent, yPercent, size: lensSize });
  };

  const handlePointerEnter = () => {
    setZoomActive(true);
  };

  const handlePointerLeave = () => {
    setZoomActive(false);
  };

  const handlePointerMove = (event) => {
    updateLens(event);
    setZoomActive(true);
  };

  return (
    <div className="relative mx-auto max-w-6xl overflow-visible px-2 py-4 sm:px-4 lg:px-6">
      <div className="grid gap-4 lg:gap-6">
        <div className="relative overflow-visible">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm cursor-crosshair"
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onMouseMove={handlePointerMove}
            onTouchStart={(event) => {
              handlePointerEnter();
              updateLens(event);
            }}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerLeave}
            onTouchCancel={handlePointerLeave}
          >
            <img
              src={smallImageSrc}
              alt="Product"
              className="h-full w-full object-contain"
            />

            <div
              className={`pointer-events-none absolute rounded-2xl border border-slate-300 bg-slate-900/20 shadow-lg transition-opacity duration-150 ${
                zoomActive ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                width: `${lensState.size}px`,
                height: `${lensState.size}px`,
                left: `${lensState.left}px`,
                top: `${lensState.top}px`
              }}
            />
          </div>

          <div className="hidden lg:block">
            <div className={`absolute top-0 left-full ml-6 w-[320px] rounded-[28px] border border-slate-200 bg-white shadow-xl transition-opacity duration-200 ${
                zoomActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                <div
                  className="h-[420px] w-full bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url('${largeImageSrc}')`,
                    backgroundSize: '260%',
                    backgroundPosition: `${lensState.xPercent}% ${lensState.yPercent}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div
              className="h-72 w-full bg-no-repeat bg-center transition-all duration-200"
              style={{
                backgroundImage: `url('${largeImageSrc}')`,
                backgroundSize: zoomActive ? '240%' : '180%',
                backgroundPosition: `${lensState.xPercent}% ${lensState.yPercent}%`
              }}
            />
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm sm:px-5">
          <p className="font-semibold text-slate-900">Zoom preview</p>
          <p className="mt-2 leading-6">
            {zoomActive
              ? 'Move your cursor inside the image to track the magnified detail.'
              : 'Hover the image to see a zoomed preview in the side window.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageZoom;
