import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProductsAPI } from '../../src/api/authAndAdminApi';
import { getResponsiveImageAttributes } from '../../src/utils/imageOptimizer';

const getProductText = (product) => [
  product.name,
  product.description,
  typeof product.category === 'object' ? product.category?.name : product.category,
  ...(Array.isArray(product.tags) ? product.tags : [])
].filter(Boolean).join(' ').toLowerCase();

const getImage = (product) => product.thumbnail || product.images?.[0]?.url || product.images?.[0] || product.image || 'https://placehold.co/400x400?text=Aaramdehi';

export default function ProductRecommendationWidget({ context = '', excludeId = '', title = 'Complete Your Comfort Setup' }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;
    getAllProductsAPI({ limit: 100 }).then((response) => {
      if (!active) return;
      const source = response?.data || (Array.isArray(response) ? response : []);
      const terms = String(context).toLowerCase().split(/\s+/).filter((term) => term.length > 3);
      const ranked = source
        .filter((product) => String(product._id || product.id) !== String(excludeId))
        .map((product) => {
          const text = getProductText(product);
          const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
          return { product, score };
        })
        .sort((left, right) => right.score - left.score || Number(right.product.views || 0) - Number(left.product.views || 0))
        .slice(0, 4)
        .map(({ product }) => product);
      setProducts(ranked);
    }).catch(() => setProducts([]));
    return () => { active = false; };
  }, [context, excludeId]);

  if (!products.length) return null;

  return (
    <section className="mx-auto mt-16 max-w-7xl border-t border-gray-100 px-4 pt-12" aria-labelledby="recommendation-title">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Picked for you</p><h2 id="recommendation-title" className="mt-2 text-2xl font-black text-blue-900 md:text-3xl">{title}</h2></div>
        <Link to="/products" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-700">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => {
          const id = product.slug || product._id || product.id;
          const price = Number(product.sellingPrice || product.price || product.newPrice || 0);
          return <Link key={id} to={`/product/${id}`} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-lg">
            <div className="aspect-square bg-gray-50 p-4"><img {...getResponsiveImageAttributes(getImage(product), [300, 500], '(max-width: 768px) 50vw, 25vw', true)} alt={product.name || 'Aaramdehi product'} loading="lazy" className="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" /></div>
            <div className="p-4"><p className="line-clamp-2 min-h-10 text-sm font-bold text-gray-800">{product.name}</p><p className="mt-3 text-lg font-black text-blue-900">₹{price.toLocaleString('en-IN')}</p></div>
          </Link>;
        })}
      </div>
    </section>
  );
}
