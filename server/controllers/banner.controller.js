import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";
import { findAll, findById, create, updateById, deleteById, findByQuery } from "../config/db.js"; // findByQuery added

const COLLECTION = 'banners';

// Get all banners with filters and pagination
export const getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Firebase se saara data lao
    let banners = await findAll(COLLECTION);

    // Manual Filtering
    if (category) banners = banners.filter(b => b.category === category);
    if (isActive !== undefined) {
      const activeStatus = isActive === "true";
      banners = banners.filter(b => b.isActive === activeStatus);
    }

    // Manual Sorting (Position low to high, then Newest first)
    banners.sort((a, b) => {
      if (a.position !== b.position) return (a.position || 0) - (b.position || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = banners.length;
    const paginatedBanners = banners.slice(skip, skip + parseInt(limit));

    return res.json({
      success: true,
      message: "Banners fetched successfully",
      data: paginatedBanners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get banner by ID
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await findById(COLLECTION, id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.json({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new banner
export const createBanner = async (req, res) => {
  try {
    const { title, link, category, position, altText, startDate, endDate } =
      req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      // Check if buffer exists (memoryStorage) or path exists (diskStorage)
      const fileToUpload = req.file.buffer || req.file.path;
      if (!fileToUpload) throw new Error("File content is missing");

      const uploadResult = await uploadImageCloudinary(fileToUpload, "banners");
      // Check if upload was successful. If not, return the detailed error message.
      if (uploadResult && !uploadResult.success) {
          return res.status(500).json({
              success: false,
              message: uploadResult.message // Propagate the detailed error from Cloudinary helper
          });
      } else if (!uploadResult || !uploadResult.url) {
        throw new Error("Cloudinary upload failed: No secure_url returned.");
      }
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.public_id;
    } else {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    const bannerData = {
      title,
      image: imageUrl,
      imagePublicId,
      link: link || "",
      category: category || "promotional",
      position: parseInt(position) || 0,
      altText: altText || "",
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      isActive: true,
      createdBy: req.user?._id || req.user?.id || req.userId,
    };

    const savedBanner = await create(COLLECTION, bannerData);

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: savedBanner,
    });
  } catch (error) {
    console.error("🔥 createBanner Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, category, position, altText, isActive, startDate, endDate } =
      req.body;

    // ✅ FIX: Use Firebase findById helper instead of Mongoose Banner model
    const banner = await findById(COLLECTION, id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    if (title) banner.title = title;
    if (link !== undefined) banner.link = link; // Empty string bhi valid hai
    if (category) banner.category = category;
    if (position !== undefined) banner.position = position;
    if (altText !== undefined) banner.altText = altText;
    // ✅ FIX: Ensure isActive is a boolean even if sent as a string from FormData
    if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;
    if (startDate) banner.startDate = new Date(startDate).toISOString(); // Ensure ISO string
    if (endDate) banner.endDate = new Date(endDate).toISOString(); // Ensure ISO string

    if (req.file) {
      // FIX: Apply robust file check like in createBanner
      const fileToUpload = req.file.buffer || req.file.path;
      if (!fileToUpload) throw new Error("File content is missing for update.");

      const uploadResult = await uploadImageCloudinary(fileToUpload, "banners");
      // Check if upload was successful. If not, return the detailed error message.
      if (uploadResult && !uploadResult.success) {
          return res.status(500).json({
              success: false,
              message: uploadResult.message // Propagate the detailed error from Cloudinary helper
          });
      } else if (!uploadResult || !uploadResult.url) {
          throw new Error("Cloudinary upload failed: No secure_url returned during update.");
      }
      banner.image = uploadResult.url;
      banner.imagePublicId = uploadResult.public_id;
    } // else if (req.body.image === '') { banner.image = ''; banner.imagePublicId = ''; } // Agar image clear karni ho

    banner.lastModifiedBy = req.user?._id || req.user?.id || req.userId;
    await updateById(COLLECTION, id, banner); // Firebase helper use kiya

    return res.json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("🔥 updateBanner Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteById(COLLECTION, id);

    return res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get banners for frontend (active only)
export const getActiveBanners = async (req, res) => {
  try {
    const { category } = req.query;
    const now = new Date();

    // Firebase se saare banners fetch karein
    let allBanners = await findAll(COLLECTION);

    // Manual filtering for active banners
    const activeBanners = allBanners.filter(banner => {
      // ✅ Robust check for boolean status (handles string "true" if data was imported incorrectly)
      const isStatusActive = banner.isActive === true || banner.isActive === "true";
      
      const bannerStartDate = banner.startDate ? new Date(banner.startDate) : null;
      const bannerEndDate = banner.endDate ? new Date(banner.endDate) : null;

      const isCurrentlyActive = isStatusActive &&
                                (bannerStartDate === null || bannerStartDate <= now) &&
                                (bannerEndDate === null || bannerEndDate >= now);

      const matchesCategory = category ? banner.category === category : true;

      return isCurrentlyActive && matchesCategory;
    });

    // Sort by position
    activeBanners.sort((a, b) => (a.position || 0) - (b.position || 0));

    return res.json({
      success: true,
      message: "Active banners fetched successfully",
      data: activeBanners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
