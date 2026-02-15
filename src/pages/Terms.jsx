import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import '../styles/Home.css';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page terms">
            <SEO title="Términos de Servicio" description="Términos y condiciones de uso del sitio web Azimut Property." url="/terms" />
            <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
                <h1>Terms of Service</h1>
                <p className="last-updated">Last updated: December 1, 2025</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>1. Agreement to Terms</h2>
                    <p>By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>2. Intellectual Property</h2>
                    <p>The content, organization, graphics, design, compilation, and other matters related to the Site are protected under applicable copyrights, trademarks, and other proprietary (including but not limited to intellectual property) rights. The copying, redistribution, use or publication by you of any such matters or any part of the Site is strictly prohibited.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>3. Disclaimer</h2>
                    <p>The materials on AzimutProperty's website are provided on an 'as is' basis. AzimutProperty makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>4. Limitations</h2>
                    <p>In no event shall AzimutProperty or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AzimutProperty's website.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>5. Governing Law</h2>
                    <p>These terms and conditions are governed by and construed in accordance with the laws of Spain and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
