const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, "data", "content.json");
// Local development keeps uploads inside Vite's public source folder.
// On Vercel, runtime uploads are stored in Vercel Blob instead.
const UPLOAD_DIR = path.join(ROOT, "client", "public", "uploads");
const PUBLIC_DIR = path.join(ROOT, "public");
const IS_VERCEL = Boolean(process.env.VERCEL);
const BLOB_PREFIX = "monny-naturals/content/";

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT || 5000);
const HAS_ADMIN_CONFIG = Boolean(
  process.env.ADMIN_EMAIL &&
  process.env.ADMIN_PASSWORD &&
  (process.env.JWT_SECRET || process.env.ADMIN_TOKEN_SECRET),
);
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || (IS_VERCEL ? "" : "admin@monnynaturals.local");
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || (IS_VERCEL ? "" : "MonnyAdmin123!");
const TOKEN_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_TOKEN_SECRET ||
  (IS_VERCEL ? "" : "change-this-admin-token-secret-before-production");
const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000;

if (!IS_VERCEL) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(express.json({ limit: "4mb" }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

const BUNDLED_ASSET_UPGRADES = {
  "/uploads/hero/monny-hero-01.png": "/uploads/hero/monny-hero-01.webp",
  "/uploads/hero/monny-hero-02.png": "/uploads/hero/monny-hero-02.webp",
  "/uploads/about/monny-about-spa.png": "/uploads/about/monny-about.webp",
  "/uploads/about/monny-about-main.png": "/uploads/about/monny-about.webp",
  "/uploads/catalog/beetroot-soap.jpg": "/uploads/catalog/beetroot-soap.webp",
  "/uploads/catalog/carrot-turmeric-soap.jpg":
    "/uploads/catalog/carrot-turmeric-soap.webp",
  "/uploads/catalog/glow-lotion.jpg": "/uploads/catalog/glow-lotion.webp",
  "/uploads/catalog/glow-shower-gel.jpg":
    "/uploads/catalog/glow-shower-gel.webp",
  "/uploads/catalog/hair-butter.jpg": "/uploads/catalog/hair-butter.webp",
  "/uploads/catalog/hair-shampoo.jpg": "/uploads/catalog/hair-shampoo.webp",
  "/uploads/catalog/herbal-growth-oil-1.jpg":
    "/uploads/catalog/herbal-growth-oil-1.webp",
  "/uploads/catalog/herbal-growth-oil-2.jpg":
    "/uploads/catalog/herbal-growth-oil-2.webp",
  "/uploads/catalog/monny-beauty-cream.jpg":
    "/uploads/catalog/monny-beauty-cream.webp",
  "/uploads/catalog/moringa-soap.jpg": "/uploads/catalog/moringa-soap.webp",
  "/uploads/catalog/oatmeal-soap.jpg": "/uploads/catalog/oatmeal-soap.webp",
  "/uploads/catalog/pure-coconut-oil.jpg":
    "/uploads/catalog/pure-coconut-oil.webp",
  "/uploads/catalog/skin-brightening-oil.jpg":
    "/uploads/catalog/skin-brightening-oil.webp",
  "/uploads/catalog/whitening-cream.jpg":
    "/uploads/catalog/whitening-cream.webp",
  "/uploads/catalog/whitening-shower-gel.jpg":
    "/uploads/catalog/whitening-shower-gel.webp",
};

function upgradeBundledAssets(value) {
  if (typeof value === "string") return BUNDLED_ASSET_UPGRADES[value] || value;
  if (Array.isArray(value)) return value.map(upgradeBundledAssets);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        upgradeBundledAssets(item),
      ]),
    );
  }
  return value;
}

function readLocalContent() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

async function readContent() {
  if (!blobConfigured()) return upgradeBundledAssets(readLocalContent());

  try {
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: BLOB_PREFIX, limit: 100 });
    const latest = [...(result.blobs || [])]
      .filter((blob) => blob.pathname.endsWith(".json"))
      .sort((a, b) => b.pathname.localeCompare(a.pathname))[0];

    if (!latest) return upgradeBundledAssets(readLocalContent());

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok)
      throw new Error(`Blob content fetch failed with ${response.status}`);
    return upgradeBundledAssets(await response.json());
  } catch (error) {
    console.error("Could not read CMS content from Vercel Blob:", error);
    return upgradeBundledAssets(readLocalContent());
  }
}

function writeLocalContent(nextContent) {
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(nextContent, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

async function writeContent(nextContent) {
  if (!blobConfigured()) {
    if (IS_VERCEL) {
      throw new Error(
        "Vercel Blob is not configured. Create a public Blob store in this Vercel project first.",
      );
    }
    writeLocalContent(nextContent);
    return;
  }

  const { put, list, del } = await import("@vercel/blob");
  const version = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.json`;
  await put(`${BLOB_PREFIX}${version}`, JSON.stringify(nextContent), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
  });

  // Keep a small version history so reads stay fast and storage does not grow forever.
  try {
    const result = await list({ prefix: BLOB_PREFIX, limit: 100 });
    const old = [...(result.blobs || [])]
      .filter((blob) => blob.pathname.endsWith(".json"))
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(25);
    if (old.length) await del(old.map((blob) => blob.url));
  } catch (cleanupError) {
    console.warn(
      "Blob history cleanup skipped:",
      cleanupError?.message || cleanupError,
    );
  }
}

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) throw new Error("Invalid token");
  const [encoded, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(encoded)
    .digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    throw new Error("Invalid token");
  const payload = JSON.parse(
    Buffer.from(encoded, "base64url").toString("utf8"),
  );
  if (!payload.exp || Date.now() > payload.exp)
    throw new Error("Expired token");
  return payload;
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    req.admin = verifyToken(token);
    next();
  } catch {
    res
      .status(401)
      .json({ error: "Admin session has expired. Please log in again." });
  }
}

function safeEqualText(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function normalizeNumber(
  value,
  fallback = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function validateAndNormalizeContent(input) {
  if (!input || typeof input !== "object")
    throw new Error("Invalid content payload.");
  if (
    !Array.isArray(input.products) ||
    !Array.isArray(input.categories) ||
    !Array.isArray(input.heroSlides)
  ) {
    throw new Error("Products, categories and hero slides are required.");
  }
  if (!input.heroSlides.length)
    throw new Error("Keep at least one hero slide.");

  const categoryNames = input.categories
    .map((c) => String(c?.name || "").trim())
    .filter(Boolean);
  if (categoryNames.length !== input.categories.length)
    throw new Error("Every category needs a name.");
  if (
    new Set(categoryNames.map((n) => n.toLowerCase())).size !==
    categoryNames.length
  )
    throw new Error("Category names must be unique.");

  const ids = input.products.map((p) => String(p?.id ?? "").trim());
  if (ids.some((id) => !id)) throw new Error("Every product needs an ID.");
  if (new Set(ids).size !== ids.length)
    throw new Error("Product IDs must be unique.");

  const products = input.products.map((product) => {
    const name = String(product?.name || "").trim();
    const category = String(product?.category || "").trim();
    if (!name) throw new Error("Every product needs a name.");
    if (!categoryNames.includes(category))
      throw new Error(`Product “${name}” uses an unknown category.`);
    return {
      ...product,
      name,
      category,
      price: normalizeNumber(product.price),
      stock: Math.floor(normalizeNumber(product.stock)),
      rating: normalizeNumber(product.rating, 5, 0, 5),
      reviews: Math.floor(normalizeNumber(product.reviews)),
      featured: Boolean(product.featured),
      newest: Boolean(product.newest),
      bestSelling: Boolean(product.bestSelling),
      image: String(product.image || "").trim(),
      description: String(product.description || ""),
      ingredients: String(product.ingredients || ""),
      benefits: String(product.benefits || ""),
      usage: String(product.usage || ""),
    };
  });

  const categories = input.categories.map((category) => ({
    ...category,
    name: String(category.name).trim(),
    image: String(category.image || "").trim(),
  }));

  const heroSlides = input.heroSlides.map((slide) => ({
    image: String(slide?.image || "").trim(),
    kicker: String(slide?.kicker || ""),
    title: String(slide?.title || ""),
    text: String(slide?.text || ""),
    ctaLabel: String(slide?.ctaLabel || ""),
    ctaLink: String(slide?.ctaLink || "/products"),
    secondaryLabel: String(slide?.secondaryLabel || ""),
    secondaryLink: String(slide?.secondaryLink || "/about"),
    trustText: String(slide?.trustText || ""),
  }));

  const store = {
    ...(input.store || {}),
    brandName:
      String(input.store?.brandName || "Monny Naturals").trim() ||
      "Monny Naturals",
    tagline: String(input.store?.tagline || ""),
    whatsappNumber: String(input.store?.whatsappNumber || "").replace(
      /[^0-9+]/g,
      "",
    ),
    deliveryFee: normalizeNumber(input.store?.deliveryFee),
    freeShippingThreshold: normalizeNumber(input.store?.freeShippingThreshold),
    email: String(input.store?.email || "").trim(),
    location: String(input.store?.location || "").trim(),
    customerCareHours: String(input.store?.customerCareHours || "").trim(),
    announcementText: String(input.store?.announcementText || ""),
    instagramUrl: String(input.store?.instagramUrl || "").trim(),
    tiktokUrl: String(input.store?.tiktokUrl || "").trim(),
  };

  const homepage = { ...(input.homepage || {}) };
  homepage.heroRotationSeconds = normalizeNumber(
    homepage.heroRotationSeconds,
    2,
    2,
    12,
  );

  const about = {
    ...(input.about || {}),
    heroEyebrow: String(input.about?.heroEyebrow || ""),
    heroTitle: String(input.about?.heroTitle || ""),
    heroText: String(input.about?.heroText || ""),
    storyEyebrow: String(input.about?.storyEyebrow || ""),
    storyTitle: String(input.about?.storyTitle || ""),
    storyImage: String(input.about?.storyImage || "").trim(),
    storyText: String(input.about?.storyText || ""),
    closingText: String(input.about?.closingText || ""),
    ctaLabel: String(input.about?.ctaLabel || ""),
    ctaLink: String(input.about?.ctaLink || "/products"),
    values: Array.isArray(input.about?.values)
      ? input.about.values.slice(0, 4).map((item) => ({
          title: String(item?.title || ""),
          text: String(item?.text || ""),
        }))
      : [],
  };

  const theme = {
    forest: String(input.theme?.forest || "#234d1f"),
    green: String(input.theme?.green || "#6fad2d"),
    cream: String(input.theme?.cream || "#fbfbe9"),
    beige: String(input.theme?.beige || "#edf5cf"),
    gold: String(input.theme?.gold || "#e2d326"),
    text: String(input.theme?.text || "#17301a"),
    pageBackground: String(input.theme?.pageBackground || "#fcfef3"),
  };
  const benefits = Array.isArray(input.benefits)
    ? input.benefits.slice(0, 4).map((item) => ({
        title: String(item?.title || ""),
        text: String(item?.text || ""),
      }))
    : [];

  const testimonials = Array.isArray(input.testimonials)
    ? input.testimonials
        .map((item, index) => ({
          id: item?.id ?? Date.now() + index,
          name: String(item?.name || "").trim(),
          text: String(item?.text || ""),
          rating: Math.round(normalizeNumber(item?.rating, 5, 1, 5)),
        }))
        .filter((item) => item.name || item.text)
    : [];

  const catalogSections = Array.isArray(input.catalogSections)
    ? input.catalogSections.map((section, sectionIndex) => ({
        id: String(section?.id || `collection-${sectionIndex + 1}`),
        eyebrow: String(section?.eyebrow || ""),
        title: String(section?.title || ""),
        text: String(section?.text || ""),
        category: categoryNames.includes(String(section?.category || ""))
          ? String(section.category)
          : categoryNames[0] || "",
        limit: Math.floor(normalizeNumber(section?.limit, 6, 1, 12)),
        dynamicProducts: Boolean(section?.dynamicProducts),
        items: Array.isArray(section?.items)
          ? section.items
              .map((item, itemIndex) => ({
                id: String(
                  item?.id || `item-${sectionIndex + 1}-${itemIndex + 1}`,
                ),
                name: String(item?.name || ""),
                image: String(item?.image || "").trim(),
              }))
              .filter((item) => item.name || item.image)
          : [],
      }))
    : [];

  return {
    ...input,
    products,
    categories,
    heroSlides,
    store,
    homepage,
    about,
    testimonials,
    benefits,
    catalogSections,
    theme,
  };
}

function extensionForMime(type) {
  return (
    {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    }[type] || ""
  );
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    brand: "Monny Naturals",
    cms: true,
    platform: IS_VERCEL ? "vercel" : "local",
    storage: blobConfigured() ? "vercel-blob" : "local-files",
  });
});

app.get("/api/content", async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(await readContent());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load store content." });
  }
});

app.post("/api/admin/login", (req, res) => {
  if (IS_VERCEL && !HAS_ADMIN_CONFIG) {
    return res
      .status(503)
      .json({
        error:
          "Admin credentials are not configured in Vercel Environment Variables.",
      });
  }
  const { email, password } = req.body || {};
  if (
    !safeEqualText(email, ADMIN_EMAIL) ||
    !safeEqualText(password, ADMIN_PASSWORD)
  ) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const token = signToken({
    email: ADMIN_EMAIL,
    role: "admin",
    exp: Date.now() + TOKEN_LIFETIME_MS,
  });
  res.json({ token, admin: { email: ADMIN_EMAIL } });
});

app.get("/api/admin/session", requireAdmin, (req, res) => {
  res.json({ ok: true, admin: req.admin });
});

app.put("/api/admin/content", requireAdmin, async (req, res) => {
  try {
    const content = validateAndNormalizeContent(req.body);
    await writeContent(content);
    res.json({ ok: true, content });
  } catch (error) {
    console.error(error);
    const message = error?.message || "Could not save store content.";
    const isValidation =
      /required|needs|unique|unknown|invalid|keep at least/i.test(message);
    res.status(isValidation ? 400 : 500).json({ error: message });
  }
});

app.post("/api/admin/upload", requireAdmin, async (req, res) => {
  try {
    const { name, type, data } = req.body || {};
    const ext = extensionForMime(type);
    if (!ext)
      return res
        .status(400)
        .json({ error: "Only JPG, PNG, WEBP or GIF images are allowed." });
    if (typeof data !== "string" || !data)
      return res.status(400).json({ error: "Choose an image to upload." });

    const base64 = data.includes(",")
      ? data.slice(data.indexOf(",") + 1)
      : data;
    const buffer = Buffer.from(base64, "base64");
    if (!buffer.length)
      return res
        .status(400)
        .json({ error: "The uploaded image is empty or invalid." });
    // Vercel Functions cap request bodies at 4.5 MB. The admin client compresses
    // large source images before sending them, keeping the encoded request safely below that limit.
    if (buffer.length > 2600 * 1024)
      return res
        .status(400)
        .json({
          error:
            "Image is still too large after optimisation. Choose a smaller image.",
        });

    const cleanBase =
      path
        .basename(
          String(name || "image"),
          path.extname(String(name || "image")),
        )
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || "image";
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${cleanBase}${ext}`;

    if (blobConfigured()) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`monny-naturals/uploads/${filename}`, buffer, {
        access: "public",
        contentType: type,
        addRandomSuffix: false,
        cacheControlMaxAge: 31536000,
      });
      return res.json({
        ok: true,
        url: blob.url,
        filename: blob.pathname,
        storage: "vercel-blob",
      });
    }

    if (IS_VERCEL) {
      return res
        .status(503)
        .json({
          error:
            "Vercel Blob is not configured. Create a public Blob store in this Vercel project first.",
        });
    }

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    res.json({
      ok: true,
      url: `/uploads/${filename}`,
      filename,
      storage: "local-files",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error?.message || "Could not upload image." });
  }
});

app.use((error, _req, res, next) => {
  if (error && error.type === "entity.too.large") {
    return res
      .status(413)
      .json({ error: "Upload request is too large. Try a smaller image." });
  }
  next(error);
});

const serveProductionClient =
  process.env.NODE_ENV === "production" ||
  process.argv.includes("--production") ||
  IS_VERCEL;
if (serveProductionClient) {
  // Vercel serves public/** as static files before the Express function.
  // express.static remains useful for `npm start` outside Vercel.
  app.use(express.static(PUBLIC_DIR));
  app.use((_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Monny Naturals server running on http://localhost:${PORT}`);
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !(process.env.JWT_SECRET || process.env.ADMIN_TOKEN_SECRET)
  ) {
    console.warn(
      "Using development admin defaults. Configure production environment variables before deploying.",
    );
  }
  if (IS_VERCEL && !blobConfigured()) {
    console.warn(
      "Vercel Blob is not connected. The storefront can read bundled content, but CMS saves/uploads are disabled.",
    );
  }
});

module.exports = app;
