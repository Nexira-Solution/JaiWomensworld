'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Save, Search, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({}); // parentId -> bool

  // --- Image zoom modal state ---
  const [zoomImage, setZoomImage] = useState(null); // { src, alt } | null

  async function load() {
    setLoading(true);
    const res = await fetch('/api/products?limit=200');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  // Close zoom modal on Escape
  useEffect(() => {
    if (!zoomImage) return;
    function onKey(e) {
      if (e.key === 'Escape') setZoomImage(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomImage]);

  function editKey(productId, variantId, size) { return `${productId}-${variantId}-${size}`; }

  function setStock(productId, variantId, size, value) {
    setEdits((e) => ({ ...e, [editKey(productId, variantId, size)]: value }));
  }

  async function saveRow(product, variant, sizeObj) {
    const key = editKey(product._id, variant._id, sizeObj.size);
    const newStock = edits[key];
    if (newStock === undefined) return;

    const updatedVariants = product.variants.map((v) =>
      v._id === variant._id
        ? { ...v, sizes: v.sizes.map((s) => (s.size === sizeObj.size ? { ...s, stock: Number(newStock) } : s)) }
        : v
    );
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: updatedVariants })
    });
    if (res.ok) {
      toast.success('Stock updated');
      load();
    } else toast.error('Failed to update stock');
  }

  function catId(c) { return c?._id || c; }
  function parentId(c) { return c?.parent?._id || c?.parent || null; }

  // Get the best available image for a variant, falling back to the product image
  function variantImage(product, variant) {
    return variant?.images?.[0] || product?.images?.[0] || null;
  }

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c._id] = c; });
    return map;
  }, [categories]);

  // --- Search + category filter ---
  const filteredProducts = useMemo(() => {
    let list = [...products];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => {
        const pCatId = catId(p.category);
        if (pCatId === categoryFilter) return true;
        // also match if selected filter is a parent category and product belongs to a child of it
        const pCat = catMap[pCatId];
        return parentId(pCat) === categoryFilter;
      });
    }

    return list;
  }, [products, search, categoryFilter, catMap]);

  // --- Category product counts (for summary cards, based on ALL products, not filtered) ---
  const categoryCounts = useMemo(() => {
    const direct = {};
    categories.forEach((c) => { direct[c._id] = 0; });
    products.forEach((p) => {
      const cid = catId(p.category);
      if (direct[cid] !== undefined) direct[cid] += 1;
    });
    const total = { ...direct };
    categories.forEach((c) => {
      const pid = parentId(c);
      if (pid && total[pid] !== undefined) total[pid] += direct[c._id] || 0;
    });
    return { direct, total };
  }, [categories, products]);

  function productStock(p) {
    return p.variants.reduce(
      (sum, v) =>
        sum +
        v.sizes.reduce((s, sz) => {
          const key = editKey(p._id, v._id, sz.size);
          const val = edits[key] !== undefined ? Number(edits[key]) : sz.stock;
          return s + (Number(val) || 0);
        }, 0),
      0
    );
  }

  // --- Group filtered products by parent category -> child category ---
  const grouped = useMemo(() => {
    const parents = categories.filter((c) => !c.parent);

    return parents
      .map((parent) => {
        const children = categories.filter((c) => parentId(c) === parent._id);

        const childGroups = children
          .map((child) => ({
            category: child,
            products: filteredProducts.filter((p) => catId(p.category) === child._id),
          }))
          .filter((g) => g.products.length > 0);

        const directProducts = filteredProducts.filter((p) => catId(p.category) === parent._id);

        return { parent, directProducts, childGroups };
      })
      .filter((g) => g.directProducts.length > 0 || g.childGroups.length > 0);
  }, [categories, filteredProducts]);

  function toggleCollapse(id) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }

  function ProductStockTable({ list }) {
    return (
      <div className="overflow-x-auto w-full my-2 rounded-lg border border-[#F5D5DB] bg-white shadow-xs">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="text-left border-b border-[#F5D5DB] bg-[#FFF4F3] text-[#7B5D69] text-xs uppercase tracking-wider font-semibold">
              <th className="p-3 w-16">Image</th>
              <th className="p-3">Product</th>
              <th className="p-3">Product SKU</th>
              <th className="p-3">Color</th>
              <th className="p-3">Size</th>
              <th className="p-3">Size SKU</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5D5DB]/60">
            {list.flatMap((p) =>
              p.variants.flatMap((v) =>
                v.sizes.map((s) => {
                  const key = editKey(p._id, v._id, s.size);
                  const value = edits[key] !== undefined ? edits[key] : s.stock;
                  const img = variantImage(p, v);
                  return (
                    <tr key={key} className="hover:bg-[#FFF4F3]/30 transition-colors">
                      <td className="p-3">
                        {img ? (
                          <button
                            type="button"
                            onClick={() => setZoomImage({ src: img, alt: `${p.name} - ${v.color}` })}
                            className="block w-11 h-11 rounded-md overflow-hidden border border-[#F5D5DB] hover:opacity-80 transition-opacity"
                            title="Click to zoom"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={`${p.name} - ${v.color}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="w-11 h-11 rounded-md bg-[#FFF4F3] flex items-center justify-center text-[10px] text-[#7B5D69]">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-[#12233F]">
                        <Link
                          href={`/product/${p.slug || p._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#B02F5E] hover:underline"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="p-3 text-xs text-[#7B5D69]">{p.sku || '—'}</td>
                      <td className="p-3 text-xs text-[#12233F] font-medium">{v.color}</td>
                      <td className="p-3 text-xs text-[#12233F] font-semibold">{s.size}</td>
                      <td className="p-3 text-xs text-[#7B5D69]">{s.sku || '—'}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          className={`w-20 border rounded-md px-2.5 py-1 text-sm bg-white outline-none focus:border-[#B02F5E] transition-colors ${
                            value <= 5 ? 'border-[#B02F5E] text-[#B02F5E] font-semibold' : 'border-[#F5D5DB] text-[#12233F]'
                          }`}
                          value={value}
                          onChange={(e) => setStock(p._id, v._id, s.size, e.target.value)}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => saveRow(p, v, s)}
                          className="p-1.5 rounded-md hover:bg-[#FFF4F3] text-[#B02F5E] hover:text-[#12233F] transition-colors"
                          title="Save stock"
                        >
                          <Save size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <h1 className="font-display text-2xl font-bold text-[#12233F] mb-5">Inventory</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B5D69]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-[#F5D5DB] bg-white text-[#171717] outline-none focus:border-[#B02F5E]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7B5D69]">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-[#F5D5DB] bg-white text-[#171717] outline-none focus:border-[#B02F5E]"
        >
          <option value="all">All Categories</option>
          {categories.filter((c) => !c.parent).map((parent) => (
            <optgroup key={parent._id} label={parent.name}>
              <option value={parent._id}>{parent.name} (all)</option>
              {categories
                .filter((c) => parentId(c) === parent._id)
                .map((child) => (
                  <option key={child._id} value={child._id}>— {child.name}</option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Category summary cards */}
      {!loading && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories
            .filter((c) => !c.parent)
            .map((parent) => (
              <div
                key={parent._id}
                className="px-3 py-2 rounded-lg text-xs border border-[#F5D5DB] bg-white shadow-xs"
              >
                <span className="font-semibold text-[#12233F]">{parent.name}</span>
                <span className="text-[#7B5D69]"> — {categoryCounts.total[parent._id] || 0} products</span>
              </div>
            ))}
        </div>
      )}

      {loading ? (
        <p className="text-[#7B5D69]">Loading...</p>
      ) : grouped.length === 0 ? (
        <p className="text-center text-[#7B5D69] py-10">No products match your filters.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ parent, directProducts, childGroups }) => {
            const isCollapsed = collapsed[parent._id];
            const parentStock =
              directProducts.reduce((sum, p) => sum + productStock(p), 0) +
              childGroups.reduce((sum, g) => sum + g.products.reduce((s, p) => s + productStock(p), 0), 0);
            const parentProductCount =
              directProducts.length + childGroups.reduce((sum, g) => sum + g.products.length, 0);

            return (
              <div key={parent._id} className="rounded-xl border border-[#F5D5DB] bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleCollapse(parent._id)}
                  className="w-full flex items-center justify-between p-3.5 bg-[#FFF4F3]/50 hover:bg-[#FFF4F3] transition-colors"
                >
                  <span className="flex items-center gap-2 font-display font-bold text-[#12233F]">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    {parent.name}
                  </span>
                  <span className="text-xs text-[#7B5D69]">
                    {parentProductCount} products &middot; {parentStock} units in stock
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="p-3 sm:p-4 overflow-hidden">
                    {directProducts.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-[#7B5D69] mb-1.5 uppercase tracking-wider">Uncategorized within {parent.name}</p>
                        <ProductStockTable list={directProducts} />
                      </div>
                    )}

                    {childGroups.map(({ category, products: childProducts }) => {
                      const childStock = childProducts.reduce((s, p) => s + productStock(p), 0);
                      return (
                        <div key={category._id} className="mb-4 last:mb-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-semibold text-[#12233F]">{category.name}</p>
                            <p className="text-xs text-[#7B5D69]">
                              {childProducts.length} products &middot; {childStock} units in stock
                            </p>
                          </div>
                          <ProductStockTable list={childProducts} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image zoom modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomImage.src}
            alt={zoomImage.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}