import { findByQuery, create, updateById, findAll } from "../config/db.js";

const normalizeKeywords = (keywords) => {
    if (Array.isArray(keywords)) return keywords;
    if (!keywords) return [];
    return String(keywords).split(',').map(k => k.trim()).filter(Boolean);
};

const DEFAULT_GLOBAL_SEO = {
    type: "GLOBAL",
    pageTitle: "Aaramdehi - Premium Home Furniture & Decor",
    metaDescription: "Discover premium furniture and home decor at Aaramdehi. Browse our collection of modern, traditional, and minimalist designs.",
    keywords: ["furniture", "home decor", "interior design", "Aaramdehi"],
    siteTitle: "Aaramdehi",
    siteDescription: "Premium Home Furniture & Decor Store",
    brandName: "Aaramdehi"
};

export const getGlobalSeo = async (req, res) => {
    try {
        const seoResults = await findByQuery('seo', 'type', 'GLOBAL');
        let seo = seoResults?.[0];

        if (!seo) {
            seo = await create('seo', {
                ...DEFAULT_GLOBAL_SEO,
                createdBy: req.userId || null
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

export const updateGlobalSeo = async (req, res) => {
    try {
        const { pageTitle, metaDescription, keywords, siteTitle, siteDescription, brandName, ogImage, ogTitle, ogDescription, robotsIndex, robotsFollow } = req.body;
        const seoResults = await findByQuery('seo', 'type', 'GLOBAL');
        let seo = seoResults?.[0];

        const payload = {};
        if (pageTitle) payload.pageTitle = pageTitle;
        if (metaDescription) payload.metaDescription = metaDescription;
        if (keywords !== undefined) payload.keywords = normalizeKeywords(keywords);
        if (siteTitle) payload.siteTitle = siteTitle;
        if (siteDescription) payload.siteDescription = siteDescription;
        if (brandName) payload.brandName = brandName;
        if (ogImage) payload.ogImage = ogImage;
        if (ogTitle) payload.ogTitle = ogTitle;
        if (ogDescription) payload.ogDescription = ogDescription;
        if (robotsIndex !== undefined) payload.robotsIndex = robotsIndex;
        if (robotsFollow !== undefined) payload.robotsFollow = robotsFollow;
        if (req.userId) payload.createdBy = req.userId;

        if (!seo) {
            seo = await create('seo', {
                ...DEFAULT_GLOBAL_SEO,
                ...payload,
                type: 'GLOBAL'
            });
        } else {
            seo = await updateById('seo', seo._id, payload);
        }

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

export const getSeoByType = async (req, res) => {
    try {
        const { type } = req.params;
        const seoResults = await findByQuery('seo', 'type', type);
        const seo = seoResults?.[0];

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

export const updateSeoByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { pageTitle, metaDescription, keywords, schema, robotsIndex, robotsFollow, canonical, ogImage, ogTitle, ogDescription } = req.body;
        const seoResults = await findByQuery('seo', 'type', type);
        let seo = seoResults?.[0];

        const payload = {};
        if (pageTitle) payload.pageTitle = pageTitle;
        if (metaDescription) payload.metaDescription = metaDescription;
        if (keywords !== undefined) payload.keywords = normalizeKeywords(keywords);
        if (schema) payload.schema = schema;
        if (robotsIndex !== undefined) payload.robotsIndex = robotsIndex;
        if (robotsFollow !== undefined) payload.robotsFollow = robotsFollow;
        if (canonical) payload.canonical = canonical;
        if (ogImage) payload.ogImage = ogImage;
        if (ogTitle) payload.ogTitle = ogTitle;
        if (ogDescription) payload.ogDescription = ogDescription;
        if (req.userId) payload.createdBy = req.userId;

        if (!seo) {
            seo = await create('seo', {
                type,
                ...payload
            });
        } else {
            seo = await updateById('seo', seo._id, payload);
        }

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

export const getAllSeo = async (req, res) => {
    try {
        const seoData = await findAll('seo');
        const sortedSeo = seoData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.json({
            success: true,
            message: "All SEO data fetched successfully",
            data: sortedSeo
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
