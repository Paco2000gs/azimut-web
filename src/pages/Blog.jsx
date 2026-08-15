import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBlog } from '../context/BlogContext';
import { generateBlogSlug } from '../utils/slugify';
import SEO from '../components/SEO';
import '../styles/Blog.css';

const Blog = () => {
    const { posts, loading } = useBlog();

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Journal", "item": "https://www.azimutproperty.com/blog" }
        ]
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page blog">
            <SEO
                title="Journal | Luxury Real Estate Trends & Market Insights"
                description="Latest trends, analysis and guides about the luxury real estate market in Marbella and Costa del Sol. Expert insights for buyers."
                url="/blog"
                keywords="luxury real estate blog, Marbella property market, Costa del Sol investment guide, buying property Spain"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
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
                                    <Link to={`/blog/${generateBlogSlug(post)}`} className="read-more">Read Article</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-500)' }}>
                        <p>No articles published yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
