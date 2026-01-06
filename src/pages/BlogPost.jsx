import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import SEO from '../components/SEO';
import '../styles/Blog.css';

const BlogPost = () => {
    const { id } = useParams();
    const { getPostById, loading } = useBlog();
    const [post, setPost] = useState(null);

    useEffect(() => {
        if (!loading) {
            const foundPost = getPostById(id);
            setPost(foundPost);
        }
        window.scrollTo(0, 0);
    }, [id, loading, getPostById]);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    if (!post) {
        return (
            <div className="page blog-post-page">
                <SEO title="Article Not Found" />
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h2>Article not found</h2>
                    <Link to="/blog" className="btn">Return to Journal</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page blog-post-page">
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.image}
            />
            <div className="blog-post-hero" style={{ backgroundImage: `url(${post.image || 'https://via.placeholder.com/1200x600?text=No+Image'})` }}>
                <div className="overlay"></div>
                <div className="container">
                    <Link to="/blog" className="back-link"><ArrowLeft size={20} /> Back to Journal</Link>
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span><Calendar size={16} /> {new Date(post.published_at).toLocaleDateString()}</span>
                        <span><Clock size={16} /> 5 min read</span>
                    </div>
                </div>
            </div>

            <div className="container blog-post-content">
                <div className="content-wrapper" dangerouslySetInnerHTML={{ __html: post.content }}></div>

                <div className="post-footer">
                    <Link to="/blog" className="btn btn-outline">Read More Articles</Link>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
