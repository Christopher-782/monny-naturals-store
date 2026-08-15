import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Image as ImageIcon,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  UploadCloud,
  Package,
  LayoutDashboard,
  Settings,
  Layers3,
  Plus,
  Trash2,
  Pencil,
  Search,
  MessageCircle,
  Home,
  BookOpen,
  X,
} from "lucide-react";
import { useContent } from "../context/ContentContext";
import { formatNaira } from "../utils/format";

const TOKEN_KEY = "monny_admin_token";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_API_IMAGE_BYTES = 2400 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function loadBrowserImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not process the selected image."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not optimise the selected image.")),
      type,
      quality,
    );
  });
}

async function prepareImageForUpload(file) {
  if (file.size > MAX_SOURCE_IMAGE_BYTES)
    throw new Error("Image must be 8 MB or smaller.");
  if (file.size <= MAX_API_IMAGE_BYTES) return file;
  if (file.type === "image/gif")
    throw new Error(
      "GIF files larger than 2.4 MB cannot be uploaded on Vercel. Use a smaller GIF.",
    );

  const image = await loadBrowserImage(file);
  const maxDimension = 1800;
  const scale = Math.min(
    1,
    maxDimension /
      Math.max(
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
      ),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(
    1,
    Math.round((image.naturalWidth || image.width) * scale),
  );
  canvas.height = Math.max(
    1,
    Math.round((image.naturalHeight || image.height) * scale),
  );
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Image optimisation is not supported by this browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let blob;
  for (const quality of [0.86, 0.76, 0.66, 0.56]) {
    blob = await canvasToBlob(canvas, "image/webp", quality);
    if (blob.size <= MAX_API_IMAGE_BYTES) break;
  }
  if (!blob || blob.size > MAX_API_IMAGE_BYTES)
    throw new Error(
      "This image is too large to optimise automatically. Choose a smaller image.",
    );

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

function blankProduct(categories, nextId) {
  return {
    id: nextId,
    name: "New Product",
    category: categories?.[0]?.name || "Skin Products",
    price: 0,
    image: "",
    description: "",
    rating: 5,
    reviews: 0,
    stock: 0,
    featured: false,
    newest: true,
    bestSelling: false,
    ingredients: "",
    benefits: "",
    usage: "",
  };
}

function MediaControl({ title, image, busy, onUpload, compact = false }) {
  const [url, setUrl] = useState(image || "");
  useEffect(() => setUrl(image || ""), [image]);
  return (
    <div className={`admin-media-control ${compact ? "compact" : ""}`}>
      <div className="admin-media-thumb">
        {image ? <img src={image} alt={title} /> : <ImageIcon />}
      </div>
      <div className="admin-media-control-copy">
        <strong>{title}</strong>
        <label className="admin-upload-btn">
          <UploadCloud size={16} />
          <span>{busy ? "Uploading…" : "Upload image"}</span>
          <input
            disabled={busy}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) =>
              e.target.files?.[0] && onUpload({ file: e.target.files[0] })
            }
          />
        </label>
        <div className="admin-url-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Or paste image URL"
          />
          <button
            type="button"
            disabled={busy || !url.trim()}
            onClick={() => onUpload({ url: url.trim() })}
          >
            Use URL
          </button>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-icon">
          <ShieldCheck />
        </div>
        <span>Monny Naturals CMS</span>
        <h1>Admin dashboard</h1>
        <p>
          Manage products, prices, stock, images, homepage content and WhatsApp
          store settings.
        </p>
        {error && <div className="admin-alert error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@monnynaturals.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
          />
        </label>
        <button className="btn btn-dark" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

function ProductEditor({
  product,
  categories,
  onChange,
  onClose,
  onImage,
  imageBusy,
}) {
  const field = (key, value) => onChange({ ...product, [key]: value });
  return (
    <div
      className="admin-editor-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="admin-editor-panel">
        <header>
          <div>
            <span>Product editor</span>
            <h2>{product.name || "New product"}</h2>
          </div>
          <button className="admin-icon-action" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="admin-editor-body">
          <MediaControl
            title="Product image"
            image={product.image}
            busy={imageBusy}
            onUpload={onImage}
          />
          <div className="admin-form-grid">
            <label className="full">
              Product name
              <input
                value={product.name}
                onChange={(e) => field("name", e.target.value)}
              />
            </label>
            <label>
              Category
              <select
                value={product.category}
                onChange={(e) => field("category", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Price (₦)
              <input
                type="number"
                min="0"
                value={product.price}
                onChange={(e) => field("price", Number(e.target.value))}
              />
            </label>
            <label>
              Stock quantity
              <input
                type="number"
                min="0"
                value={product.stock}
                onChange={(e) => field("stock", Number(e.target.value))}
              />
            </label>
            <label>
              Rating
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={product.rating}
                onChange={(e) => field("rating", Number(e.target.value))}
              />
            </label>
            <label>
              Review count
              <input
                type="number"
                min="0"
                value={product.reviews}
                onChange={(e) => field("reviews", Number(e.target.value))}
              />
            </label>
            <label className="full">
              Short description
              <textarea
                rows="3"
                value={product.description}
                onChange={(e) => field("description", e.target.value)}
              />
            </label>
            <label className="full">
              Ingredients
              <textarea
                rows="3"
                value={product.ingredients}
                onChange={(e) => field("ingredients", e.target.value)}
              />
            </label>
            <label className="full">
              Benefits
              <textarea
                rows="3"
                value={product.benefits}
                onChange={(e) => field("benefits", e.target.value)}
              />
            </label>
            <label className="full">
              Usage instructions
              <textarea
                rows="3"
                value={product.usage}
                onChange={(e) => field("usage", e.target.value)}
              />
            </label>
          </div>
          <div className="admin-check-grid">
            <label>
              <input
                type="checkbox"
                checked={!!product.featured}
                onChange={(e) => field("featured", e.target.checked)}
              />
              <span>
                <strong>Featured</strong>
                <small>Show on homepage featured products.</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!product.bestSelling}
                onChange={(e) => field("bestSelling", e.target.checked)}
              />
              <span>
                <strong>Best selling</strong>
                <small>Used by the Best Selling sort option.</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!product.newest}
                onChange={(e) => field("newest", e.target.checked)}
              />
              <span>
                <strong>Newest</strong>
                <small>Used by the Newest sort option.</small>
              </span>
            </label>
          </div>
        </div>
        <footer>
          <button className="btn btn-dark" onClick={onClose}>
            <Check size={17} /> Done editing
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function Admin() {
  const { content, publishContent } = useContent();
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || "",
  );
  const [draft, setDraft] = useState(() => clone(content));
  const [tab, setTab] = useState("products");
  const [busyKey, setBusyKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => setDraft(clone(content)), [content]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/session", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) throw new Error("expired");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
      });
  }, [token]);

  const counts = useMemo(
    () => ({
      products: draft.products?.length || 0,
      inStock: draft.products?.filter((p) => Number(p.stock) > 0).length || 0,
      featured: draft.products?.filter((p) => p.featured).length || 0,
      categories: draft.categories?.length || 0,
    }),
    [draft],
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return draft.products || [];
    return (draft.products || []).filter((p) =>
      `${p.name} ${p.category}`.toLowerCase().includes(q),
    );
  }, [draft.products, productSearch]);

  if (!token) return <Login onLogin={setToken} />;

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };
  const flash = (text) => {
    setMessage(text);
    setError("");
  };

  const uploadImage = async (payload, key, applyUrl) => {
    setMessage("");
    setError("");
    if (payload.url) {
      applyUrl(payload.url);
      flash("Image changed in the draft. Save changes to publish.");
      return;
    }
    setBusyKey(key);
    try {
      const preparedFile = await prepareImageForUpload(payload.file);
      const dataUrl = await readFileAsDataUrl(preparedFile);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: preparedFile.name,
          type: preparedFile.type,
          data: dataUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      applyUrl(data.url);
      flash("Upload complete. Save changes to publish.");
    } catch (err) {
      if (String(err.message).toLowerCase().includes("session")) logout();
      else setError(err.message);
    } finally {
      setBusyKey("");
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      publishContent(data.content || draft);
      setDraft(clone(data.content || draft));
      setMessage("Website changes published successfully and are now live.");
    } catch (err) {
      if (String(err.message).toLowerCase().includes("session")) logout();
      else setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetDraft = () => {
    setDraft(clone(content));
    setEditingProductId(null);
    flash("Unpublished changes were discarded.");
  };
  const setStore = (key, value) =>
    setDraft((d) => ({ ...d, store: { ...d.store, [key]: value } }));
  const setHome = (key, value) =>
    setDraft((d) => ({ ...d, homepage: { ...d.homepage, [key]: value } }));
  const setAbout = (key, value) =>
    setDraft((d) => ({ ...d, about: { ...(d.about || {}), [key]: value } }));

  const addProduct = () => {
    if (!draft.categories?.length) {
      setError("Create at least one category before adding a product.");
      return;
    }
    const nextId =
      Math.max(0, ...(draft.products || []).map((p) => Number(p.id) || 0)) + 1;
    const product = blankProduct(draft.categories, nextId);
    setDraft((d) => ({ ...d, products: [...(d.products || []), product] }));
    setEditingProductId(nextId);
  };

  const changeProduct = (nextProduct) =>
    setDraft((d) => ({
      ...d,
      products: d.products.map((p) =>
        String(p.id) === String(nextProduct.id) ? nextProduct : p,
      ),
    }));
  const setProductImage = (id, url) =>
    setDraft((d) => ({
      ...d,
      products: d.products.map((p) =>
        String(p.id) === String(id) ? { ...p, image: url } : p,
      ),
    }));
  const removeProduct = (id) => {
    const product = draft.products.find((p) => String(p.id) === String(id));
    if (
      !window.confirm(
        `Delete “${product?.name || "this product"}”? This will go live after you save.`,
      )
    )
      return;
    setDraft((d) => ({
      ...d,
      products: d.products.filter((p) => String(p.id) !== String(id)),
    }));
    if (String(editingProductId) === String(id)) setEditingProductId(null);
  };

  const addCategory = () =>
    setDraft((d) => ({
      ...d,
      categories: [
        ...d.categories,
        { name: `New Category ${d.categories.length + 1}`, image: "" },
      ],
    }));
  const renameCategory = (index, name) =>
    setDraft((d) => {
      const next = clone(d);
      const old = next.categories[index].name;
      next.categories[index].name = name;
      next.products = next.products.map((p) =>
        p.category === old ? { ...p, category: name } : p,
      );
      return next;
    });
  const removeCategory = (index) => {
    const category = draft.categories[index];
    const used = draft.products.filter(
      (p) => p.category === category.name,
    ).length;
    if (used)
      return setError(
        `Cannot delete “${category.name}” while ${used} product${used === 1 ? "" : "s"} use it. Move those products first.`,
      );
    if (!window.confirm(`Delete category “${category.name}”?`)) return;
    setDraft((d) => ({
      ...d,
      categories: d.categories.filter((_, i) => i !== index),
    }));
  };

  const addHero = () =>
    setDraft((d) => ({
      ...d,
      heroSlides: [
        ...d.heroSlides,
        {
          image: "",
          kicker: "NEW COLLECTION",
          title: "New hero slide",
          text: "Add your promotional message here.",
        },
      ],
    }));
  const updateHero = (index, key, value) =>
    setDraft((d) => {
      const next = clone(d);
      next.heroSlides[index][key] = value;
      return next;
    });
  const removeHero = (index) => {
    if (draft.heroSlides.length <= 1)
      return setError("Keep at least one hero slide.");
    setDraft((d) => ({
      ...d,
      heroSlides: d.heroSlides.filter((_, i) => i !== index),
    }));
  };

  const updateCatalogSection = (sectionIndex, key, value) =>
    setDraft((d) => {
      const next = clone(d);
      next.catalogSections = Array.isArray(next.catalogSections)
        ? next.catalogSections
        : [];
      next.catalogSections[sectionIndex] = {
        ...(next.catalogSections[sectionIndex] || {}),
        [key]: value,
      };
      return next;
    });

  const updateCatalogItem = (sectionIndex, itemIndex, key, value) =>
    setDraft((d) => {
      const next = clone(d);
      next.catalogSections = Array.isArray(next.catalogSections)
        ? next.catalogSections
        : [];
      const section = next.catalogSections[sectionIndex];
      if (!section) return d;
      section.items = Array.isArray(section.items) ? section.items : [];
      section.items[itemIndex] = {
        ...(section.items[itemIndex] || {}),
        [key]: value,
      };
      return next;
    });

  const addCatalogItem = (sectionIndex) =>
    setDraft((d) => {
      const next = clone(d);
      const section = next.catalogSections?.[sectionIndex];
      if (!section) return d;
      section.items = Array.isArray(section.items) ? section.items : [];
      section.items.push({
        id: `${section.id || "collection"}-${Date.now()}`,
        name: "New collection item",
        image: "",
      });
      return next;
    });

  const removeCatalogItem = (sectionIndex, itemIndex) =>
    setDraft((d) => {
      const next = clone(d);
      const section = next.catalogSections?.[sectionIndex];
      if (!section) return d;
      section.items = (section.items || []).filter(
        (_, index) => index !== itemIndex,
      );
      return next;
    });

  const addTestimonial = () =>
    setDraft((d) => ({
      ...d,
      testimonials: [
        ...(d.testimonials || []),
        {
          id: Date.now(),
          name: "Customer Name",
          text: "Customer testimonial goes here.",
          rating: 5,
        },
      ],
    }));
  const updateTestimonial = (index, key, value) =>
    setDraft((d) => {
      const next = clone(d);
      next.testimonials[index][key] = value;
      return next;
    });

  const editingProduct = draft.products?.find(
    (p) => String(p.id) === String(editingProductId),
  );
  const tabs = [
    ["products", Package, "Products"],
    ["categories", Layers3, "Categories"],
    ["homepage", Home, "Homepage"],
    ["about", BookOpen, "About page"],
    ["store", Settings, "Store settings"],
  ];

  return (
    <main className="admin-page admin-cms-page">
      <header className="admin-topbar">
        <div>
          <span>Monny Naturals CMS</span>
          <h1>Store management</h1>
        </div>
        <div className="admin-top-actions">
          <a href="/" target="_blank" rel="noreferrer">
            View website
          </a>
          <button onClick={logout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </header>

      <div className="admin-cms-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-label">
            <LayoutDashboard size={17} /> Manage
          </div>
          {tabs.map(([id, Icon, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
          <div className="admin-sidebar-tip">
            <MessageCircle />
            <p>
              <strong>Draft first, publish once.</strong> Changes are only
              visible to customers after you press Save website changes.
            </p>
          </div>
        </aside>

        <section className="admin-cms-main">
          <div className="admin-intro cms-intro">
            <div>
              <span className="admin-kicker">Content management system</span>
              <h2>Control the store without editing code</h2>
              <p>
                Products, stock, images, homepage copy and WhatsApp details are
                all managed here.
              </p>
            </div>
            <div className="admin-stats">
              <span>
                <strong>{counts.products}</strong>Products
              </span>
              <span>
                <strong>{counts.inStock}</strong>In stock
              </span>
              <span>
                <strong>{counts.featured}</strong>Featured
              </span>
              <span>
                <strong>{counts.categories}</strong>Categories
              </span>
            </div>
          </div>

          {(message || error) && (
            <div className={`admin-alert ${error ? "error" : "success"}`}>
              {error || (
                <>
                  <Check size={17} />
                  {message}
                </>
              )}
            </div>
          )}

          {tab === "products" && (
            <section className="admin-workspace">
              <div className="admin-workspace-head">
                <div>
                  <h2>Products</h2>
                  <p>
                    Add products and update prices, stock, descriptions,
                    categories and visibility.
                  </p>
                </div>
                <button className="btn btn-dark" onClick={addProduct}>
                  <Plus size={17} /> Add product
                </button>
              </div>
              <div className="admin-product-toolbar">
                <div className="admin-search">
                  <Search size={17} />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products or categories…"
                  />
                </div>
                <span>{filteredProducts.length} shown</span>
              </div>
              <div className="admin-product-table">
                <div className="admin-product-row heading">
                  <span>Product</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Stock</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {filteredProducts.map((product) => (
                  <div className="admin-product-row" key={product.id}>
                    <div className="admin-product-cell">
                      <div className="admin-product-thumb">
                        {product.image ? (
                          <img src={product.image} alt="" />
                        ) : (
                          <ImageIcon />
                        )}
                      </div>
                      <span>
                        <strong>{product.name}</strong>
                        <small>#{product.id}</small>
                      </span>
                    </div>
                    <span>{product.category}</span>
                    <strong>{formatNaira(product.price)}</strong>
                    <span
                      className={Number(product.stock) ? "" : "admin-stock-out"}
                    >
                      {Number(product.stock) || 0}
                    </span>
                    <span>
                      {product.featured
                        ? "Featured"
                        : product.bestSelling
                          ? "Best seller"
                          : "Standard"}
                    </span>
                    <div className="admin-row-actions">
                      <button onClick={() => setEditingProductId(product.id)}>
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {!filteredProducts.length && (
                  <div className="admin-empty-list">No matching products.</div>
                )}
              </div>
            </section>
          )}

          {tab === "categories" && (
            <section className="admin-workspace">
              <div className="admin-workspace-head">
                <div>
                  <h2>Categories</h2>
                  <p>
                    Manage category names and the images used on the homepage.
                  </p>
                </div>
                <button className="btn btn-dark" onClick={addCategory}>
                  <Plus size={17} /> Add category
                </button>
              </div>
              <div className="admin-category-list">
                {draft.categories?.map((category, index) => (
                  <article className="admin-category-editor" key={index}>
                    <MediaControl
                      compact
                      title={`Category image · ${category.name}`}
                      image={category.image}
                      busy={busyKey === `category-${index}`}
                      onUpload={(payload) =>
                        uploadImage(payload, `category-${index}`, (url) =>
                          setDraft((d) => {
                            const next = clone(d);
                            next.categories[index].image = url;
                            return next;
                          }),
                        )
                      }
                    />
                    <label>
                      Category name
                      <input
                        value={category.name}
                        onChange={(e) => renameCategory(index, e.target.value)}
                      />
                    </label>
                    <button
                      className="admin-delete-line"
                      onClick={() => removeCategory(index)}
                    >
                      <Trash2 size={16} /> Delete category
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "homepage" && (
            <section className="admin-workspace">
              <div className="admin-workspace-head">
                <div>
                  <h2>Homepage</h2>
                  <p>
                    Edit hero slides, section headings, brand story and customer
                    testimonials.
                  </p>
                </div>
                <button className="btn btn-dark" onClick={addHero}>
                  <Plus size={17} /> Add hero slide
                </button>
              </div>

              <div className="admin-subsection">
                <h3>Hero carousel</h3>
                <div className="admin-hero-editor-list">
                  {draft.heroSlides?.map((slide, index) => (
                    <article className="admin-hero-editor" key={index}>
                      <MediaControl
                        compact
                        title={`Hero slide ${index + 1}`}
                        image={slide.image}
                        busy={busyKey === `hero-${index}`}
                        onUpload={(payload) =>
                          uploadImage(payload, `hero-${index}`, (url) =>
                            updateHero(index, "image", url),
                          )
                        }
                      />
                      <div className="admin-form-grid">
                        <label>
                          Eyebrow
                          <input
                            value={slide.kicker || ""}
                            onChange={(e) =>
                              updateHero(index, "kicker", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Heading
                          <input
                            value={slide.title || ""}
                            onChange={(e) =>
                              updateHero(index, "title", e.target.value)
                            }
                          />
                        </label>
                        <label className="full">
                          Supporting text
                          <textarea
                            rows="3"
                            value={slide.text || ""}
                            onChange={(e) =>
                              updateHero(index, "text", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Primary button text
                          <input
                            value={slide.ctaLabel || ""}
                            onChange={(e) =>
                              updateHero(index, "ctaLabel", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Primary button link
                          <input
                            value={slide.ctaLink || ""}
                            onChange={(e) =>
                              updateHero(index, "ctaLink", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Secondary link text
                          <input
                            value={slide.secondaryLabel || ""}
                            onChange={(e) =>
                              updateHero(
                                index,
                                "secondaryLabel",
                                e.target.value,
                              )
                            }
                          />
                        </label>
                        <label>
                          Secondary link URL
                          <input
                            value={slide.secondaryLink || ""}
                            onChange={(e) =>
                              updateHero(index, "secondaryLink", e.target.value)
                            }
                          />
                        </label>
                        <label className="full">
                          Trust line
                          <input
                            value={slide.trustText || ""}
                            onChange={(e) =>
                              updateHero(index, "trustText", e.target.value)
                            }
                          />
                        </label>
                      </div>
                      <button
                        className="admin-delete-line"
                        onClick={() => removeHero(index)}
                      >
                        <Trash2 size={16} /> Remove slide
                      </button>
                    </article>
                  ))}
                </div>
              </div>

              <div className="admin-subsection">
                <h3>Hero behaviour</h3>
                <div className="admin-form-grid admin-form-card">
                  <label>
                    Auto-rotation speed (seconds)
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={draft.homepage?.heroRotationSeconds || 2}
                      onChange={(e) =>
                        setHome("heroRotationSeconds", Number(e.target.value))
                      }
                    />
                    <small>
                      Choose 2–12 seconds. The storefront is currently set to
                      change hero images every 2 seconds.
                    </small>
                  </label>
                </div>
              </div>

              <div className="admin-subsection">
                <div className="admin-subsection-head">
                  <div>
                    <h3>Skin & hair collection sections</h3>
                    <p className="admin-subsection-copy">
                      These sections now pull live products from the selected
                      category automatically. Change a product image, price or
                      name once and the homepage updates everywhere.
                    </p>
                  </div>
                </div>
                <div className="admin-collection-editor-list">
                  {(draft.catalogSections || []).map(
                    (section, sectionIndex) => (
                      <article
                        className="admin-collection-editor"
                        key={section.id || sectionIndex}
                      >
                        <div className="admin-form-grid">
                          <label>
                            Eyebrow
                            <input
                              value={section.eyebrow || ""}
                              onChange={(e) =>
                                updateCatalogSection(
                                  sectionIndex,
                                  "eyebrow",
                                  e.target.value,
                                )
                              }
                            />
                          </label>
                          <label>
                            Heading
                            <input
                              value={section.title || ""}
                              onChange={(e) =>
                                updateCatalogSection(
                                  sectionIndex,
                                  "title",
                                  e.target.value,
                                )
                              }
                            />
                          </label>
                          <label>
                            Linked category
                            <select
                              value={section.category || ""}
                              onChange={(e) =>
                                updateCatalogSection(
                                  sectionIndex,
                                  "category",
                                  e.target.value,
                                )
                              }
                            >
                              {(draft.categories || []).map((category) => (
                                <option key={category.name}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Products to show
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={section.limit || 6}
                              onChange={(e) =>
                                updateCatalogSection(
                                  sectionIndex,
                                  "limit",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </label>
                          <label className="full">
                            Section description
                            <textarea
                              rows="2"
                              value={section.text || ""}
                              onChange={(e) =>
                                updateCatalogSection(
                                  sectionIndex,
                                  "text",
                                  e.target.value,
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="admin-subsection-head admin-collection-items-head">
                          <h3>Collection photos</h3>
                          <button
                            type="button"
                            onClick={() => addCatalogItem(sectionIndex)}
                          >
                            <Plus size={16} /> Add photo
                          </button>
                        </div>
                        <div className="admin-collection-item-grid">
                          {(section.items || []).map((item, itemIndex) => (
                            <div
                              className="admin-collection-item"
                              key={item.id || itemIndex}
                            >
                              <MediaControl
                                compact
                                title={
                                  item.name ||
                                  `Collection photo ${itemIndex + 1}`
                                }
                                image={item.image}
                                busy={
                                  busyKey ===
                                  `catalog-${sectionIndex}-${itemIndex}`
                                }
                                onUpload={(payload) =>
                                  uploadImage(
                                    payload,
                                    `catalog-${sectionIndex}-${itemIndex}`,
                                    (url) =>
                                      updateCatalogItem(
                                        sectionIndex,
                                        itemIndex,
                                        "image",
                                        url,
                                      ),
                                  )
                                }
                              />
                              <label>
                                Display name
                                <input
                                  value={item.name || ""}
                                  onChange={(e) =>
                                    updateCatalogItem(
                                      sectionIndex,
                                      itemIndex,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                              </label>
                              <button
                                className="admin-delete-line"
                                type="button"
                                onClick={() =>
                                  removeCatalogItem(sectionIndex, itemIndex)
                                }
                              >
                                <Trash2 size={15} /> Remove photo
                              </button>
                            </div>
                          ))}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </div>

              <div className="admin-subsection">
                <h3>Homepage section text</h3>
                <div className="admin-form-grid admin-form-card">
                  <label>
                    Category eyebrow
                    <input
                      value={draft.homepage?.categoryEyebrow || ""}
                      onChange={(e) =>
                        setHome("categoryEyebrow", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Category heading
                    <input
                      value={draft.homepage?.categoryTitle || ""}
                      onChange={(e) => setHome("categoryTitle", e.target.value)}
                    />
                  </label>
                  <label>
                    Featured eyebrow
                    <input
                      value={draft.homepage?.featuredEyebrow || ""}
                      onChange={(e) =>
                        setHome("featuredEyebrow", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Featured heading
                    <input
                      value={draft.homepage?.featuredTitle || ""}
                      onChange={(e) => setHome("featuredTitle", e.target.value)}
                    />
                  </label>
                  <label>
                    Brand story eyebrow
                    <input
                      value={draft.homepage?.philosophyEyebrow || ""}
                      onChange={(e) =>
                        setHome("philosophyEyebrow", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Brand story heading
                    <input
                      value={draft.homepage?.philosophyTitle || ""}
                      onChange={(e) =>
                        setHome("philosophyTitle", e.target.value)
                      }
                    />
                  </label>
                  <label className="full">
                    Brand story text
                    <textarea
                      rows="4"
                      value={draft.homepage?.philosophyText || ""}
                      onChange={(e) =>
                        setHome("philosophyText", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Testimonials eyebrow
                    <input
                      value={draft.homepage?.testimonialsEyebrow || ""}
                      onChange={(e) =>
                        setHome("testimonialsEyebrow", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Testimonials heading
                    <input
                      value={draft.homepage?.testimonialsTitle || ""}
                      onChange={(e) =>
                        setHome("testimonialsTitle", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Checkout eyebrow
                    <input
                      value={draft.homepage?.checkoutEyebrow || ""}
                      onChange={(e) =>
                        setHome("checkoutEyebrow", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Checkout heading
                    <input
                      value={draft.homepage?.checkoutTitle || ""}
                      onChange={(e) => setHome("checkoutTitle", e.target.value)}
                    />
                  </label>
                  <label className="full">
                    Checkout text
                    <textarea
                      rows="2"
                      value={draft.homepage?.checkoutText || ""}
                      onChange={(e) => setHome("checkoutText", e.target.value)}
                    />
                  </label>
                  <label>
                    Newsletter eyebrow
                    <input
                      value={draft.homepage?.newsletterEyebrow || ""}
                      onChange={(e) =>
                        setHome("newsletterEyebrow", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Newsletter text
                    <input
                      value={draft.homepage?.newsletterText || ""}
                      onChange={(e) =>
                        setHome("newsletterText", e.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="admin-subsection">
                <h3>Benefits strip</h3>
                <div className="admin-point-grid">
                  {(draft.benefits || []).map((item, index) => (
                    <div key={index}>
                      <label>
                        Benefit {index + 1} title
                        <input
                          value={item.title}
                          onChange={(e) =>
                            setDraft((d) => {
                              const next = clone(d);
                              next.benefits[index].title = e.target.value;
                              return next;
                            })
                          }
                        />
                      </label>
                      <label>
                        Benefit {index + 1} text
                        <input
                          value={item.text}
                          onChange={(e) =>
                            setDraft((d) => {
                              const next = clone(d);
                              next.benefits[index].text = e.target.value;
                              return next;
                            })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-subsection">
                <h3>Brand story images & points</h3>
                <div className="admin-media-grid two">
                  <MediaControl
                    title="Botanical image"
                    image={draft.homepage?.philosophyImage}
                    busy={busyKey === "philosophy"}
                    onUpload={(payload) =>
                      uploadImage(payload, "philosophy", (url) =>
                        setHome("philosophyImage", url),
                      )
                    }
                  />
                  <MediaControl
                    title="Lifestyle / model image"
                    image={draft.homepage?.philosophyPersonImage}
                    busy={busyKey === "person"}
                    onUpload={(payload) =>
                      uploadImage(payload, "person", (url) =>
                        setHome("philosophyPersonImage", url),
                      )
                    }
                  />
                </div>
                <div className="admin-point-grid">
                  {(draft.homepage?.philosophyPoints || []).map(
                    (point, index) => (
                      <div key={index}>
                        <label>
                          Point {index + 1} title
                          <input
                            value={point.title}
                            onChange={(e) =>
                              setDraft((d) => {
                                const next = clone(d);
                                next.homepage.philosophyPoints[index].title =
                                  e.target.value;
                                return next;
                              })
                            }
                          />
                        </label>
                        <label>
                          Point {index + 1} text
                          <input
                            value={point.text}
                            onChange={(e) =>
                              setDraft((d) => {
                                const next = clone(d);
                                next.homepage.philosophyPoints[index].text =
                                  e.target.value;
                                return next;
                              })
                            }
                          />
                        </label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="admin-subsection">
                <div className="admin-subsection-head">
                  <h3>Testimonials</h3>
                  <button onClick={addTestimonial}>
                    <Plus size={16} /> Add testimonial
                  </button>
                </div>
                <div className="admin-testimonial-editor-list">
                  {draft.testimonials?.map((item, index) => (
                    <article key={item.id || index}>
                      <label>
                        Customer name
                        <input
                          value={item.name}
                          onChange={(e) =>
                            updateTestimonial(index, "name", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Rating
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={item.rating}
                          onChange={(e) =>
                            updateTestimonial(
                              index,
                              "rating",
                              Number(e.target.value),
                            )
                          }
                        />
                      </label>
                      <label className="full">
                        Testimonial
                        <textarea
                          rows="3"
                          value={item.text}
                          onChange={(e) =>
                            updateTestimonial(index, "text", e.target.value)
                          }
                        />
                      </label>
                      <button
                        className="admin-delete-line"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            testimonials: d.testimonials.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "about" && (
            <section className="admin-workspace">
              <div className="admin-workspace-head">
                <div>
                  <h2>About page</h2>
                  <p>Edit the complete About page without changing code.</p>
                </div>
              </div>

              <div className="admin-subsection">
                <h3>About hero</h3>
                <div className="admin-media-grid two">
                  <MediaControl
                    title="About hero banner"
                    image={draft.about?.heroImage}
                    busy={busyKey === "about-hero"}
                    onUpload={(payload) =>
                      uploadImage(payload, "about-hero", (url) =>
                        setAbout("heroImage", url),
                      )
                    }
                  />
                </div>
                <div className="admin-form-grid admin-form-card">
                  <label>
                    Eyebrow
                    <input
                      value={draft.about?.heroEyebrow || ""}
                      onChange={(e) => setAbout("heroEyebrow", e.target.value)}
                    />
                  </label>
                  <label>
                    Heading
                    <input
                      value={draft.about?.heroTitle || ""}
                      onChange={(e) => setAbout("heroTitle", e.target.value)}
                    />
                  </label>
                  <label className="full">
                    Supporting text
                    <textarea
                      rows="3"
                      value={draft.about?.heroText || ""}
                      onChange={(e) => setAbout("heroText", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-subsection">
                <h3>Founder story</h3>
                <div className="admin-media-grid two">
                  <MediaControl
                    title="About page image"
                    image={draft.about?.storyImage}
                    busy={busyKey === "about-story"}
                    onUpload={(payload) =>
                      uploadImage(payload, "about-story", (url) =>
                        setAbout("storyImage", url),
                      )
                    }
                  />
                </div>
                <div className="admin-form-grid admin-form-card">
                  <label>
                    Story eyebrow
                    <input
                      value={draft.about?.storyEyebrow || ""}
                      onChange={(e) => setAbout("storyEyebrow", e.target.value)}
                    />
                  </label>
                  <label>
                    Story heading
                    <input
                      value={draft.about?.storyTitle || ""}
                      onChange={(e) => setAbout("storyTitle", e.target.value)}
                    />
                  </label>
                  <label className="full">
                    Story text
                    <textarea
                      rows="20"
                      value={draft.about?.storyText || ""}
                      onChange={(e) => setAbout("storyText", e.target.value)}
                    />
                    <small>
                      Use a blank line between paragraphs. The “Recipes are easy
                      to copy” paragraph keeps its highlighted styling
                      automatically.
                    </small>
                  </label>
                  <label className="full">
                    Closing line
                    <input
                      value={draft.about?.closingText || ""}
                      onChange={(e) => setAbout("closingText", e.target.value)}
                    />
                  </label>
                  <label>
                    Button text
                    <input
                      value={draft.about?.ctaLabel || ""}
                      onChange={(e) => setAbout("ctaLabel", e.target.value)}
                    />
                  </label>
                  <label>
                    Button link
                    <input
                      value={draft.about?.ctaLink || ""}
                      onChange={(e) => setAbout("ctaLink", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-subsection">
                <h3>About values</h3>
                <p className="admin-subsection-copy">
                  These four cards appear below the founder story.
                </p>
                <div className="admin-point-grid">
                  {(draft.about?.values || [])
                    .slice(0, 4)
                    .map((item, index) => (
                      <div key={index}>
                        <label>
                          Value {index + 1} title
                          <input
                            value={item.title || ""}
                            onChange={(e) =>
                              setDraft((d) => {
                                const next = clone(d);
                                next.about.values[index].title = e.target.value;
                                return next;
                              })
                            }
                          />
                        </label>
                        <label>
                          Value {index + 1} text
                          <input
                            value={item.text || ""}
                            onChange={(e) =>
                              setDraft((d) => {
                                const next = clone(d);
                                next.about.values[index].text = e.target.value;
                                return next;
                              })
                            }
                          />
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {tab === "store" && (
            <section className="admin-workspace">
              <div className="admin-workspace-head">
                <div>
                  <h2>Store settings</h2>
                  <p>
                    Update WhatsApp checkout, delivery charges and
                    customer-facing contact details.
                  </p>
                </div>
              </div>
              <div className="admin-form-grid admin-form-card store-settings-form">
                <label>
                  Brand name
                  <input
                    value={draft.store?.brandName || ""}
                    onChange={(e) => setStore("brandName", e.target.value)}
                  />
                </label>
                <label>
                  Brand tagline
                  <input
                    value={draft.store?.tagline || ""}
                    onChange={(e) => setStore("tagline", e.target.value)}
                  />
                </label>
                <label className="full">
                  Announcement bar text
                  <input
                    value={draft.store?.announcementText || ""}
                    onChange={(e) =>
                      setStore("announcementText", e.target.value)
                    }
                  />
                </label>
                <label>
                  WhatsApp number
                  <input
                    value={draft.store?.whatsappNumber || ""}
                    onChange={(e) => setStore("whatsappNumber", e.target.value)}
                    placeholder="08067823352"
                  />
                  <small>
                    You can use Nigerian format (08067823352) or international
                    format (2348067823352).
                  </small>
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    value={draft.store?.email || ""}
                    onChange={(e) => setStore("email", e.target.value)}
                  />
                </label>
                <label>
                  Delivery fee (₦)
                  <input
                    type="number"
                    min="0"
                    value={draft.store?.deliveryFee ?? 0}
                    onChange={(e) =>
                      setStore("deliveryFee", Number(e.target.value))
                    }
                  />
                </label>
                <label>
                  Free shipping threshold (₦)
                  <input
                    type="number"
                    min="0"
                    value={draft.store?.freeShippingThreshold ?? 0}
                    onChange={(e) =>
                      setStore("freeShippingThreshold", Number(e.target.value))
                    }
                  />
                </label>
                <label>
                  Business location
                  <input
                    value={draft.store?.location || ""}
                    onChange={(e) => setStore("location", e.target.value)}
                  />
                </label>
                <label>
                  Customer care hours
                  <input
                    value={draft.store?.customerCareHours || ""}
                    onChange={(e) =>
                      setStore("customerCareHours", e.target.value)
                    }
                  />
                </label>
              </div>
              <div className="admin-subsection">
                <h3>Dynamic website theme</h3>
                <p className="admin-subsection-copy">
                  Change the storefront colours here. The website applies them
                  immediately after you publish.
                </p>
                <div className="admin-form-grid admin-form-card">
                  <label>
                    Deep green
                    <input
                      type="color"
                      value={draft.theme?.forest || "#234d1f"}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          theme: { ...(d.theme || {}), forest: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Fresh green
                    <input
                      type="color"
                      value={draft.theme?.green || "#6fad2d"}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          theme: { ...(d.theme || {}), green: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Accent yellow
                    <input
                      type="color"
                      value={draft.theme?.gold || "#e2d326"}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          theme: { ...(d.theme || {}), gold: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Cream
                    <input
                      type="color"
                      value={draft.theme?.cream || "#fbfbe9"}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          theme: { ...(d.theme || {}), cream: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Soft green background
                    <input
                      type="color"
                      value={draft.theme?.beige || "#edf5cf"}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          theme: { ...(d.theme || {}), beige: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Page background
                    <input
                      type="color"
                      value={draft.theme?.pageBackground || "#fcfef3"}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          theme: {
                            ...(d.theme || {}),
                            pageBackground: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="admin-setting-note">
                <ShieldCheck />
                <div>
                  <strong>WhatsApp checkout is now controlled here.</strong>
                  <p>
                    The number saved above is used by the floating chat button,
                    product Buy Now button, Contact page and checkout order
                    message.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="admin-savebar cms-savebar">
            <button className="admin-reset" onClick={resetDraft}>
              <RefreshCw size={17} /> Discard changes
            </button>
            <button
              className="btn btn-dark"
              onClick={save}
              disabled={saving || !!busyKey}
            >
              <Save size={17} />
              {saving ? "Publishing…" : "Save website changes"}
            </button>
          </div>
        </section>
      </div>

      {editingProduct && (
        <ProductEditor
          product={editingProduct}
          categories={draft.categories || []}
          onChange={changeProduct}
          onClose={() => setEditingProductId(null)}
          imageBusy={busyKey === `product-${editingProduct.id}`}
          onImage={(payload) =>
            uploadImage(payload, `product-${editingProduct.id}`, (url) =>
              setProductImage(editingProduct.id, url),
            )
          }
        />
      )}
    </main>
  );
}
