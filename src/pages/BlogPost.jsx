import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import SEO from '../components/SEO';
import '../styles/Blog.css';

const BlogPost = () => {
    const { id } = useParams();
    const { getPostById, loading } = useBlog();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const post = !loading ? getPostById(id) : null;

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
                url={`/blog/${post.id}`}
                type="article"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "image": [post.image],
                        "datePublished": post.published_at,
                        "dateModified": post.published_at,
                        "author": {
                            "@type": "Person",
                            "name": post.author || "Azimut Property",
                            "worksFor": {
                                "@type": "RealEstateAgent",
                                "@id": "https://www.azimutproperty.com/#organization"
                            }
                        },
                        "publisher": {
                            "@type": "Organization",
                            "@id": "https://www.azimutproperty.com/#organization",
                            "name": "Azimut Property",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.azimutproperty.com/azimut-logo-gold.png"
                            }
                        },
                        "description": post.excerpt,
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://www.azimutproperty.com/blog/${post.id}`
                        }
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
                            { "@type": "ListItem", "position": 2, "name": "Journal", "item": "https://www.azimutproperty.com/blog" },
                            { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://www.azimutproperty.com/blog/${post.id}` }
                        ]
                    })}
                </script>
            </Helmet>
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
