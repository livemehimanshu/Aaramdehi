import { uploadImageCloudinary, deleteImageCloudinary, extractCloudinaryPublicIdFromUrl } from "../utils/uploadImageCloudinary.js";
import { findAll, findById, create, updateById, deleteById, findByQuery, db } from "../config/db.js";

const COLLECTION = 'products';

// ✅ 1. CREATE NEW PRODUCT
export const createProduct = async (req, res) => {
    try {
        // ✅ Defensive check: Ensure req.body exists after Multer parsing
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Request body is empty. Check your FormData and Multer configuration." });
        }

        const { 
            name, brand, description, shortDescription, category, subCategory, 
            tags, mrp, sellingPrice, discountPercent, stock, sku, 
            specifications, seoTitle, seoDescription, seoKeywords, model3dUrl 
        } = req.body;
        const userId = req.userId || req.user?._id || req.user?.id;

        // ✅ 1. Advanced Validation: Check precisely for missing fields
        // Stock 0 ho sakta hai, isliye hum undefined/null check karenge
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!brand) missingFields.push("brand"); // ✅ Added brand to validation
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

        // Generate URL-friendly Slug
        const rawSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        let slug = rawSlug;

        // Ensure unique slug when product names repeat
        const existingSlugs = await findByQuery(COLLECTION, 'slug', slug);
        if (existingSlugs.length > 0) {
            slug = `${rawSlug}-${Date.now()}`;
        }

        let images = [];
        const uploadedImages = Array.isArray(req.files?.images) ? req.files.images : [];
        const uploadedModelFiles = Array.isArray(req.files?.model3d) ? req.files.model3d : [];

        console.log("📂 Incoming files check:", { hasFiles: !!req.files, imageCount: uploadedImages.length, modelFileCount: uploadedModelFiles.length });

        if (uploadedImages.length > 0) {
            console.log(`Processing ${uploadedImages.length} image files...`);
            for (const file of uploadedImages) {
                const fileContent = file.buffer || file.path;
                if (!fileContent) {
                    console.error("❌ File content is missing for image file:", file.originalname);
                    continue;
                }

                const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads/products");
                if (uploadResult && uploadResult.success) {
                    images.push({
                        url: uploadResult.url,
                        public_id: uploadResult.public_id,
                        alt: name
                    });
                } else {
                    console.error(`❌ Cloudinary Upload Error [${file.originalname}]:`, uploadResult?.message || "Unknown error");
                }
            }

            if (uploadedImages.length > 0 && images.length === 0) {
                return res.status(500).json({ success: false, message: "Could not upload images to Cloudinary. Check server logs." });
            }
        }

        let model3dUrlFromUpload = '';
        let model3dPublicIdFromUpload = '';
        if (uploadedModelFiles.length > 0) {
            const modelFile = uploadedModelFiles[0];
            const fileContent = modelFile.buffer || modelFile.path;
            if (fileContent) {
                const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads/products/models", { transformation: [] });
                if (uploadResult && uploadResult.success) {
                    model3dUrlFromUpload = uploadResult.url;
                    model3dPublicIdFromUpload = uploadResult.public_id;
                } else {
                    console.error(`❌ Cloudinary 3D model upload failed [${modelFile.originalname}]:`, uploadResult?.message || "Unknown error");
                    return res.status(500).json({ success: false, message: "Failed to upload 3D model. Please try again." });
                }
            }
        }

        const mrpNum = Number(mrp);
        const sellingPriceNum = Number(sellingPrice);

        const productData = {
            name,
            brand,
            description: description || "",
            shortDescription: shortDescription || "",
            category,
            subCategory: subCategory || "",
            tags: (typeof tags === 'string' && tags.trim()) ? tags.split(',').map(t => t.trim()) : [],
            mrp: mrpNum,
            sellingPrice: sellingPriceNum,
            // Auto-calculate discount if percent isn't explicitly sent
            discountPercent: Number(discountPercent) || Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100),
            stock: Number(stock),
            sku: sku || `SKU-${Date.now()}-${slug.slice(0,5)}`,
            images,
            thumbnail: images.length > 0 ? images[0].url : "",
            specifications: (specifications && typeof specifications === 'string' && specifications.startsWith('{')) ? JSON.parse(specifications) : {},
            seoTitle: seoTitle || name,
            seoDescription: seoDescription || shortDescription || "",
            seoKeywords: (typeof seoKeywords === 'string' && seoKeywords.trim()) ? seoKeywords.split(',').map(k => k.trim()) : [],
            slug,
            createdBy: userId || null
        };

        if (model3dUrl || model3dUrlFromUpload) {
            productData.model3dUrl = model3dUrl || model3dUrlFromUpload;
            if (model3dPublicIdFromUpload) {
                productData.model3dPublicId = model3dPublicIdFromUpload;
            }
        }

        const savedProduct = await create(COLLECTION, productData);
        // Server-side: write a lightweight search index entry using Admin SDK (bypasses RTDB security rules)
        try {
            const indexEntry = {
                name: productData.name,
                productId: savedProduct._id,
                searchKeywords: productData.seoKeywords.length > 0 ? productData.seoKeywords : [productData.brand, productData.category],
                indexedAt: new Date().toISOString()
            };
            await db.ref('product_indexes').push(indexEntry);
        } catch (indexErr) {
            console.warn('⚠️ Failed to write product index (server):', indexErr.message);
        }
        return res.status(201).json({ success: true, message: "Product created successfully", data: savedProduct });

    } catch (error) {
        console.error("❌ Error creating product:", error);
        return res.status(500).json({ success: false, message: "Error creating product", error: error.message });
    }
};

// ✅ 2. GET ALL PRODUCTS (Search & Filter)
// ✅ FIXED FOR FRONTEND COMPATIBILITY & ROBUSTNESS
export const getAllProducts = async (req, res) => {
    try {
        const { category, subCategory, page, limit, search, sort = "-createdAt" } = req.query;
        console.log("🔎 getAllProducts params:", { category, subCategory, page, limit, search, sort });
        
        const p = Number(page) || 1;
        const l = Number(limit) || 10; // Default limit 10
        const skip = (p - 1) * l;

        let rawProducts = [];
        // ✅ Optimization: Use native Firebase query for category or subCategory
        if (subCategory && subCategory !== "" && subCategory !== "undefined") {
            rawProducts = await findByQuery(COLLECTION, 'subCategory', subCategory);
        } else if (category && category !== "" && category !== "undefined") {
            rawProducts = await findByQuery(COLLECTION, 'category', category);
        } else {
            rawProducts = await findAll(COLLECTION) || [];
        }

        // ✅ Safe conversion: Ensure it behaves like an array and format for Frontend structure
        let products = Array.isArray(rawProducts) 
            ? rawProducts 
            : (rawProducts && typeof rawProducts === 'object' 
                ? Object.keys(rawProducts).map(key => ({ _id: key, ...rawProducts[key] })) 
                : []);

        // ✅ Map 'name' to 'title' dynamically so frontend 'item.title' never breaks
        products = products.map(prod => ({
            ...prod,
            id: prod.id || prod._id, // Ensure a consistent 'id' field
            title: prod.title || prod.name || prod.productName || "Unnamed Product", // Fixes Frontend drop-down blank issue
            // Ensure category is a string for consistent filtering
            category: typeof prod.category === 'object' ? prod.category.name || prod.category.label || '' : prod.category || ''
        }));

        // ✅ Search by name or brand (client-side search)
        if (search && search !== "" && search !== "undefined") {
            const searchLower = String(search).toLowerCase();
            products = products.filter(prod => 
                String(prod.name || "").toLowerCase().includes(searchLower) || 
                String(prod.title || "").toLowerCase().includes(searchLower) ||
                String(prod.brand || "").toLowerCase().includes(searchLower) ||
                String(prod.productName || "").toLowerCase().includes(searchLower) ||
                String(prod.category || "").toLowerCase().includes(searchLower) ||
                String(prod.description || "").toLowerCase().includes(searchLower) ||
                (prod.tags && Array.isArray(prod.tags) && prod.tags.some(t => String(t).toLowerCase().includes(searchLower))) ||
                (prod.sizes && Array.isArray(prod.sizes) && prod.sizes.some(s => String(s.label || s).toLowerCase().includes(searchLower)))
            );
        }

        const totalProducts = products.length;

        // ✅ Sort (client-side sorting)
        if (sort) {
            const sortField = sort.replace('-', '');
            const isDesc = sort.startsWith('-');
            products.sort((a, b) => {
                if (a[sortField] < b[sortField]) return isDesc ? 1 : -1;
                if (a[sortField] > b[sortField]) return isDesc ? -1 : 1;
                return 0;
            });
        }

        // 6. ✅ Pagination
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
        if (!id) {
            console.error("❌ getProductById called without id", req.params);
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        const product = await findById(COLLECTION, id);
        if (!product) {
            console.warn(`⚠️ Product not found for ID [${id}]`);
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, data: product });
    } catch (error) {
        console.error(`❌ Error fetching product [${req.params.id}]:`, error);
        return res.status(500).json({ success: false, message: "Internal server error while fetching product", error: error.message });
    }
};

// ✅ 4. ROOM ANALYSIS / PRODUCT SUGGESTIONS
export const analyzeRoom = async (req, res) => {
    try {
        const {
            productId,
            roomType,
            roomDimensions,
            wallColor,
            flooring,
            furnitureStyle,
            specialRequests
        } = req.body || {};

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
            .sort((a, b) => {
                const aRating = Number(a.rating || a.ratings?.average || 0);
                const bRating = Number(b.rating || b.ratings?.average || 0);
                return bRating - aRating;
            })
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
            data: {
                summary,
                suggestions: filteredSuggestions
            }
        });
    } catch (error) {
        console.error('❌ analyzeRoom error:', error);
        return res.status(500).json({ success: false, message: 'Failed to analyze room.', error: error.message });
    }
};

// ✅ 4. UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            console.error("❌ updateProduct called without id", req.params);
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const existingProduct = await findById(COLLECTION, id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Update payload missing. Ensure you are sending FormData." });
        }
        
        // ✅ Security Sanitization: Explicitly map allowed fields.
        // Prevents manipulation of sensitive fields like 'createdBy', 'userId', or '_id'.
        const { 
            name, brand, description, shortDescription, category, subCategory, isActive,
            tags, mrp, sellingPrice, discountPercent, stock, sku, 
            specifications, seoTitle, seoDescription, seoKeywords 
        } = req.body;

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
        
        // ✅ Cleanup: Remove undefined/NaN fields to prevent database corruption.
        updateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined && !Number.isNaN(v)));

        // Handle parsing of stringified fields from FormData
        console.log("📦 updateProduct payload:", {
            id,
            bodyKeys: Object.keys(req.body),
            hasExistingImages: req.body.existingImages !== undefined,
            fileCount: req.files ? (Array.isArray(req.files) ? req.files.length : Object.values(req.files).flat().length) : 0
        });

        if (tags) {
            updateData.tags = (typeof tags === 'string' && tags.trim()) ? tags.split(',').map(t => t.trim()) : tags;
        }

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
                console.error("❌ Invalid specifications JSON:", parseError, specifications);
                updateData.specifications = specifications;
            }
        }

        // ✅ Image + 3D model update handling
        let finalImages = [];
        const hasExistingImages = req.body.existingImages !== undefined;
        const hasExistingImagesField = hasExistingImages;

        if (hasExistingImagesField) {
            try {
                finalImages = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
                if (!Array.isArray(finalImages)) finalImages = [];
            } catch (e) {
                console.error("❌ Error parsing existingImages:", e);
                finalImages = [];
            }
        }

        console.log("📂 Update incoming files:", { hasFiles: !!req.files, hasFile: !!req.file, hasExistingImages: hasExistingImagesField });

        const uploadedImages = req.files?.images
            ? (Array.isArray(req.files.images) ? req.files.images : [req.files.images])
            : [];
        const uploadedModelFiles = req.files?.model3d
            ? (Array.isArray(req.files.model3d) ? req.files.model3d : [req.files.model3d])
            : [];

        if (uploadedImages.length > 0) {
            for (const file of uploadedImages) {
                const fileContent = file.buffer || file.path;
                if (!fileContent) {
                    console.error("❌ Update: File content is missing for image file:", file.originalname);
                    continue;
                }

                const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads/products");
                if (uploadResult && uploadResult.success) {
                    finalImages.push({
                        url: uploadResult.url,
                        public_id: uploadResult.public_id,
                        alt: name || "product image"
                    });
                } else {
                    console.error(`❌ Update: Cloudinary image upload failed [${file.originalname}]:`, uploadResult?.message);
                }
            }
        }

        if (uploadedModelFiles.length > 0) {
            const oldModel3dPublicId = existingProduct.model3dPublicId || extractCloudinaryPublicIdFromUrl(existingProduct.model3dUrl || existingProduct.modelUrl);
            if (oldModel3dPublicId) {
                const deleteResult = await deleteImageCloudinary(oldModel3dPublicId, { resource_type: 'auto' });
                if (!deleteResult.success) {
                    console.warn('⚠️ Unable to delete old Cloudinary 3D model:', deleteResult.message);
                }
            }

            const modelFile = uploadedModelFiles[0];
            const fileContent = modelFile.buffer || modelFile.path;
            if (fileContent) {
                const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads/products/models", { transformation: [] });
                if (uploadResult && uploadResult.success) {
                    updateData.model3dUrl = uploadResult.url;
                    updateData.model3dPublicId = uploadResult.public_id;
                } else {
                    console.error(`❌ Update: Cloudinary 3D model upload failed [${modelFile.originalname}]:`, uploadResult?.message);
                }
            }
        } else if (req.body.removeModel3d === 'true' || req.body.removeModel3d === true) {
            const oldModel3dPublicId = existingProduct.model3dPublicId || extractCloudinaryPublicIdFromUrl(existingProduct.model3dUrl || existingProduct.modelUrl);
            if (oldModel3dPublicId) {
                const deleteResult = await deleteImageCloudinary(oldModel3dPublicId, { resource_type: 'auto' });
                if (!deleteResult.success) {
                    console.warn('⚠️ Unable to delete old Cloudinary 3D model:', deleteResult.message);
                }
            }
            updateData.model3dUrl = '';
            updateData.model3dPublicId = '';
        }

        // Only update image array if user sent existing set or uploaded new files
        if (hasExistingImagesField || uploadedImages.length > 0) {
            updateData.images = finalImages;
            if (finalImages.length > 0) {
                updateData.thumbnail = finalImages[0].url;
            }
        }

        const updatedProduct = await updateById(COLLECTION, id, updateData);

        // ✅ Update Search Index
        try {
            const indexResults = await findByQuery('product_indexes', 'productId', id);
            if (indexResults.length > 0) {
                const indexId = indexResults[0]._id;
                await updateById('product_indexes', indexId, {
                    name: updateData.name || updatedProduct.name,
                    searchKeywords: updateData.seoKeywords || updatedProduct.seoKeywords || [updatedProduct.brand, updatedProduct.category],
                    indexedAt: new Date().toISOString()
                });
            }
        } catch (indexErr) { console.warn('⚠️ Search index update failed:', indexErr.message); }

        return res.json({ success: true, message: "Updated successfully", data: updatedProduct });
    } catch (error) {
        console.error(`❌ Error updating product [${req.params.id}]:`, error);
        return res.status(500).json({ success: false, message: "Internal server error while updating product", error: error.message });
    }
};

// ✅ 4.5 ADD PRODUCT REVIEW
export const addProductReview = async (req, res) => {
    // This system calculates average ratings and enforces a one-review-per-user policy.
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
        
        // ✅ Duplicate Check: Prevent multiple reviews from the same user ID.
        const alreadyReviewed = reviews.find(r => String(r.userId) === String(userId));
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "Product already reviewed by you" });
        }

        const review = {
            userId,
            name: userName,
            rating: Number(rating),
            comment,
            createdAt: new Date().toISOString()
        };

        reviews.push(review);

        // ✅ Rating Logic: Recalculate average whenever a new review is added.
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

// ✅ 4.7 DELETE PRODUCT REVIEW (Admin/User)
export const deleteProductReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params; // reviewId would be the timestamp or userId
        const product = await findById(COLLECTION, id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        let reviews = Array.isArray(product.reviews) ? product.reviews : [];
        
        // Filter out the review (assuming we identify by userId)
        const initialCount = reviews.length;
        reviews = reviews.filter(r => String(r.userId) !== String(reviewId));

        if (reviews.length === initialCount) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Recalculate average
        const ratingsCount = reviews.length;
        const avgRating = ratingsCount > 0 
            ? reviews.reduce((acc, item) => (item.rating || 0) + acc, 0) / ratingsCount 
            : 5; // Default back to 5 if no reviews left

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

// ✅ 4.6 TOGGLE PRODUCT STATUS (Visibility)
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

// ✅ 5. DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        await deleteById(COLLECTION, req.params.id);
        return res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ 6. ADMIN DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
    try {
        // ✅ FIREBASE: Get all products
        const allProducts = (await findAll(COLLECTION)) || [];

        const totalProducts = allProducts.length;

        // ✅ Calculate total stock by summing all product stocks
        const totalStock = allProducts.reduce((sum, prod) => sum + (prod.stock || 0), 0);

        // ✅ Find low stock products (stock < 10)
        const lowStockProducts = allProducts
            .filter(prod => prod.stock < 10)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);

        // ✅ Find recent products (sorted by createdAt descending)
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