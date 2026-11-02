import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import '../styles/Legal.css';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Condiciones de uso", "item": "https://www.azimutproperty.com/terms" }
        ]
    };

    return (
        <div className="page terms">
            <SEO title="Condiciones de uso" description="Términos y condiciones de uso de la web de Azimut Property." url="/terms" lang="es" />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
            <div className="container legal-page">
                <div className="legal-content">
                <h1>Condiciones de uso</h1>
                <p className="legal-updated">Última actualización: 1 de diciembre de 2025</p>

                <section>
                    <h2>1. Aceptación de las condiciones</h2>
                    <p>Al acceder a nuestra web, acepta quedar vinculado por estas Condiciones de uso y cumplir todas las leyes y normativas aplicables. Si no está de acuerdo con estas condiciones, no puede utilizar ni acceder a este sitio.</p>
                </section>

                <section>
                    <h2>2. Propiedad intelectual</h2>
                    <p>El contenido, la organización, los gráficos, el diseño, la compilación y el resto de elementos relacionados con el sitio están protegidos por los derechos de autor, las marcas y otros derechos de propiedad (incluidos, entre otros, los derechos de propiedad intelectual) que sean de aplicación. Queda terminantemente prohibida la copia, redistribución, uso o publicación por su parte de cualquiera de estos elementos o de cualquier parte del sitio.</p>
                </section>

                <section>
                    <h2>3. Exención de responsabilidad</h2>
                    <p>Los materiales de la web de AzimutProperty se ofrecen «tal cual». AzimutProperty no otorga garantías, expresas o implícitas, y declara y excluye todas las demás garantías, incluidas, sin limitación, las garantías o condiciones implícitas de comerciabilidad, idoneidad para un fin determinado o no infracción de derechos de propiedad intelectual u otras vulneraciones de derechos.</p>
                </section>

                <section>
                    <h2>4. Limitaciones</h2>
                    <p>En ningún caso AzimutProperty ni sus proveedores serán responsables de los daños (incluidos, sin limitación, los daños por pérdida de datos o de beneficios, o por interrupción de la actividad) derivados del uso de los materiales de la web de AzimutProperty o de la imposibilidad de utilizarlos.</p>
                </section>

                    <section>
                        <h2>5. Legislación aplicable</h2>
                        <p>Estas condiciones se rigen e interpretan de acuerdo con las leyes de España, y usted se somete de forma irrevocable a la jurisdicción exclusiva de los tribunales de ese Estado o lugar.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
