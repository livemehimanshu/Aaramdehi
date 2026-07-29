import { uploadImageCloudinary, deleteImageCloudinary, extractCloudinaryPublicIdFromUrl, buildCloudinaryFolderPath } from "../utils/uploadImageCloudinary.js";
import { findAll, findById, create, updateById, deleteById, findByQuery, db } from "../config/db.js";
import { MultiversalEngine } from "../utils/MultiversalEngine.js";

const COLLECTION = 'products';

const normalizeImageValue = (value) => {
    if (value == null) return [];
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            return normalizeImageValue(JSON.parse(trimmed));
        } catch {
            return [{ url: trimmed }];
        }
    }
    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeImageValue(item));
    }
    if (typeof value === 'object') {
        if (value.url || value.src || value.image || value.path || value.thumb || value.thumbnail) {
            return [{ url: value.url || value.src || value.image || value.path || value.thumb || value.thumbnail, public_id: value.public_id || value.publicId || '', alt: value.alt || '' }];
        }
        if (value.images) return normalizeImageValue(value.images);
        return Object.values(value).flatMap((item) => normalizeImageValue(item));
    }
    return [];
};

const normalizeSizeValue = (size, index, fallbackPrice, fallbackMrp) => {
    if (typeof size === 'string') {
        return { label: size, name: size, value: size, price: fallbackPrice, mrp: fallbackMrp };
    }

    if (!size || typeof size !== 'object') {
        return { label: `Size ${index + 1}`, name: `Size ${index + 1}`, value: `Size ${index + 1}`, price: fallbackPrice, mrp: fallbackMrp };
    }

    return {
        ...size,
        label: size.label || size.name || size.value || size.size || `Size ${index + 1}`,
        name: size.name || size.label || size.value || size.size || `Size ${index + 1}`,
        value: size.value || size.name || size.label || size.size || `Size ${index + 1}`,
        price: size.price ?? size.amount ?? size.cost ?? fallbackPrice,
        mrp: size.mrp ?? size.oldPrice ?? size.originalPrice ?? size.listPrice ?? fallbackMrp
    };
};

const normalizeColorValue = (color, index, fallbackPrice, fallbackMrp) => {
    if (typeof color === 'string') {
        return {
            name: color,
            label: color,
            images: [],
            img: '',
            swatchImg: '',
            price: fallbackPrice,
            mrp: fallbackMrp,
            modelUrl: ''
        };
    }

    if (!color || typeof color !== 'object') {
        return {
            name: `Variant ${index + 1}`,
            label: `Variant ${index + 1}`,
            images: [],
            img: '',
            swatchImg: '',
            price: fallbackPrice,
            mrp: fallbackMrp,
            modelUrl: ''
        };
    }

    const images = normalizeImageValue(color.images || color.image || color.img || color.gallery || color.urls || color.media);

    return {
        ...color,
        name: color.name || color.label || color.color || color.variant || `Variant ${index + 1}`,
        label: color.label || color.name || color.color || color.variant || `Variant ${index + 1}`,
        images,
        img: color.img || color.image || (images[0]?.url || ''),
        swatchImg: color.swatchImg || color.thumb || color.thumbnail || color.image || color.img || (images[0]?.url || ''),
        price: color.price ?? color.amount ?? color.cost ?? fallbackPrice,
        mrp: color.mrp ?? color.oldPrice ?? color.originalPrice ?? color.listPrice ?? fallbackMrp,
        modelUrl: color.modelUrl || color.model || color.glb || color.gltf || color.threeDModel || ''
    };
};

const collectCloudinaryPublicIds = (value, publicIds = []) => {
    if (Array.isArray(value)) {
        value.forEach((item) => collectCloudinaryPublicIds(item, publicIds));
        return publicIds;
    }

    if (!value || typeof value !== 'object') return publicIds;

    if (typeof value.public_id === 'string' && value.public_id) publicIds.push(value.public_id);
    if (typeof value.publicId === 'string' && value.publicId) publicIds.push(value.publicId);

    Object.values(value).forEach((item) => collectCloudinaryPublicIds(item, publicIds));
    return publicIds;
};

const normalizeProductForResponse = (product) => {
    const source = product || {};
    const fallbackPrice = Number(source.sellingPrice ?? source.price ?? 0);
    const fallbackMrp = Number(source.mrp ?? source.originalPrice ?? source.price ?? 0);
    const images = normalizeImageValue(source.images || source.gallery || source.productImages || source.image || []);
    const colors = Array.isArray(source.colors)
        ? source.colors.map((color, index) => normalizeColorValue(color, index, fallbackPrice, fallbackMrp))
        : [];
    const sizes = Array.isArray(source.sizes)
        ? source.sizes.map((size, index) => normalizeSizeValue(size, index, fallbackPrice, fallbackMrp))
        : [{ label: 'Standard', name: 'Standard', value: 'Standard', price: fallbackPrice, mrp: fallbackMrp }];
    const specs = source.specifications || source.specs || {
        Brand: source.brand || 'Aaramdehi',
        Size: sizes.map((size) => size.label).join(', ') || 'Standard',
        Material: source.material || 'Microfiber',
        'Weave Type': source.weaveType || 'Low profile non-slip'
    };
    const features = Array.isArray(source.features)
        ? source.features
        : (Array.isArray(source.highlights)
            ? source.highlights
            : [
                'Easy care microfiber surface',
                'Anti-skid backing for secure placement',
                'Machine washable for everyday use',
                'Soft, plush finish for comfort'
            ]);
    const modelUrl = source.modelUrl || source.model3dUrl || source.model || source.glb || source.gltf || source.threeDModel || '';
    const normalizedReviews = (() => {
        const rawReviews = Array.isArray(source.reviews)
            ? source.reviews
            : typeof source.reviews === 'string'
                ? (() => {
                    try { return JSON.parse(source.reviews); } catch { return []; }
                })()
                : [];

        return Array.isArray(rawReviews)
            ? rawReviews.map((item, idx) => ({
                ...item,
                id: item.id || item._id || item.userId || `review-${idx}`,
                name: item.name || item.user || item.userName || 'Customer',
                user: item.user || item.name || item.userName || 'Customer',
                userName: item.userName || item.user || item.name || 'Customer',
                rating: Number(item.rating ?? item.stars ?? 0),
                comment: item.comment || item.text || '',
                createdAt: item.createdAt || item.date || new Date().toISOString()
            }))
            : [];
    })();

    const normalizedRatings = source.ratings || {
        average: normalizedReviews.length > 0
            ? parseFloat((normalizedReviews.reduce((acc, item) => acc + (item.rating || 0), 0) / normalizedReviews.length).toFixed(1))
            : 5,
        count: normalizedReviews.length
    };

    return {
        ...source,
        id: source.id || source._id,
        title: source.title || source.name || source.productName || 'Product Name',
        name: source.name || source.title || source.productName || 'Product Name',
        brand: source.brand || 'Aaramdehi',
        price: source.price ?? source.sellingPrice ?? 0,
        sellingPrice: source.sellingPrice ?? source.price ?? 0,
        mrp: source.mrp ?? source.originalPrice ?? source.price ?? 0,
        images,
        colors,
        sizes,
        subtitle: source.subtitle || source.category || 'Premium comfort',
        deliveryDate: source.deliveryDate || 'Sunday, 2 August',
        location: source.location || 'Meerut 250001',
        modelUrl,
        model3dUrl: source.model3dUrl || modelUrl,
        specs,
        features,
        stock: source.stock ?? source.available ?? 12,
        discountPercent: source.discountPercent ?? source.discount ?? 0,
        reviews: normalizedReviews,
        ratings: normalizedRatings
    };
};

// ✅ 1. CREATE NEW PRODUCT (With Dynamic Multi-Image Color Variants & Sizes Support)
export const createProduct = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Request body is empty. Check your FormData and Multer configuration." });
        }

        const {
            name, brand, description, shortDescription, category, subCategory,
            tags, mrp, sellingPrice, discountPercent, stock, sku,
            specifications, seoTitle, seoDescription, seoKeywords, model3dUrl, modelUrl,
            subtitle, deliveryDate, location, specs, features,
            sizes, colors, productInformation
        } = req.body;

        const userId = req.userId || req.user?._id || req.user?.id;

        // Validation
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!brand) missingFields.push("brand");
        if (!category) missingFields.push("category");
        if (mrp === undefined || mrp === "") missingFields.push("mrp");
        if (sellingPrice === undefined || sellingPrice === "") missingFields.push("sellingPrice");
        if (stock === undefined || stock === "") missingFields.push("stock");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Required fields missing: ${missingFields.join(", ")}`,
                errorFields: missingFields
            });
        }

        // Generate Slug
        const rawSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        let slug = rawSlug;

        const existingSlugs = await findByQuery(COLLECTION, 'slug', slug);
        if (existingSlugs.length > 0) {
            slug = `${rawSlug}-${Date.now()}`;
        }

        // Multer upload.any() files array normalize karein
        const allUploadedFiles = Array.isArray(req.files) ? req.files : [];

        if (process.env.NODE_ENV === 'development') {
            console.debug('✅ createProduct req.files count:', allUploadedFiles.length);
            console.debug('✅ createProduct req.files fieldnames:', allUploadedFiles.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, mimeType: f.mimetype })));
            console.debug('✅ createProduct req.body keys:', Object.keys(req.body));
        }

        // Upload Product Main Images
        let images = [];
        const uploadedImages = allUploadedFiles.filter(f => f.fieldname === 'images' || f.fieldname === 'images[]');
        const uploadedModelFiles = allUploadedFiles.filter(f => f.fieldname === 'model3d' || f.fieldname === 'model3d[]');

        if (uploadedImages.length > 0) {
            for (const file of uploadedImages) {
                const fileContent = file.buffer || file.path;
                if (!fileContent) continue;

                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name);
                const uploadResult = await uploadImageCloudinary(fileContent, productFolder);
                if (uploadResult && uploadResult.success) {
                    images.push({
                        url: uploadResult.url,
                        public_id: uploadResult.public_id,
                        alt: name
                    });
                }
            }

            if (uploadedImages.length > 0 && images.length === 0) {
                return res.status(500).json({ success: false, message: "Could not upload main images to Cloudinary." });
            }
        }

        // ✅ Parse Sizes Array
        let parsedSizes = [];
        if (sizes) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (e) {
                parsedSizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : [];
            }
        }

        // ✅ FIXED: Parse Colors Array & Upload Dynamic Multiple Variant Images (color_images_0, color_images_1, etc.)
        let parsedColors = [];
        const rawColorsInput = colors || req.body.colorVariants || req.body.variants || req.body.color || req.body.colours;
        if (rawColorsInput) {
            let rawColors = [];
            try {
                rawColors = typeof rawColorsInput === 'string' ? JSON.parse(rawColorsInput) : rawColorsInput;
            } catch (e) {
                rawColors = [];
            }

            const getVariantFiles = (files, index) => files.filter(
                (f) => f.fieldname === `color_images_${index}` || f.fieldname === `color_images_${index}[]`
            );

            if (Array.isArray(rawColors)) {
                for (let i = 0; i < rawColors.length; i++) {
                    let colorObj = typeof rawColors[i] === 'string' ? { name: rawColors[i] } : { ...rawColors[i] };

                    // Frontend 'color_images_0', 'color_images_0[]' dono support karein
                    const variantFiles = getVariantFiles(allUploadedFiles, i);
                    let variantImages = [];

                    if (variantFiles.length > 0) {
                        for (const file of variantFiles) {
                            const fileContent = file.buffer || file.path;
                            if (fileContent) {
                                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name);
                                const uploadResult = await uploadImageCloudinary(fileContent, `${productFolder}/variants`);
                                if (uploadResult && uploadResult.success) {
                                    variantImages.push({
                                        url: uploadResult.url,
                                        public_id: uploadResult.public_id
                                    });
                                }
                            }
                        }
                    }

                    // Fallback to main product image if variant images are missing
                    if (variantImages.length === 0 && images.length > 0) {
                        variantImages.push({
                            url: images[0].url,
                            public_id: images[0].public_id
                        });
                    }

                    const normalizedVariantImages = variantImages.length > 0
                        ? variantImages
                        : (Array.isArray(colorObj.images) ? normalizeImageValue(colorObj.images) : []);

                    parsedColors.push({
                        name: colorObj.name || "Standard",
                        label: colorObj.label || colorObj.name || "Standard",
                        images: normalizedVariantImages,
                        img: normalizedVariantImages.length > 0 ? normalizedVariantImages[0].url : "",
                        swatchImg: colorObj.swatchImg || colorObj.thumb || colorObj.thumbnail || (normalizedVariantImages[0]?.url || ''),
                        price: Number(colorObj.price || sellingPrice),
                        mrp: Number(colorObj.mrp || mrp),
                        modelUrl: colorObj.modelUrl || colorObj.model || colorObj.glb || colorObj.gltf || colorObj.threeDModel || ''
                    });
                }
            }
        }

        // 3D Model Upload Handle
        let model3dUrlFromUpload = '';
        let model3dPublicIdFromUpload = '';
        if (uploadedModelFiles.length > 0) {
            const modelFile = uploadedModelFiles[0];
            const fileContent = modelFile.buffer || modelFile.path;
            if (fileContent) {
                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name);
                const uploadResult = await uploadImageCloudinary(fileContent, `${productFolder}/models`, { transformation: [] });
                if (uploadResult && uploadResult.success) {
                    model3dUrlFromUpload = uploadResult.url;
                    model3dPublicIdFromUpload = uploadResult.public_id;
                }
            }
        }

        const mrpNum = Number(mrp);
        const sellingPriceNum = Number(sellingPrice);
        const incomingModelUrl = model3dUrl || modelUrl || req.body.model || req.body.glb || req.body.gltf || req.body.threeDModel || '';
        const parsedSpecs = (specifications && typeof specifications === 'string' && specifications.trim().startsWith('{')) ? JSON.parse(specifications) : (typeof specs === 'string' ? JSON.parse(specs) : (specs || {}));
        const parsedFeatures = Array.isArray(features)
            ? features
            : (typeof features === 'string' && features.trim()
                ? features.split(',').map((item) => item.trim()).filter(Boolean)
                : []);

        let parsedCustomAttributes = [];
        if (req.body.customAttributes) {
            try {
                parsedCustomAttributes = typeof req.body.customAttributes === 'string'
                    ? JSON.parse(req.body.customAttributes)
                    : req.body.customAttributes;
            } catch (e) {
                parsedCustomAttributes = [];
            }
        }

        let parsedProductInformation = [];
        if (productInformation) {
            try {
                parsedProductInformation = typeof productInformation === 'string'
                    ? JSON.parse(productInformation)
                    : productInformation;
            } catch (e) {
                parsedProductInformation = [];
            }
        }

        const productData = {
            name,
            title: name,
            brand,
            description: description || "",
            shortDescription: shortDescription || "",
            category,
            subCategory: subCategory || "",
            tags: (typeof tags === 'string' && tags.trim()) ? tags.split(',').map(t => t.trim()) : [],
            mrp: mrpNum,
            sellingPrice: sellingPriceNum,
            discountPercent: Number(discountPercent) || Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100),
            stock: Number(stock),
            sku: sku || `SKU-${Date.now()}-${slug.slice(0, 5)}`,
            images,
            thumbnail: images.length > 0 ? images[0].url : "",
            subtitle: subtitle || category || 'Premium comfort',
            deliveryDate: deliveryDate || 'Sunday, 2 August',
            location: location || 'Meerut 250001',

            // Save Variants Array & Sizes
            sizes: Array.isArray(parsedSizes) ? parsedSizes : [],
            colors: parsedColors,
            customAttributes: Array.isArray(parsedCustomAttributes) ? parsedCustomAttributes : [],
            productInformation: Array.isArray(parsedProductInformation) ? parsedProductInformation : [],

            specifications: parsedSpecs,
            specs: parsedSpecs,
            features: parsedFeatures,
            seoTitle: seoTitle || name,
            seoDescription: seoDescription || shortDescription || "",
            seoKeywords: (typeof seoKeywords === 'string' && seoKeywords.trim()) ? seoKeywords.split(',').map(k => k.trim()) : [],
            slug,
            createdBy: userId || null
        };

        if (incomingModelUrl || model3dUrlFromUpload) {
            productData.model3dUrl = incomingModelUrl || model3dUrlFromUpload;
            productData.modelUrl = incomingModelUrl || model3dUrlFromUpload;
            if (model3dPublicIdFromUpload) productData.model3dPublicId = model3dPublicIdFromUpload;
        }

        const savedProduct = await create(COLLECTION, productData);

        // Search Indexing
        try {
            const indexEntry = {
                name: productData.name,
                productId: savedProduct._id,
                searchKeywords: productData.seoKeywords.length > 0 ? productData.seoKeywords : [productData.brand, productData.category],
                indexedAt: new Date().toISOString()
            };
            await db.ref('product_indexes').push(indexEntry);
        } catch (indexErr) {
            console.warn('⚠️ Search index entry failed:', indexErr.message);
        }

        return res.status(201).json({ success: true, message: "Product created successfully", data: normalizeProductForResponse(savedProduct) });

    } catch (error) {
        console.error("❌ Error creating product:", error);
        return res.status(500).json({ success: false, message: "Error creating product", error: error.message });
    }
};

// ✅ 2. GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
    try {
        const { category, subCategory, page, limit, search, sort = "-createdAt" } = req.query;

        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const skip = (p - 1) * l;

        let rawProducts = [];
        if (subCategory && subCategory !== "" && subCategory !== "undefined") {
            rawProducts = await findByQuery(COLLECTION, 'subCategory', subCategory);
        } else if (category && category !== "" && category !== "undefined") {
            rawProducts = await findByQuery(COLLECTION, 'category', category);
        } else {
            rawProducts = await findAll(COLLECTION) || [];
        }

        let products = Array.isArray(rawProducts)
            ? rawProducts
            : (rawProducts && typeof rawProducts === 'object'
                ? Object.keys(rawProducts).map(key => ({ _id: key, ...rawProducts[key] }))
                : []);

        if (search && search !== "" && search !== "undefined") {
            // ✅ Initialize the custom MultiversalEngine with the raw products catalog
            const searchEngine = new MultiversalEngine(products);

            // ✅ Run the advanced search (TF-IDF, Levenshtein, Hinglish, Phonetic)
            products = searchEngine.search(search);

            // The search engine returns results sorted by score, so we map them to keep their scores
        }

        products = products.map((prod) => {
            const normalizedProduct = normalizeProductForResponse(prod);
            return {
                ...normalizedProduct,
                category: typeof prod.category === 'object' ? prod.category.name || prod.category.label || '' : prod.category || '',
                sizes: Array.isArray(prod.sizes) ? prod.sizes : [],
                colors: Array.isArray(prod.colors) ? prod.colors : [],
                searchScore: prod.searchScore // preserve search score if it exists
            };
        });

        const totalProducts = products.length;

        if (sort && (!search || search === "" || search === "undefined")) {
            // Only sort by other fields if we aren't doing a search
            // If doing a search, we want to keep the relevance score ordering from MultiversalEngine
            const sortField = sort.replace('-', '');
            const isDesc = sort.startsWith('-');
            products.sort((a, b) => {
                if (a[sortField] < b[sortField]) return isDesc ? 1 : -1;
                if (a[sortField] > b[sortField]) return isDesc ? -1 : 1;
                return 0;
            });
        }

        const paginatedProducts = products.slice(skip, skip + l);

        return res.json({
            success: true,
            data: paginatedProducts || [],
            pagination: {
                totalProducts,
                totalPages: Math.ceil(totalProducts / l),
                currentPage: p
            }
        });
    } catch (error) {
        console.error("❌ Backend Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 3. GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "ID is required" });

        const product = await findById(COLLECTION, id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const formattedProduct = normalizeProductForResponse(product);

        return res.json({ success: true, data: formattedProduct });
    } catch (error) {
        console.error(`❌ Error fetching product [${req.params.id}]:`, error);
        return res.status(500).json({ success: false, message: "Internal server error while fetching product", error: error.message });
    }
};

// ✅ 4. ROOM ANALYSIS
export const analyzeRoom = async (req, res) => {
    try {
        const { productId, roomType, roomDimensions, wallColor, flooring, furnitureStyle } = req.body || {};

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required for room analysis.' });
        }

        const product = await findById(COLLECTION, productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const rawProducts = await findAll(COLLECTION) || [];
        let products = Array.isArray(rawProducts)
            ? rawProducts
            : (rawProducts && typeof rawProducts === 'object'
                ? Object.keys(rawProducts).map(key => ({ _id: key, ...rawProducts[key] }))
                : []);

        const filteredSuggestions = products
            .filter((item) => String(item._id) !== String(productId))
            .sort((a, b) => (Number(b.rating || b.ratings?.average || 0)) - (Number(a.rating || a.ratings?.average || 0)))
            .slice(0, 8)
            .map((item) => ({
                id: item._id || item.id,
                name: item.name || item.title || 'Recommended product',
                thumbnail: item.thumbnail || item.images?.[0]?.url || item.image || '',
                sellingPrice: item.sellingPrice || item.price || item.newPrice || 0,
                category: item.category || ''
            }));

        const summaryParts = [
            roomType ? `a ${roomType.toLowerCase()}` : 'your space',
            roomDimensions ? `measuring ${roomDimensions}` : 'with flexible dimensions',
            wallColor ? `featuring ${wallColor} walls` : 'with neutral tones',
            flooring ? `and ${flooring} flooring` : 'and adaptable flooring',
            furnitureStyle ? `styled for ${furnitureStyle.toLowerCase()} furniture` : ''
        ].filter(Boolean);

        const summary = `This ${summaryParts.join(', ')} is a great fit for ${product.name || 'your selected product'}. We recommend matching it with clean silhouettes, warm textures, and layered lighting to keep the room balanced.`;

        return res.json({
            success: true,
            data: { summary, suggestions: filteredSuggestions }
        });
    } catch (error) {
        console.error('❌ analyzeRoom error:', error);
        return res.status(500).json({ success: false, message: 'Failed to analyze room.', error: error.message });
    }
};

// ✅ 5. UPDATE PRODUCT
// ✅ UPDATED: UPDATE PRODUCT CONTROLLER
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Product ID is required" });

        const existingProduct = await findById(COLLECTION, id);
        if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found" });

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Update payload missing." });
        }

        const {
            name, brand, description, shortDescription, category, subCategory, isActive,
            tags, mrp, sellingPrice, discountPercent, stock, sku,
            specifications, seoTitle, seoDescription, seoKeywords,
            sizes, colors, productInformation
        } = req.body;

        const allUploadedFiles = Array.isArray(req.files) ? req.files : [];

        let updateData = {
            name, brand, description, shortDescription, category, subCategory,
            mrp: mrp !== undefined ? Number(mrp) : undefined,
            sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : undefined,
            discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
            stock: stock !== undefined ? Number(stock) : undefined,
            sku,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
            seoTitle: seoTitle || name,
            seoDescription
        };

        if (sizes !== undefined) {
            try {
                updateData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (e) {
                updateData.sizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : [];
            }
        }

        // ✅ HANDLE COLOR VARIANTS WITH NEW FILE UPLOADS
        const rawColorsInput = colors || req.body.colorVariants || req.body.variants;
        if (rawColorsInput !== undefined) {
            let parsedColors = [];
            try {
                parsedColors = typeof rawColorsInput === 'string' ? JSON.parse(rawColorsInput) : rawColorsInput;
            } catch (e) {
                parsedColors = [];
            }

            if (Array.isArray(parsedColors)) {
                const finalColors = [];

                for (let i = 0; i < parsedColors.length; i++) {
                    let colorObj = typeof parsedColors[i] === 'string' ? { name: parsedColors[i] } : { ...parsedColors[i] };

                    // Existing images preserved from frontend
                    let existingVariantImages = Array.isArray(colorObj.images)
                        ? normalizeImageValue(colorObj.images)
                        : [];

                    // Filter new files for current color index (e.g. color_images_0 or color_images_0[])
                    const variantFiles = allUploadedFiles.filter(
                        (f) => f.fieldname === `color_images_${i}` || f.fieldname === `color_images_${i}[]`
                    );

                    let newUploadedVariantImages = [];
                    if (variantFiles.length > 0) {
                        for (const file of variantFiles) {
                            const fileContent = file.buffer || file.path;
                            if (fileContent) {
                                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name || existingProduct?.name || 'product');
                                const uploadResult = await uploadImageCloudinary(fileContent, `${productFolder}/variants`);
                                if (uploadResult && uploadResult.success) {
                                    newUploadedVariantImages.push({
                                        url: uploadResult.url,
                                        public_id: uploadResult.public_id
                                    });
                                }
                            }
                        }
                    }

                    // Merge Existing & Newly Uploaded Images
                    const allVariantImages = [...existingVariantImages, ...newUploadedVariantImages];

                    finalColors.push({
                        ...colorObj,
                        name: colorObj.name || `Variant ${i + 1}`,
                        label: colorObj.label || colorObj.name || `Variant ${i + 1}`,
                        images: allVariantImages,
                        img: allVariantImages.length > 0 ? allVariantImages[0].url : '',
                        swatchImg: colorObj.swatchImg || (allVariantImages.length > 0 ? allVariantImages[0].url : ''),
                        price: Number(colorObj.price || updateData.sellingPrice || existingProduct.sellingPrice || 0),
                        mrp: Number(colorObj.mrp || updateData.mrp || existingProduct.mrp || 0)
                    });
                }

                updateData.colors = finalColors;
            }
        }

        if (req.body.customAttributes !== undefined) {
            try {
                updateData.customAttributes = typeof req.body.customAttributes === 'string'
                    ? JSON.parse(req.body.customAttributes)
                    : req.body.customAttributes;
            } catch (e) {
                updateData.customAttributes = [];
            }
        }

        if (productInformation !== undefined) {
            try {
                updateData.productInformation = typeof productInformation === 'string'
                    ? JSON.parse(productInformation)
                    : productInformation;
            } catch (e) {
                updateData.productInformation = [];
            }
        }

        updateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined && !Number.isNaN(v)));

        if (tags) updateData.tags = (typeof tags === 'string' && tags.trim()) ? tags.split(',').map(t => t.trim()) : tags;

        const searchKeywordsRaw = req.body.seoKeywords || req.body.searchKeywords;
        if (searchKeywordsRaw) {
            updateData.seoKeywords = (typeof searchKeywordsRaw === 'string' && searchKeywordsRaw.trim())
                ? searchKeywordsRaw.replace(/\[|\]|"/g, '').split(',').map(k => k.trim()).filter(Boolean)
                : searchKeywordsRaw;
        }

        if (specifications && typeof specifications === 'string') {
            try {
                updateData.specifications = specifications.trim().startsWith('{') ? JSON.parse(specifications) : specifications;
            } catch (parseError) {
                updateData.specifications = specifications;
            }
        }

        let finalImages = [];
        const hasExistingImages = req.body.existingImages !== undefined;
        const imageOrderRaw = req.body.imageOrder;
        let imageOrder = [];

        if (imageOrderRaw) {
            try {
                imageOrder = typeof imageOrderRaw === 'string' ? JSON.parse(imageOrderRaw) : imageOrderRaw;
                if (!Array.isArray(imageOrder)) imageOrder = [];
            } catch (e) {
                imageOrder = [];
            }
        }

        if (hasExistingImages) {
            try {
                finalImages = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
                if (!Array.isArray(finalImages)) finalImages = [];
            } catch (e) {
                finalImages = [];
            }
        }

        const uploadedImages = allUploadedFiles.filter(f => f.fieldname === 'images' || f.fieldname === 'images[]');
        const uploadedModelFiles = allUploadedFiles.filter(f => f.fieldname === 'model3d');

        if (imageOrder.length > 0) {
            const existingQueue = [...finalImages];
            const newFilesQueue = [...uploadedImages];
            const orderedImages = [];

            for (const orderItem of imageOrder) {
                if (orderItem && orderItem.type === 'existing') {
                    const existingImage = existingQueue.shift();
                    if (existingImage) orderedImages.push(existingImage);
                } else if (orderItem && orderItem.type === 'new') {
                    const file = newFilesQueue.shift();
                    if (file) {
                        const fileContent = file.buffer || file.path;
                        if (!fileContent) continue;
                        const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name || existingProduct?.name || 'product');
                        const uploadResult = await uploadImageCloudinary(fileContent, productFolder);
                        if (uploadResult && uploadResult.success) {
                            orderedImages.push({
                                url: uploadResult.url,
                                public_id: uploadResult.public_id,
                                alt: name || "product image"
                            });
                        }
                    }
                }
            }

            while (existingQueue.length > 0) {
                orderedImages.push(existingQueue.shift());
            }
            while (newFilesQueue.length > 0) {
                const file = newFilesQueue.shift();
                const fileContent = file.buffer || file.path;
                if (!fileContent) continue;
                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name || existingProduct?.name || 'product');
                const uploadResult = await uploadImageCloudinary(fileContent, productFolder);
                if (uploadResult && uploadResult.success) {
                    orderedImages.push({
                        url: uploadResult.url,
                        public_id: uploadResult.public_id,
                        alt: name || "product image"
                    });
                }
            }

            finalImages = orderedImages;
        } else if (uploadedImages.length > 0) {
            for (const file of uploadedImages) {
                const fileContent = file.buffer || file.path;
                if (!fileContent) continue;

                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name || existingProduct?.name || 'product');
                const uploadResult = await uploadImageCloudinary(fileContent, productFolder);
                if (uploadResult && uploadResult.success) {
                    finalImages.push({
                        url: uploadResult.url,
                        public_id: uploadResult.public_id,
                        alt: name || "product image"
                    });
                }
            }
        }

        if (uploadedModelFiles.length > 0) {
            const oldModel3dPublicId = existingProduct.model3dPublicId || extractCloudinaryPublicIdFromUrl(existingProduct.model3dUrl || existingProduct.modelUrl);
            if (oldModel3dPublicId) {
                await deleteImageCloudinary(oldModel3dPublicId, { resource_type: 'auto' });
            }

            const modelFile = uploadedModelFiles[0];
            const fileContent = modelFile.buffer || modelFile.path;
            if (fileContent) {
                const productFolder = buildCloudinaryFolderPath('Aaramdehi_Uploads/products', name || existingProduct?.name || 'product');
                const uploadResult = await uploadImageCloudinary(fileContent, `${productFolder}/models`, { transformation: [] });
                if (uploadResult && uploadResult.success) {
                    updateData.model3dUrl = uploadResult.url;
                    updateData.model3dPublicId = uploadResult.public_id;
                }
            }
        } else if (req.body.removeModel3d === 'true' || req.body.removeModel3d === true) {
            const oldModel3dPublicId = existingProduct.model3dPublicId || extractCloudinaryPublicIdFromUrl(existingProduct.model3dUrl || existingProduct.modelUrl);
            if (oldModel3dPublicId) {
                await deleteImageCloudinary(oldModel3dPublicId, { resource_type: 'auto' });
            }
            updateData.model3dUrl = '';
            updateData.model3dPublicId = '';
        }

        if (hasExistingImages || uploadedImages.length > 0) {
            updateData.images = finalImages;
            if (finalImages.length > 0) {
                updateData.thumbnail = finalImages[0].url;
            }
        }

        const updatedProduct = await updateById(COLLECTION, id, updateData);

        return res.json({ success: true, message: "Updated successfully", data: updatedProduct });
    } catch (error) {
        console.error(`❌ Error updating product [${req.params.id}]:`, error);
        return res.status(500).json({ success: false, message: "Internal server error while updating product", error: error.message });
    }
};

// ✅ 6. ADD PRODUCT REVIEW
export const addProductReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId || req.user?._id;
        const userName = req.user?.name || "Customer";

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required" });
        }

        const product = await findById(COLLECTION, id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const reviews = Array.isArray(product.reviews) ? product.reviews : [];

        const alreadyReviewed = reviews.find(r => String(r.userId) === String(userId));
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "Product already reviewed by you" });
        }

        const reviewId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const review = {
            id: reviewId,
            userId,
            name: userName,
            rating: Number(rating),
            comment,
            createdAt: new Date().toISOString()
        };

        reviews.push(review);

        const ratingsCount = reviews.length;
        const avgRating = reviews.reduce((acc, item) => (item.rating || 0) + acc, 0) / ratingsCount;

        const updateData = {
            reviews,
            ratings: {
                average: parseFloat(avgRating.toFixed(1)),
                count: ratingsCount
            }
        };

        await updateById(COLLECTION, id, updateData);

        return res.status(201).json({ success: true, message: "Review added successfully", data: review });
    } catch (error) {
        console.error("❌ Review Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 7. DELETE PRODUCT REVIEW
export const deleteProductReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const product = await findById(COLLECTION, id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        let reviews = Array.isArray(product.reviews) ? product.reviews : [];

        const initialCount = reviews.length;
        reviews = reviews.filter(
            (r) => String(r.id) !== String(reviewId) && String(r.userId) !== String(reviewId)
        );

        if (reviews.length === initialCount) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        const ratingsCount = reviews.length;
        const avgRating = ratingsCount > 0
            ? reviews.reduce((acc, item) => (item.rating || 0) + acc, 0) / ratingsCount
            : 5;

        await updateById(COLLECTION, id, {
            reviews,
            ratings: {
                average: parseFloat(avgRating.toFixed(1)),
                count: ratingsCount
            }
        });

        return res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 8. TOGGLE PRODUCT STATUS
export const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await findById(COLLECTION, id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const currentStatus = product.isActive === undefined ? true : product.isActive;
        const newStatus = !currentStatus;

        await updateById(COLLECTION, id, { isActive: newStatus });

        return res.json({
            success: true,
            message: `Product is now ${newStatus ? 'Active' : 'Inactive'}`,
            isActive: newStatus
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 9. DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const product = await findById(COLLECTION, req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const publicIds = collectCloudinaryPublicIds(product);
        for (const publicId of publicIds) {
            if (publicId) {
                await deleteImageCloudinary(publicId, { resource_type: 'auto' });
            }
        }

        await deleteById(COLLECTION, req.params.id);
        return res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ 10. ADMIN DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
    try {
        const allProducts = (await findAll(COLLECTION)) || [];
        const totalProducts = allProducts.length;
        const totalStock = allProducts.reduce((sum, prod) => sum + (prod.stock || 0), 0);

        const lowStockProducts = allProducts
            .filter(prod => prod.stock < 10)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);

        const recentProducts = allProducts
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return res.json({
            success: true,
            data: {
                totalProducts,
                totalStock,
                lowStockProducts,
                recentProducts
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};