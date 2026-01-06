import React from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import SEO from '../components/SEO';
import '../styles/Blog.css';

const Blog = () => {
    const { posts, loading } = useBlog();

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page blog">
            <SEO
                title="Journal - Luxury Real Estate Insights"
                description="Read the latest insights, trends, and stories from the world of luxury real estate in Andalusia."
            />
            <div className="blog-hero">
                <div className="container">
                    <h1>Journal</h1>
                    <p>Insights, trends, and stories from the world of luxury real estate.</p>
                </div>
            </div>

            <div className="container blog-content">
                {posts.length > 0 ? (
                    <div className="blog-grid">
                        {posts.map(post => (
                            <article key={post.id} className="blog-card">
                                <div className="blog-image">
                                    <img src={post.image || 'https://via.placeholder.com/800x600?text=No+Image'} alt={post.title} />
                                </div>
                                <div className="blog-content">
                                    <div className="blog-date">{new Date(post.published_at).toLocaleDateString()}</div>
                                    <h3 className="blog-title">{post.title}</h3>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <Link to={`/blog/${post.id}`} className="read-more">Read Article</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <p>No articles published yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
