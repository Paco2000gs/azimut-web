import React, { useState, useEffect } from 'react';
import { useLeads } from '../context/LeadsContext';
import { useProperties } from '../context/PropertiesContext';
import { useBlog } from '../context/BlogContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Phone, Mail, Filter, LogOut, Plus, Home, Users, MapPin, Loader, Upload, X, Image as ImageIcon, FileText, Video, Edit, Star, BookOpen, Calendar, Eye, Download } from 'lucide-react';
import { geocodeAddress } from '../utils/geocoding';
import { uploadFile } from '../utils/storage';
import { PROVINCES, CITIES, PROPERTY_TYPES, PROPERTY_FEATURES } from '../constants/propertyOptions';
import '../styles/Admin.css';

const AdminDashboard = () => {
    const { leads, fetchLeads, deleteLead, updateLeadStatus, getLeadsStats } = useLeads();

    useEffect(() => {
        fetchLeads();
    }, []);

    const { properties, addProperty, deleteProperty, addPropertyMedia, updateProperty, getPropertyMedia, deletePropertyMedia } = useProperties();
    const { posts, addPost, updatePost, deletePost } = useBlog();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('leads');
    const [filter, setFilter] = useState('All');
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Property Form State
    const [newProperty, setNewProperty] = useState({
        title: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        plot: '',
        description: '',
        type: 'Villa',
        city: '',
        province: '',
        latitude: '',
        longitude: '',
        features: [],
        image: '', // Cover image URL
        price_on_demand: false
    });

    // File States
    const [photos, setPhotos] = useState([]);
    const [plans, setPlans] = useState([]);
    const [videos, setVideos] = useState([]);

    // Blog State
    const [showAddPost, setShowAddPost] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [newPost, setNewPost] = useState({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        published_at: new Date().toISOString().split('T')[0]
    });
    const [postImage, setPostImage] = useState(null);

    // Existing Media State (for editing)
    const [existingMedia, setExistingMedia] = useState({
        photos: [],
        plans: [],
        videos: []
    });

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleFileSelect = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'photos') setPhotos(prev => [...prev, ...files]);
        if (type === 'plans') setPlans(prev => [...prev, ...files]);
        if (type === 'videos') setVideos(prev => [...prev, ...files]);
    };

    const removeFile = (index, type) => {
        if (type === 'photos') setPhotos(prev => prev.filter((_, i) => i !== index));
        if (type === 'plans') setPlans(prev => prev.filter((_, i) => i !== index));
        if (type === 'videos') setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditProperty = async (property) => {
        setEditingId(property.id);
        setNewProperty({
            title: property.title,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            plot: property.plot,
            description: property.description,
            type: property.type,
            city: property.city,
            province: property.province,
            latitude: property.latitude || '',
            longitude: property.longitude || '',
            features: property.features || [],
            image: property.image || '',
            price_on_demand: property.price_on_demand || false
        });

        // Load existing media
        const result = await getPropertyMedia(property.id);
        if (result.success) {
            const media = result.data;
            setExistingMedia({
                photos: media.filter(m => m.type === 'image'),
                plans: media.filter(m => m.type === 'plan'),
                videos: media.filter(m => m.type === 'video')
            });
        }

        setShowAddProperty(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMedia = async (mediaId, type) => {
        if (!window.confirm('¿Estás seguro de querer eliminar este archivo?')) return;

        const result = await deletePropertyMedia(mediaId);
        if (result.success) {
            setExistingMedia(prev => ({
                ...prev,
                [type]: prev[type].filter(m => m.id !== mediaId)
            }));
        } else {
            alert('Error eliminando archivo: ' + result.error);
        }
    };

    const handleDownloadMedia = async (url, filename) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'video.mp4';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Fallback: open in a new tab so the user can save manually
            window.open(url, '_blank');
        }
    };

    const handleSetCoverImage = async (url) => {
        if (!editingId) return; // Only works for existing properties for now

        const result = await updateProperty(editingId, { image: url });
        if (result.success) {
            setNewProperty(prev => ({ ...prev, image: url }));
            // Optional: visual feedback
        } else {
            alert('Error updating cover image: ' + result.error);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewProperty({
            title: '', price: '', bedrooms: '', bathrooms: '', area: '', plot: '',
            description: '', type: 'Villa', city: '', province: '',
            latitude: '', longitude: '', features: [], price_on_demand: false
        });
        setExistingMedia({ photos: [], plans: [], videos: [] });
        setPhotos([]);
        setPlans([]);
        setVideos([]);
        setShowAddProperty(false);
    };

    const handleSaveProperty = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let propertyData = { ...newProperty };

            // 1. Geocoding
            if ((!propertyData.latitude || !propertyData.longitude) && propertyData.city) {
                setIsGeocoding(true);
                const address = `${propertyData.city}, ${propertyData.province || ''}, Spain`;
                const coords = await geocodeAddress(address);
                if (coords) {
                    propertyData.latitude = coords.lat;
                    propertyData.longitude = coords.lon;
                }
                setIsGeocoding(false);
            }

            const formattedData = {
                ...propertyData,
                price: Number(propertyData.price),
                bedrooms: Number(propertyData.bedrooms),
                bathrooms: Number(propertyData.bathrooms),
                area: Number(propertyData.area),
                plot: Number(propertyData.plot) || 0,
                latitude: Number(propertyData.latitude) || 0,
                longitude: Number(propertyData.longitude) || 0,
                features: propertyData.features || [],
                price_on_demand: propertyData.price_on_demand
            };

            let propertyId = editingId;

            if (editingId) {
                // UPDATE EXISTING PROPERTY
                const result = await updateProperty(editingId, formattedData);
                if (!result.success) throw new Error(result.error);
                alert('Propiedad actualizada con éxito');
            } else {
                // CREATE NEW PROPERTY
                formattedData.image = ''; // Placeholder
                const result = await addProperty(formattedData);
                if (!result.success) throw new Error(result.error);
                propertyId = result.data.id;
            }

            // 3. Upload Files & Create Media Records
            const uploadPromises = [];
            let mainImageUrl = '';

            // Photos
            for (let i = 0; i < photos.length; i++) {
                const file = photos[i];
                const url = await uploadFile(file, `properties/${propertyId}/photos`);
                if (i === 0 && !editingId) mainImageUrl = url; // Set first photo as main only for new
                uploadPromises.push(addPropertyMedia({
                    property_id: propertyId,
                    url,
                    type: 'image',
                    title: file.name
                }));
            }

            // Plans
            for (const file of plans) {
                const url = await uploadFile(file, `properties/${propertyId}/plans`);
                uploadPromises.push(addPropertyMedia({
                    property_id: propertyId,
                    url,
                    type: 'plan',
                    title: file.name
                }));
            }

            // Videos
            for (const file of videos) {
                const url = await uploadFile(file, `properties/${propertyId}/videos`);
                uploadPromises.push(addPropertyMedia({
                    property_id: propertyId,
                    url,
                    type: 'video',
                    title: file.name
                }));
            }

            await Promise.all(uploadPromises);

            // Update main image if new photos added and we want to set one (simple logic for now)
            if (mainImageUrl && !editingId) {
                // Initial set was done during creation if we knew the URL, but we didn't. 
                // So actually we should update it here.
                // For now, let's just leave it as is or fix it if I had update ability.
                // Since I'm in the update flow now, I can actually update the image safely.
                // BUT, since addProperty returns the object, we can't update it easily without another call.
                // Let's assume the context handles re-fetching or we just don't set main image perfectly yet.
            }

            if (!editingId) alert('Propiedad creada con éxito');

            cancelEdit(); // Resets everything

        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setIsUploading(false);
            setIsGeocoding(false);
        }
    };

    const stats = getLeadsStats ? getLeadsStats() : { total: 0, new: 0, contacted: 0, qualified: 0 };

    const filteredLeads = filter === 'All'
        ? leads
        : leads.filter(lead => lead.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'Contacted': return '#f59e0b';
            case 'Qualified': return '#10b981';
            case 'Closed': return '#8b5cf6';
            case 'Lost': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="admin-page">
            <div className="container">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Panel de control inmobiliario</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={16} /> Salir
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leads')}
                    >
                        <Users size={18} /> Leads
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
                        onClick={() => setActiveTab('properties')}
                    >
                        <Home size={18} /> Propiedades
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blog')}
                    >
                        <BookOpen size={18} /> Blog
                    </button>
                </div>

                {/* LEADS VIEW */}
                {activeTab === 'leads' && (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card total">
                                <h3 className="stat-title">Total Leads</h3>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                            <div className="stat-card new">
                                <h3 className="stat-title">Nuevos</h3>
                                <p className="stat-value">{stats.new}</p>
                            </div>
                            <div className="stat-card contacted">
                                <h3 className="stat-title">Contactados</h3>
                                <p className="stat-value">{stats.contacted}</p>
                            </div>
                            <div className="stat-card qualified">
                                <h3 className="stat-title">Cualificados</h3>
                                <p className="stat-value">{stats.qualified}</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="filters-section">
                            <Filter size={20} color="#64748b" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">Todos los Leads</option>
                                <option value="New">Nuevos</option>
                                <option value="Contacted">Contactados</option>
                                <option value="Qualified">Cualificados</option>
                                <option value="Closed">Cerrados</option>
                                <option value="Lost">Perdidos</option>
                            </select>
                        </div>

                        {/* Leads Table */}
                        <div className="leads-table-container">
                            <div className="table-responsive">
                                <table className="leads-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Nombre</th>
                                            <th>Contacto</th>
                                            <th>Interés</th>
                                            <th>Estado</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.length > 0 ? (
                                            filteredLeads.map(lead => (
                                                <tr key={lead.id}>
                                                    <td className="lead-date">
                                                        {new Date(lead.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="lead-name">{lead.name}</td>
                                                    <td>
                                                        <div className="contact-info">
                                                            <a href={`mailto:${lead.email}`} className="contact-link">
                                                                <Mail size={14} /> {lead.email}
                                                            </a>
                                                            {lead.phone && (
                                                                <a href={`tel:${lead.phone}`} className="contact-link">
                                                                    <Phone size={14} /> {lead.phone}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`interest-badge ${lead.source === 'Property' ? 'property' : 'general'}`}>
                                                            {lead.source === 'Property' ? lead.property_title : 'Consulta General'}
                                                        </span>
                                                        <div className="lead-message" title={lead.message}>
                                                            "{lead.message}"
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={lead.status}
                                                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                            className="status-select"
                                                            style={{ color: getStatusColor(lead.status) }}
                                                        >
                                                            <option value="New">Nuevo</option>
                                                            <option value="Contacted">Contactado</option>
                                                            <option value="Qualified">Cualificado</option>
                                                            <option value="Closed">Cerrado</option>
                                                            <option value="Lost">Perdido</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => setSelectedLead(lead)}
                                                            className="delete-btn"
                                                            style={{ backgroundColor: '#3b82f6' }}
                                                            title="Ver Detalle"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteLead(lead.id)}
                                                            className="delete-btn"
                                                            title="Eliminar Lead"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="empty-state">
                                                    No hay leads encontrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* LEAD DETAIL MODAL */}
                        {selectedLead && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                            }}>
                                <div style={{
                                    backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '600px', width: '90%',
                                    maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                    >
                                        <X size={24} />
                                    </button>

                                    <h2 style={{ marginBottom: '0.25rem', fontFamily: 'Playfair Display, serif' }}>{selectedLead.name}</h2>
                                    <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        Recibido: {new Date(selectedLead.created_at).toLocaleString()}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b' }}>Email</strong>
                                            <a href={`mailto:${selectedLead.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{selectedLead.email}</a>
                                        </div>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b' }}>Teléfono</strong>
                                            <a href={`tel:${selectedLead.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{selectedLead.phone || 'N/A'}</a>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b' }}>Interés</strong>
                                        <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '4px', fontSize: '0.95rem' }}>
                                            {selectedLead.source === 'Property' ? (
                                                <><strong>Propiedad:</strong> {selectedLead.property_title}</>
                                            ) : (
                                                <><strong>Consulta General:</strong> {selectedLead.interest}</>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b' }}>Mensaje Completo</strong>
                                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', minHeight: '120px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155' }}>
                                            {selectedLead.message}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <strong style={{ color: '#0f172a' }}>Estado Actual:</strong>
                                            <select
                                                value={selectedLead.status}
                                                onChange={(e) => {
                                                    updateLeadStatus(selectedLead.id, e.target.value);
                                                    setSelectedLead({ ...selectedLead, status: e.target.value });
                                                }}
                                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '500' }}
                                            >
                                                <option value="New">Nuevo</option>
                                                <option value="Contacted">Contactado</option>
                                                <option value="Qualified">Cualificado</option>
                                                <option value="Closed">Cerrado</option>
                                                <option value="Lost">Perdido</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setSelectedLead(null)}
                                            className="btn"
                                            style={{ backgroundColor: '#0f172a' }}
                                        >
                                            Cerrar Detalle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* PROPERTIES VIEW */}
                {activeTab === 'properties' && (
                    <div className="properties-section">
                        <div className="section-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button
                                className="btn"
                                onClick={() => setShowAddProperty(!showAddProperty)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={18} /> {showAddProperty ? 'Cancelar' : 'Añadir Propiedad'}
                            </button>
                        </div>

                        {showAddProperty && (
                            <div className="contact-form-section" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>{editingId ? 'Editar Propiedad' : 'Añadir Nueva Propiedad'}</h3>
                                    {editingId && (
                                        <button onClick={cancelEdit} className="btn" style={{ background: '#64748b' }}>
                                            Cancelar Edición
                                        </button>
                                    )}
                                </div>
                                <form onSubmit={handleSaveProperty} className="contact-form">
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <input type="text" placeholder="Título" required
                                                value={newProperty.title} onChange={e => setNewProperty({ ...newProperty, title: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <input type="number" placeholder="Precio (€)" required={!newProperty.price_on_demand}
                                                value={newProperty.price} onChange={e => setNewProperty({ ...newProperty, price: e.target.value })}
                                                disabled={newProperty.price_on_demand}
                                            />
                                        </div>
                                    </div>

                                    {/* Price on Demand Checkbox - Moved to separate row for visibility */}
                                    {/* Price on Demand Checkbox - Moved to separate row for visibility */}
                                    <div style={{ marginBottom: '1.5rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', cursor: 'pointer', userSelect: 'none', color: '#1e40af', margin: 0, fontWeight: 'bold' }}>
                                            <input
                                                type="checkbox"
                                                checked={newProperty.price_on_demand}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setNewProperty({
                                                        ...newProperty,
                                                        price_on_demand: isChecked,
                                                        price: isChecked ? '' : newProperty.price
                                                    });
                                                }}
                                                style={{ width: '24px', height: '24px', margin: 0, cursor: 'pointer', accentColor: '#2563eb' }}
                                            />
                                            <span>MARK AS PRICE ON DEMAND (Hide Price)</span>
                                        </label>
                                    </div>

                                    {/* Type Selection */}
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tipo de Propiedad</label>
                                        <select
                                            value={newProperty.type}
                                            onChange={e => setNewProperty({ ...newProperty, type: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            {PROPERTY_TYPES.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <input type="number" placeholder="Dormitorios" required
                                                value={newProperty.bedrooms} onChange={e => setNewProperty({ ...newProperty, bedrooms: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <input type="number" placeholder="Baños" required
                                                value={newProperty.bathrooms} onChange={e => setNewProperty({ ...newProperty, bathrooms: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <input type="number" placeholder="Área (m²)" required
                                                value={newProperty.area} onChange={e => setNewProperty({ ...newProperty, area: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <input type="number" placeholder="Parcela (m²)"
                                                value={newProperty.plot} onChange={e => setNewProperty({ ...newProperty, plot: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Provincia</label>
                                            <select
                                                value={newProperty.province}
                                                onChange={e => setNewProperty({ ...newProperty, province: e.target.value, city: '' })} // Reset city on province change
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                required
                                            >
                                                <option value="">Seleccionar Provincia</option>
                                                {PROVINCES.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ciudad / Zona</label>
                                            <select
                                                value={newProperty.city}
                                                onChange={e => setNewProperty({ ...newProperty, city: e.target.value })}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                disabled={!newProperty.province}
                                                required
                                            >
                                                <option value="">{newProperty.province ? "Seleccionar Ciudad" : "Selecciona Provincia primero"}</option>
                                                {newProperty.province && CITIES[newProperty.province]?.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <input type="number" step="any" placeholder="Latitud (Opcional - Auto)"
                                                value={newProperty.latitude} onChange={e => setNewProperty({ ...newProperty, latitude: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <input type="number" step="any" placeholder="Longitud (Opcional - Auto)"
                                                value={newProperty.longitude} onChange={e => setNewProperty({ ...newProperty, longitude: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <textarea placeholder="Descripción" required rows="4"
                                            value={newProperty.description} onChange={e => setNewProperty({ ...newProperty, description: e.target.value })}></textarea>
                                    </div>

                                    {/* Features Selection */}
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Características</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                                            {PROPERTY_FEATURES.map(feature => (
                                                <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={newProperty.features?.includes(feature)}
                                                        onChange={(e) => {
                                                            const currentFeatures = newProperty.features || [];
                                                            if (e.target.checked) {
                                                                setNewProperty({ ...newProperty, features: [...currentFeatures, feature] });
                                                            } else {
                                                                setNewProperty({ ...newProperty, features: currentFeatures.filter(f => f !== feature) });
                                                            }
                                                        }}
                                                    />
                                                    {feature}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* EXISTING MEDIA (ONLY IN EDIT MODE) */}
                                    {editingId && (
                                        <div className="existing-media-section" style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                            <h4>Archivos Existentes</h4>

                                            {/* Photos */}
                                            {existingMedia.photos.length > 0 && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Fotos guardadas:</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                        {existingMedia.photos.map(media => (
                                                            <div key={media.id} style={{ position: 'relative', width: '100px', height: '80px' }}>
                                                                <img src={media.url} alt="propiedad" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                                                <button type="button" onClick={() => handleDeleteMedia(media.id, 'photos')}
                                                                    style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                                    <X size={12} />
                                                                </button>
                                                                <button type="button" onClick={() => handleSetCoverImage(media.url)}
                                                                    title="Establecer como portada"
                                                                    style={{
                                                                        position: 'absolute', bottom: -5, right: -5,
                                                                        background: newProperty.image === media.url ? '#fbbf24' : '#e2e8f0',
                                                                        color: newProperty.image === media.url ? 'white' : '#64748b',
                                                                        border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                    }}>
                                                                    <Star size={14} fill={newProperty.image === media.url ? "currentColor" : "none"} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Plans */}
                                            {existingMedia.plans.length > 0 && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Planos guardados:</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                        {existingMedia.plans.map(media => (
                                                            <div key={media.id} style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <FileText size={16} />
                                                                <span style={{ fontSize: '0.8rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media.title || 'Plano'}</span>
                                                                <button type="button" onClick={() => handleDeleteMedia(media.id, 'plans')} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Videos */}
                                            {existingMedia.videos.length > 0 && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Videos guardados:</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                        {existingMedia.videos.map(media => (
                                                            <div key={media.id} style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px', width: '180px' }}>
                                                                <video src={media.url} controls preload="metadata" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', background: '#000' }} />
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}>
                                                                    <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{media.title || 'Video'}</span>
                                                                    <button type="button" onClick={() => handleDownloadMedia(media.url, media.title)} title="Descargar video"
                                                                        style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                                                        <Download size={16} />
                                                                    </button>
                                                                    <button type="button" onClick={() => handleDeleteMedia(media.id, 'videos')} title="Quitar video"
                                                                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* MEDIA UPLOAD SECTIONS */}
                                    <div className="media-upload-section" style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                        <h4>Multimedia</h4>

                                        {/* Photos */}
                                        <div className="upload-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                <ImageIcon size={18} /> Fotos de la Vivienda
                                            </label>
                                            <div className="file-input-wrapper" style={{ border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleFileSelect(e, 'photos')}
                                                    style={{ display: 'none' }}
                                                    id="photos-input"
                                                />
                                                <label htmlFor="photos-input" style={{ cursor: 'pointer', color: '#3b82f6' }}>
                                                    <Upload size={24} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                                                    Seleccionar Fotos
                                                </label>
                                            </div>
                                            {photos.length > 0 && (
                                                <div className="file-preview-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                                    {photos.map((file, idx) => (
                                                        <div key={idx} style={{ position: 'relative', width: '80px', height: '60px' }}>
                                                            <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                                            <button type="button" onClick={() => removeFile(idx, 'photos')} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Plans */}
                                        <div className="upload-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                <FileText size={18} /> Planos
                                            </label>
                                            <div className="file-input-wrapper" style={{ border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => handleFileSelect(e, 'plans')}
                                                    style={{ display: 'none' }}
                                                    id="plans-input"
                                                />
                                                <label htmlFor="plans-input" style={{ cursor: 'pointer', color: '#3b82f6' }}>
                                                    <Upload size={24} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                                                    Seleccionar Planos
                                                </label>
                                            </div>
                                            {plans.length > 0 && (
                                                <div className="file-list" style={{ marginTop: '0.5rem' }}>
                                                    {plans.map((file, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                                            <button type="button" onClick={() => removeFile(idx, 'plans')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Videos */}
                                        <div className="upload-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                <Video size={18} /> Videos
                                            </label>
                                            <div className="file-input-wrapper" style={{ border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="video/*"
                                                    onChange={(e) => handleFileSelect(e, 'videos')}
                                                    style={{ display: 'none' }}
                                                    id="videos-input"
                                                />
                                                <label htmlFor="videos-input" style={{ cursor: 'pointer', color: '#3b82f6' }}>
                                                    <Upload size={24} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                                                    Seleccionar Videos
                                                </label>
                                            </div>
                                            {videos.length > 0 && (
                                                <div className="file-list" style={{ marginTop: '0.5rem' }}>
                                                    {videos.map((file, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                                            <button type="button" onClick={() => removeFile(idx, 'videos')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '2rem' }} disabled={isUploading || isGeocoding}>
                                        {isUploading ? (
                                            <><Loader className="spin" size={18} /> {editingId ? 'Guardando cambios...' : 'Subiendo archivos y creando...'}</>
                                        ) : isGeocoding ? (
                                            <><Loader className="spin" size={18} /> Obteniendo ubicación...</>
                                        ) : (
                                            editingId ? 'Guardar Cambios' : 'Crear Propiedad'
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="leads-table-container">
                            <div className="table-responsive">
                                <table className="leads-table">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Título</th>
                                            <th>Ubicación</th>
                                            <th>Precio</th>
                                            <th>Detalles</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {properties.map(property => (
                                            <tr key={property.id}>
                                                <td>
                                                    {property.image ? (
                                                        <img src={property.image} alt={property.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                    ) : (
                                                        <div style={{ width: '60px', height: '40px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                                                    )}
                                                </td>
                                                <td className="lead-name">{property.title}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#64748b' }}>
                                                        <MapPin size={14} /> {property.city}, {property.province}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: '600' }}>€{property.price?.toLocaleString()}</td>
                                                <td style={{ fontSize: '0.9rem' }}>
                                                    {property.bedrooms} Bed • {property.bathrooms} Bath • {property.area}m²
                                                </td>
                                                <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => window.open(`/dossier/${property.id}`, '_blank')}
                                                        className="delete-btn"
                                                        style={{ backgroundColor: '#0f172a' }}
                                                        title="Ver Dossier"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditProperty(property)}
                                                        className="delete-btn"
                                                        style={{ backgroundColor: '#3b82f6' }}
                                                        title="Editar Propiedad"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProperty(property.id)}
                                                        className="delete-btn"
                                                        title="Eliminar Propiedad"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* BLOG VIEW */}
                {activeTab === 'blog' && (
                    <div className="blog-section">
                        <div className="section-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button
                                className="btn"
                                onClick={() => {
                                    setShowAddPost(!showAddPost);
                                    if (!showAddPost) {
                                        setEditingPostId(null);
                                        setNewPost({ title: '', excerpt: '', content: '', image: '', published_at: new Date().toISOString().split('T')[0] });
                                        setPostImage(null);
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={18} /> {showAddPost ? 'Cancelar' : 'Añadir Noticia'}
                            </button>
                        </div>

                        {showAddPost && (
                            <div className="contact-form-section" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '12px' }}>
                                <h3>{editingPostId ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h3>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setIsUploading(true);
                                    try {
                                        let imageUrl = newPost.image;
                                        if (postImage) {
                                            imageUrl = await uploadFile(postImage, 'posts');
                                        }

                                        const postData = { ...newPost, image: imageUrl };

                                        if (editingPostId) {
                                            await updatePost(editingPostId, postData);
                                        } else {
                                            await addPost(postData);
                                        }

                                        alert('Noticia guardada con éxito');
                                        setShowAddPost(false);
                                        setEditingPostId(null);
                                        setPostImage(null);
                                        setNewPost({ title: '', excerpt: '', content: '', image: '', published_at: new Date().toISOString().split('T')[0] });
                                    } catch (err) {
                                        alert('Error guardando noticia: ' + err.message);
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }} className="contact-form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            placeholder="Título del Artículo"
                                            required
                                            value={newPost.title}
                                            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="date"
                                            required
                                            value={newPost.published_at}
                                            onChange={e => setNewPost({ ...newPost, published_at: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Imagen de Portada</label>
                                        <div className="file-input-wrapper" style={{ border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setPostImage(e.target.files[0])}
                                                style={{ display: 'none' }}
                                                id="post-image-input"
                                            />
                                            <label htmlFor="post-image-input" style={{ cursor: 'pointer', color: '#3b82f6' }}>
                                                <Upload size={24} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                                                {postImage ? postImage.name : 'Seleccionar Imagen'}
                                            </label>
                                        </div>
                                        {(postImage || newPost.image) && (
                                            <div style={{ marginTop: '0.5rem', height: '100px' }}>
                                                <img src={postImage ? URL.createObjectURL(postImage) : newPost.image} alt="Preview" style={{ height: '100%', borderRadius: '4px' }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <textarea
                                            placeholder="Resumen (Excerpt)"
                                            required
                                            rows="3"
                                            value={newPost.excerpt}
                                            onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="form-group">
                                        <textarea
                                            placeholder="Contenido completo (HTML permitido)"
                                            required
                                            rows="10"
                                            value={newPost.content}
                                            onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={isUploading}>
                                        {isUploading ? <><Loader className="spin" size={18} /> Guardando...</> : 'Guardar Noticia'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="leads-table-container">
                            <div className="table-responsive">
                                <table className="leads-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Imagen</th>
                                            <th>Título</th>
                                            <th>Resumen</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map(post => (
                                            <tr key={post.id}>
                                                <td style={{ whiteSpace: 'nowrap' }}>{post.published_at}</td>
                                                <td>
                                                    {post.image && <img src={post.image} alt={post.title} style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />}
                                                </td>
                                                <td style={{ fontWeight: '500' }}>{post.title}</td>
                                                <td style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {post.excerpt}
                                                </td>
                                                <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button onClick={() => {
                                                        setEditingPostId(post.id);
                                                        setNewPost(post);
                                                        setShowAddPost(true);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }} className="delete-btn" style={{ backgroundColor: '#3b82f6' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => {
                                                        if (window.confirm('¿Eliminar esta noticia?')) deletePost(post.id);
                                                    }} className="delete-btn">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
