import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
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
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.azimutproperty.com/blog" }
        ]
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page blog">
            <SEO
                title="Blog: mercado inmobiliario de lujo en Andalucía | Azimut Property"
                description="Tendencias, análisis y guías sobre el mercado inmobiliario de lujo en Marbella, la Costa del Sol y Andalucía. Conocimiento experto para compradores."
                url="/blog"
                lang="es"
                keywords="blog inmobiliario de lujo, mercado inmobiliario Marbella, guía de inversión Costa del Sol, comprar inmueble en España"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
            <div className="blog-hero">
                <div className="container">
                    <h1>Blog</h1>
                    <p>Análisis, tendencias e historias del mercado inmobiliario de lujo.</p>
                </div>
            </div>

            <div className="container blog-content">
                {posts.length > 0 ? (
                    <div className="blog-grid">
                        {posts.map(post => (
                            <article key={post.id} className="blog-card">
                                <div className="blog-image">
                                    <img src={getOptimizedImageUrl(post.image, { width: 400 })} alt={post.title} loading="lazy" decoding="async" />
                                </div>
                                <div className="blog-content">
                                    <div className="blog-date">{new Date(post.published_at).toLocaleDateString()}</div>
                                    <h3 className="blog-title">{post.title}</h3>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <Link to={`/blog/${generateBlogSlug(post)}`} className="read-more">Leer artículo</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-500)' }}>
                        <p>Todavía no hay artículos publicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
