import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";
import { findAll, findById, create, updateById, deleteById, findByQuery, db } from "../config/db.js";

const COLLECTION = 'products';

// ✅ 1. CREATE NEW PRODUCT
export const createProduct = async (req, res) => {
    try {
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

        // Duplicate Check (Manual check for Firebase)
        const existingProducts = await findByQuery(COLLECTION, 'name', name);
        if (existingProducts.length > 0) {
            return res.status(409).json({ success: false, message: "Product with this name already exists" });
        }

        // Generate URL-friendly Slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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

                // ✅ Corrected: Added 'products' folder name to utility call
                const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads");
                
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

        const productData = {
            name,
            brand,
            description: description || "",
            shortDescription: shortDescription || "",
            category,
            subCategory: subCategory || "",
            tags: (typeof tags === 'string' && tags.trim()) ? tags.split(',').map(t => t.trim()) : [],
            mrp: Number(mrp),
            sellingPrice: Number(sellingPrice),
            discountPercent: Number(discountPercent) || 0,
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
        const { category, page, limit, search, sort = "createdAt" } = req.query;
        
        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const skip = (p - 1) * l;

        // ✅ FIREBASE: Get all products
        let products = (await findAll(COLLECTION)) || [];

        // ✅ Filter by category (client-side filtering)
        if (category && category !== "" && category !== "undefined") {
            products = products.filter(prod => prod.category === category);
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
        
        // ✅ सुरक्षा (Sanitization): '...rest' के बजाय सभी फील्ड्स को स्पष्ट रूप से निकालें
        // इससे यूजर 'role' या 'createdBy' जैसे संवेदनशील फील्ड्स को अपडेट नहीं कर पाएगा
        const { 
            name, brand, description, shortDescription, category, subCategory, 
            tags, mrp, sellingPrice, discountPercent, stock, sku, 
            specifications, seoTitle, seoDescription, seoKeywords 
        } = req.body;

        let updateData = {
            name, brand, description, shortDescription, category, subCategory,
            mrp: Number(mrp),
            sellingPrice: Number(sellingPrice),
            discountPercent: Number(discountPercent) || 0,
            stock: Number(stock),
            sku,
            seoTitle,
            seoDescription
        };
        
        // ✅ Fix: Remove undefined fields to prevent Firebase update crash
        updateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

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

        // Robust handling for updates as well
        console.log("📂 Update incoming files:", { hasFiles: !!req.files, hasFile: !!req.file });
        
        const filesToUpload = req.files 
            ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) 
            : (req.file ? [req.file] : []);

        if (filesToUpload.length > 0) {
            const newImages = [];
            for (const file of filesToUpload) {
                const fileContent = file.buffer || file.path;
                if (!fileContent) {
                    console.error("❌ Update: File content is missing for file:", file.originalname);
                    continue;
                }

            // ✅ Fix: Standardized to 'Aaramdehi_Uploads' folder
            const uploadResult = await uploadImageCloudinary(fileContent, "Aaramdehi_Uploads");
                if (uploadResult && uploadResult.success) {
                    newImages.push({ 
                        url: uploadResult.url, 
                        public_id: uploadResult.public_id,
                        alt: name || "product image" 
                    });
                } else {
                    console.error(`❌ Update: Cloudinary Error [${file.originalname}]:`, uploadResult?.message);
                }
            }
            
            if (newImages.length > 0) {
                // Purani images ke sath naye images ko combine karne ke liye logic (optional)
                updateData.images = newImages; 
                updateData.thumbnail = newImages[0].url;
            }
        }

        const updatedProduct = await updateById(COLLECTION, id, updateData);
        return res.json({ success: true, message: "Updated successfully", data: updatedProduct });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
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