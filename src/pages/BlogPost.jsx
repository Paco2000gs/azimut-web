import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { generateBlogSlug, extractBlogId } from '../utils/slugify';
import { formatBlogContent, calculateReadingTime } from '../utils/formatBlogContent';
import SEO from '../components/SEO';
import { detectLang } from '../utils/detectLang';
import '../styles/Blog.css';

const BlogPost = () => {
    const { id: urlParam } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { getPostById, loading } = useBlog();

    const postId = extractBlogId(urlParam);
    const post = !loading && postId ? getPostById(postId) : null;

    // Procesar contenido automáticamente: texto plano → HTML estructurado
    const formattedContent = useMemo(() => {
        if (!post?.content) return '';
        return formatBlogContent(post.content);
    }, [post?.content]);

    // Calcular tiempo de lectura real basado en el contenido
    const readingTime = useMemo(() => {
        if (!post?.content) return 1;
        return calculateReadingTime(post.content);
    }, [post?.content]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [urlParam]);

    // Redirect old numeric URLs or wrong slugs to canonical slug
    useEffect(() => {
        if (post) {
            const canonicalSlug = generateBlogSlug(post);
            if (urlParam !== canonicalSlug) {
                navigate(`/blog/${canonicalSlug}`, { replace: true });
            }
        }
    }, [post, urlParam, navigate]);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    // Same reasoning as the not-found branch in PropertyDetail: BlogContext also
    // swallows a failed query and leaves `posts` empty, so this renders on a network
    // failure as well as on a genuinely missing article. Declaring noindex plus a
    // home-page canonical here would let one bad fetch inside Googlebot's renderer
    // undo the prerendered tags for an article that is perfectly fine.
    if (!post) {
        return (
            <div className="page blog-post-page">
                <SEO title="Article Not Found" url={pathname} lang="en" />
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
                url={`/blog/${generateBlogSlug(post)}`}
                type="article"
                lang={detectLang(`${post.title} ${post.excerpt || ''}`)}
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
                            "@id": `https://www.azimutproperty.com/blog/${generateBlogSlug(post)}`
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
                            { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://www.azimutproperty.com/blog/${generateBlogSlug(post)}` }
                        ]
                    })}
                </script>
            </Helmet>

            {/* Hero del artículo */}
            <div className="blog-post-hero" style={{ backgroundImage: `url(${post.image || '/media/placeholder.svg'})` }}>
                <div className="overlay"></div>
                <div className="container">
                    <Link to="/blog" className="back-link"><ArrowLeft size={20} /> Back to Journal</Link>
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span><Calendar size={16} /> {new Date(post.published_at).toLocaleDateString()}</span>
                        <span><Clock size={16} /> {readingTime} min read</span>
                    </div>
                </div>
            </div>

            {/* Contenido del artículo — renderizado estructurado */}
            <article className="container blog-post-content">
                <div
                    className="content-wrapper article-body"
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                />

                <div className="post-footer">
                    <Link to="/blog" className="btn btn-outline">Read More Articles</Link>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
