import { create, findAll, findById, updateById, deleteById, findByQuery } from '../config/db.js';
import { uploadImageCloudinary, deleteImageCloudinary, extractCloudinaryPublicIdFromUrl } from '../utils/uploadImageCloudinary.js';

// Convert string to URL-friendly slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Create new Blog
export const createBlog = async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, author, image, metaTitle, metaDescription, metaKeywords, status } = req.body;
        const normalizedStatus = String(status || 'Draft').trim().toLowerCase() === 'published'
            ? 'Published'
            : 'Draft';

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        if (normalizedStatus === 'Published' && (!image || !excerpt || !metaTitle || !metaDescription || !metaKeywords || !author)) {
            return res.status(400).json({
                success: false,
                message: 'Cover image, excerpt, author, and all SEO fields are required before publishing'
            });
        }

        let slug = req.body.slug;
        if (!slug) {
            slug = generateSlug(title);
        } else {
            slug = generateSlug(slug);
        }

        // Check if slug already exists
        const existingBlogs = await findByQuery('blogs', 'slug', slug);
        if (existingBlogs && existingBlogs.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const newBlog = {
            title,
            slug,
            excerpt: excerpt || '',
            content,
            category: category || 'General',
            tags: tags || [],
            author: author || 'Aaramdehi Team',
            image: image || '',
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || excerpt,
            metaKeywords: metaKeywords || '',
            status: normalizedStatus,
            views: 0,
            publishedAt: normalizedStatus === 'Published' ? new Date().toISOString() : null,
        };

        const created = await create('blogs', newBlog);
        res.status(201).json({ success: true, data: created, message: 'Blog created successfully' });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

export const uploadBlogImage = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ success: false, message: 'Please select an image file' });
        }

        const uploadResult = await uploadImageCloudinary(req.file.buffer, 'Aaramdehi_Uploads/blogs');
        if (!uploadResult.success) {
            return res.status(500).json({ success: false, message: uploadResult.message || 'Image upload failed' });
        }

        return res.status(201).json({
            success: true,
            data: { url: uploadResult.url, public_id: uploadResult.public_id },
            message: 'Blog image uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading blog image:', error);
        return res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
    }
};

// Get All Blogs (Public & Admin)
export const getAllBlogs = async (req, res) => {
    try {
        const isAdmin = req.query.admin === 'true'; // Used to fetch drafts too
        const allBlogs = await findAll('blogs');
        
        let filteredBlogs = allBlogs;
        if (!isAdmin) {
            filteredBlogs = allBlogs.filter(blog => (
                String(blog.status || '').trim().toLowerCase() === 'published'
            ));
        }

        // Sort by created/published date descending
        filteredBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, data: filteredBlogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Get Single Blog by Slug or ID
export const getBlogByIdOrSlug = async (req, res) => {
    try {
        const { identifier } = req.params;
        const allBlogs = await findAll('blogs');
        
        // Find by exact ID or Slug
        const blog = allBlogs.find(b => b._id === identifier || b.slug === identifier);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const isAdminRequest = req.query.admin === 'true' && req.user?.role === 'ADMIN';
        if (String(blog.status || '').trim().toLowerCase() !== 'published' && !isAdminRequest) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Increment Views if not an admin fetching it
        if (!isAdminRequest) {
            const newViews = (blog.views || 0) + 1;
            await updateById('blogs', blog._id, { views: newViews });
            blog.views = newViews;
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Update Blog
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.status !== undefined) {
            updateData.status = String(updateData.status).trim().toLowerCase() === 'published'
                ? 'Published'
                : 'Draft';
        }

        if (updateData.status === 'Published') {
            const existing = (await findAll('blogs')).find((blog) => blog._id === id);
            const publishData = { ...existing, ...updateData };
            if (!publishData.image || !publishData.excerpt || !publishData.metaTitle || !publishData.metaDescription || !publishData.metaKeywords || !publishData.author) {
                return res.status(400).json({
                    success: false,
                    message: 'Cover image, excerpt, author, and all SEO fields are required before publishing'
                });
            }
        }

        if (updateData.title && !updateData.slug) {
            updateData.slug = generateSlug(updateData.title);
        } else if (updateData.slug) {
            updateData.slug = generateSlug(updateData.slug);
        }

        // Handle publish date
        if (updateData.status === 'Published' && !updateData.publishedAt) {
            updateData.publishedAt = new Date().toISOString();
        }

        const updated = await updateById('blogs', id, updateData);
        res.status(200).json({ success: true, data: updated, message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await findById('blogs', id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const publicId = blog.imagePublicId || extractCloudinaryPublicIdFromUrl(blog.image);
        if (publicId) {
            try {
                await deleteImageCloudinary(publicId, { resource_type: 'auto' });
            } catch (cloudinaryError) {
                console.warn('Blog image cleanup failed:', cloudinaryError.message);
            }
        }

        await deleteById('blogs', id);
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
