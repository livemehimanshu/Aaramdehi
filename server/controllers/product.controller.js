import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";
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
            specifications, seoTitle, seoDescription, seoKeywords 
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
        // Robust handling for req.files (array or object) and req.file
        console.log("📂 Incoming files check:", { hasFiles: !!req.files, hasFile: !!req.file });
        
        const filesToUpload = req.files 
            ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) 
            : (req.file ? [req.file] : []);

        if (filesToUpload.length > 0) {
            console.log(`Processing ${filesToUpload.length} files...`);
            for (const file of filesToUpload) {
                // Check if buffer exists (memoryStorage) or path exists (diskStorage)
                const fileContent = file.buffer || file.path;
                if (!fileContent) {
                    console.error("❌ File content is missing for file:", file.originalname);
                    continue;
                }

                // ✅ Suggestion: Use a specific subfolder for products
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
            
            // Agar files bheji gayi thi par ek bhi upload nahi hui toh error return karein
            if (filesToUpload.length > 0 && images.length === 0) {
                return res.status(500).json({ success: false, message: "Could not upload images to Cloudinary. Check server logs." });
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
// ✅ 2. GET ALL PRODUCTS (Search & Filter)
// ✅ GET ALL PRODUCTS (Updated logic to show all data to Admin)
export const getAllProducts = async (req, res) => {
    try {
        const { category, page, limit, search, sort = "-createdAt" } = req.query;
        
        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const skip = (p - 1) * l;

        let products;
        // ✅ Optimization: Use native Firebase query for category
        if (category && category !== "" && category !== "undefined") {
            products = await findByQuery(COLLECTION, 'category', category);
        } else {
            products = (await findAll(COLLECTION)) || [];
        }

        // ✅ Search by name or brand (client-side search)
        if (search && search !== "" && search !== "undefined") {
            const searchLower = search.toLowerCase();
            products = products.filter(prod => 
                prod.name.toLowerCase().includes(searchLower) || 
                prod.brand.toLowerCase().includes(searchLower)
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

        // ✅ Pagination (client-side)
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
        const product = await findById(COLLECTION, req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        return res.json({ success: true, data: product });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ 4. UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body) {
            return res.status(400).json({ success: false, message: "No data provided for update." });
        }
        
        // ✅ Security Sanitization: Explicitly extract allowed fields.
        // This prevents users from manipulating internal fields like 'createdBy' or 'userId'.
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
        if (tags) {
            updateData.tags = (typeof tags === 'string' && tags.trim()) ? tags.split(',').map(t => t.trim()) : tags;
        }
        if (seoKeywords) {
            updateData.seoKeywords = (typeof seoKeywords === 'string' && seoKeywords.trim()) ? seoKeywords.split(',').map(k => k.trim()) : seoKeywords;
        }
        if (specifications && typeof specifications === 'string' && specifications.startsWith('{')) {
            updateData.specifications = JSON.parse(specifications);
        }

        // ✅ Image Merging Logic: Handle images the user wants to keep.
        let finalImages = [];
        const hasExistingImagesField = req.body.existingImages !== undefined;
        
        if (hasExistingImagesField) {
            try {
                finalImages = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
                if (!Array.isArray(finalImages)) finalImages = [];
            } catch (e) { console.error("❌ Error parsing existingImages:", e); }
        }

        console.log("📂 Update incoming files:", { hasFiles: !!req.files, hasFile: !!req.file });
        
        const filesToUpload = req.files 
            ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) 
            : (req.file ? [req.file] : []);

        if (filesToUpload.length > 0) {
            for (const file of filesToUpload) {
                const fileContent = file.buffer || file.path;
                if (!fileContent) {
                    console.error("❌ Update: File content is missing for file:", file.originalname);
                    continue;
                }

            // ✅ Standardized folder path
            const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads/products");
                if (uploadResult && uploadResult.success) {
                    finalImages.push({ 
                        url: uploadResult.url, 
                        public_id: uploadResult.public_id,
                        alt: name || "product image" 
                    });
                } else {
                    console.error(`❌ Update: Cloudinary Error [${file.originalname}]:`, uploadResult?.message);
                }
            }
        }

        // ✅ Update image array only if images were modified or new ones added
        if (hasExistingImagesField || filesToUpload.length > 0) {
            updateData.images = finalImages;
            updateData.thumbnail = finalImages.length > 0 ? finalImages[0].url : "";
        }

        const updatedProduct = await updateById(COLLECTION, id, updateData);
        return res.json({ success: true, message: "Updated successfully", data: updatedProduct });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
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

// ✅ 4.6 TOGGLE PRODUCT STATUS
export const toggleProductStatus = async (req, res) => {
    // Allows admins to hide products from the frontend without permanent deletion.
    try {
        const { id } = req.params;
        const product = await findById(COLLECTION, id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // If field is missing, default to false then toggle
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