import { db, create, findAll, updateById, deleteById, findByQuery } from '../config/db.js';

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

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
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
            status: status || 'Draft', // Draft or Published
            views: 0,
            publishedAt: status === 'Published' ? new Date().toISOString() : null,
        };

        const created = await create('blogs', newBlog);
        res.status(201).json({ success: true, data: created, message: 'Blog created successfully' });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Get All Blogs (Public & Admin)
export const getAllBlogs = async (req, res) => {
    try {
        const isAdmin = req.query.admin === 'true'; // Used to fetch drafts too
        const allBlogs = await findAll('blogs');
        
        let filteredBlogs = allBlogs;
        if (!isAdmin) {
            filteredBlogs = allBlogs.filter(blog => blog.status === 'Published');
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

        // Increment Views if not an admin fetching it
        if (req.query.admin !== 'true') {
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
        await deleteById('blogs', id);
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
