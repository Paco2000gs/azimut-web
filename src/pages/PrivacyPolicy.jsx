import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import '../styles/Legal.css';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Política de privacidad", "item": "https://www.azimutproperty.com/privacy" }
        ]
    };

    return (
        <div className="page privacy-policy">
            <SEO title="Política de privacidad" description="Política de privacidad de Azimut Property. Conozca cómo tratamos sus datos personales conforme al RGPD." url="/privacy" lang="es" />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
            <div className="container legal-page">
                <div className="legal-content">
                <h1>Política de privacidad</h1>
                <p className="legal-updated">Última actualización: 1 de diciembre de 2025</p>

                <section>
                    <h2>1. Introducción</h2>
                    <p>Bienvenido a AzimutProperty. Respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política de privacidad le informa sobre cómo tratamos sus datos personales cuando visita nuestra web (desde el lugar desde el que lo haga) y le explica sus derechos de privacidad y cómo le protege la ley.</p>
                </section>

                <section>
                    <h2>2. Datos que recogemos</h2>
                    <p>Podemos recoger, usar, almacenar y transferir distintas categorías de datos personales sobre usted, que agrupamos de la siguiente manera:</p>
                    <ul>
                        <li><strong>Datos de identidad:</strong> incluyen nombre y apellidos.</li>
                        <li><strong>Datos de contacto:</strong> incluyen la dirección de correo electrónico y el número de teléfono.</li>
                        <li><strong>Datos técnicos:</strong> incluyen la dirección IP, el tipo y la versión del navegador, la configuración de zona horaria y la ubicación.</li>
                        <li><strong>Datos de uso:</strong> incluyen información sobre cómo utiliza nuestra web y nuestros servicios.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Cómo usamos sus datos</h2>
                    <p>Solo usaremos sus datos personales cuando la ley lo permita. Lo más habitual es que los utilicemos en las siguientes circunstancias:</p>
                    <ul>
                        <li>Para tramitar sus consultas sobre inmuebles.</li>
                        <li>Para gestionar nuestra relación con usted.</li>
                        <li>Para mejorar nuestra web, nuestros productos y servicios, nuestras acciones de marketing y nuestras relaciones con los clientes.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Seguridad de los datos</h2>
                    <p>Hemos adoptado medidas de seguridad adecuadas para evitar que sus datos personales se pierdan de forma accidental, se usen o se acceda a ellos de forma no autorizada, se alteren o se divulguen.</p>
                </section>

                <section>
                    <h2>5. Sus derechos legales</h2>
                    <p>En determinadas circunstancias, usted tiene derechos en virtud de la normativa de protección de datos en relación con sus datos personales, incluido el derecho a solicitar el acceso, la rectificación, la supresión, la limitación, la portabilidad, a oponerse al tratamiento y, cuando la base jurídica del tratamiento sea el consentimiento, a retirarlo.</p>
                </section>

                    <section>
                        <h2>6. Contacto</h2>
                        <p>Si tiene alguna pregunta sobre esta política de privacidad o sobre nuestras prácticas de privacidad, puede escribirnos a <a href="mailto:info@azimutproperty.com">info@azimutproperty.com</a>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
