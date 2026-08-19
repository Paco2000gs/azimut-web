import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { readPrerenderedData } from '../utils/prerenderedData';
import { deleteFile } from '../utils/storage';

const BlogContext = createContext();

export const useBlog = () => useContext(BlogContext);

// See PropertiesContext: read once at module load, off the prerendered island.
const SEED = readPrerenderedData('posts');

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState(SEED || []);
    const [loading, setLoading] = useState(!SEED);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            if (!SEED) setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching posts:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addPost = async (postData) => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([postData])
                .select()
                .single();

            if (error) throw error;
            setPosts(prev => [data, ...prev]);
            return { success: true, data };
        } catch (err) {
            console.error('Error adding post:', err.message);
            return { success: false, error: err.message };
        }
    };

    const updatePost = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setPosts(prev => prev.map(p => p.id === id ? data : p));
            return { success: true, data };
        } catch (err) {
            console.error('Error updating post:', err.message);
            return { success: false, error: err.message };
        }
    };

    const deletePost = async (id) => {
        try {
            const { data: post } = await supabase
                .from('posts')
                .select('image')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Same rule as property media: the row goes first, the file second.
            if (post?.image) await deleteFile(post.image);

            setPosts(prev => prev.filter(p => p.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error deleting post:', err.message);
            return { success: false, error: err.message };
        }
    };

    const getPostById = (id) => {
        return posts.find(p => p.id === parseInt(id));
    };

    return (
        <BlogContext.Provider value={{
            posts,
            loading,
            error,
            addPost,
            updatePost,
            deletePost,
            getPostById,
            refreshPosts: fetchPosts
        }}>
            {children}
        </BlogContext.Provider>
    );
};
