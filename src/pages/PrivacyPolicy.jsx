import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import '../styles/Home.css'; // Reusing general styles

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page privacy-policy">
            <SEO title="Privacy Policy" description="Privacy policy of Azimut Property. Learn how we handle your personal data." url="/privacy" />
            <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: December 1, 2025</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>1. Introduction</h2>
                    <p>Welcome to AzimutProperty. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>2. Data We Collect</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                    <ul>
                        <li><strong>Identity Data:</strong> includes first name, last name.</li>
                        <li><strong>Contact Data:</strong> includes email address and telephone number.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>3. How We Use Your Data</h2>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul>
                        <li>To process your inquiries about properties.</li>
                        <li>To manage our relationship with you.</li>
                        <li>To improve our website, products/services, marketing and customer relationships.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>4. Data Security</h2>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>5. Your Legal Rights</h2>
                    <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>6. Contact Us</h2>
                    <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: info@azimutproperty.com</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
