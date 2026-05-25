import SeoModel from "../models/seo.model.js";

// ✅ GET GLOBAL SEO
export const getGlobalSeo = async (req, res) => {
    try {
        let seo = await SeoModel.findOne({ type: "GLOBAL" });

        if (!seo) {
            // Create default global SEO if doesn't exist
            seo = await SeoModel.create({
                type: "GLOBAL",
                pageTitle: "Aaramdehi - Premium Home Furniture & Decor",
                metaDescription: "Discover premium furniture and home decor at Aaramdehi. Browse our collection of modern, traditional, and minimalist designs.",
                keywords: ["furniture", "home decor", "interior design", "Aaramdehi"],
                siteTitle: "Aaramdehi",
                siteDescription: "Premium Home Furniture & Decor Store",
                brandName: "Aaramdehi"
            });
        }

        return res.json({
            success: true,
            message: "Global SEO fetched successfully",
            data: seo
        });
    } catch (error) {
        console.error("❌ Error fetching global SEO:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching global SEO",
            error: error.message
        });
    }
};

// ✅ UPDATE GLOBAL SEO
export const updateGlobalSeo = async (req, res) => {
    try {
        const { pageTitle, metaDescription, keywords, siteTitle, siteDescription, brandName, ogImage, ogTitle, ogDescription, robotsIndex, robotsFollow } = req.body;

        let seo = await SeoModel.findOne({ type: "GLOBAL" });

        if (!seo) {
            seo = new SeoModel({ type: "GLOBAL" });
        }

        if (pageTitle) seo.pageTitle = pageTitle;
        if (metaDescription) seo.metaDescription = metaDescription;
        if (keywords) seo.keywords = keywords.split(',').map(k => k.trim());
        if (siteTitle) seo.siteTitle = siteTitle;
        if (siteDescription) seo.siteDescription = siteDescription;
        if (brandName) seo.brandName = brandName;
        if (ogImage) seo.ogImage = ogImage;
        if (ogTitle) seo.ogTitle = ogTitle;
        if (ogDescription) seo.ogDescription = ogDescription;
        if (robotsIndex !== undefined) seo.robotsIndex = robotsIndex;
        if (robotsFollow !== undefined) seo.robotsFollow = robotsFollow;

        seo.createdBy = req.userId;
        await seo.save();

        return res.json({
            success: true,
            message: "Global SEO updated successfully",
            data: seo
        });
    } catch (error) {
        console.error("❌ Error updating global SEO:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating global SEO",
            error: error.message
        });
    }
};

// ✅ GET SEO BY TYPE
export const getSeoByType = async (req, res) => {
    try {
        const { type } = req.params;

        const seo = await SeoModel.findOne({ type });

        if (!seo) {
            return res.status(404).json({
                success: false,
                message: `SEO data not found for type: ${type}`
            });
        }

        return res.json({
            success: true,
            message: "SEO data fetched successfully",
            data: seo
        });
    } catch (error) {
        console.error("❌ Error fetching SEO:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching SEO",
            error: error.message
        });
    }
};

// ✅ UPDATE SEO BY TYPE
export const updateSeoByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { pageTitle, metaDescription, keywords, schema, robotsIndex, robotsFollow, canonical, ogImage, ogTitle, ogDescription } = req.body;

        let seo = await SeoModel.findOne({ type });

        if (!seo) {
            seo = new SeoModel({ type });
        }

        if (pageTitle) seo.pageTitle = pageTitle;
        if (metaDescription) seo.metaDescription = metaDescription;
        if (keywords) seo.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
        if (schema) seo.schema = schema;
        if (robotsIndex !== undefined) seo.robotsIndex = robotsIndex;
        if (robotsFollow !== undefined) seo.robotsFollow = robotsFollow;
        if (canonical) seo.canonical = canonical;
        if (ogImage) seo.ogImage = ogImage;
        if (ogTitle) seo.ogTitle = ogTitle;
        if (ogDescription) seo.ogDescription = ogDescription;

        seo.createdBy = req.userId;
        await seo.save();

        return res.json({
            success: true,
            message: "SEO updated successfully",
            data: seo
        });
    } catch (error) {
        console.error("❌ Error updating SEO:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating SEO",
            error: error.message
        });
    }
};

// ✅ GET ALL SEO DATA
export const getAllSeo = async (req, res) => {
    try {
        const seoData = await SeoModel.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            message: "All SEO data fetched successfully",
            data: seoData
        });
    } catch (error) {
        console.error("❌ Error fetching SEO data:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching SEO data",
            error: error.message
        });
    }
};
