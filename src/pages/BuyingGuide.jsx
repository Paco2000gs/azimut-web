import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import '../styles/Guide.css';

const STEPS = [
    {
        title: 'Obtenga su NIE',
        body: `El Número de Identidad de Extranjero es el número fiscal que todo comprador extranjero necesita antes de que la compra pueda inscribirse. Puede solicitarlo en un consulado español en su país o en una comisaría en España. Empiece pronto: es el paso con más probabilidades de añadir semanas a la compra, y de él depende todo lo que viene después.`,
    },
    {
        title: 'Contrate a un abogado independiente',
        body: `No el del vendedor ni el de la agencia. Su abogado realiza las comprobaciones que determinan si una finca rústica es lo que aparenta: que los linderos de la escritura coincidan con el terreno, que las edificaciones estén legalmente inscritas, que no haya deudas vinculadas a la propiedad, y que los derechos de agua y el acceso sean reales y no meramente de costumbre.`,
    },
    {
        title: 'Contrato de reserva',
        body: `Un depósito moderado retira la propiedad del mercado mientras se realizan las comprobaciones. Suele ser de algunos miles de euros y se descuenta del precio.`,
    },
    {
        title: 'Contrato privado, el «contrato de arras»',
        body: `Normalmente, el 10 % del precio. Según el Código Civil español, la forma habitual de estos depósitos significa que un comprador que desiste lo pierde, y un vendedor que desiste devuelve el doble. Lea lo que firma: las consecuencias varían según el tipo de arras utilizado.`,
    },
    {
        title: 'Firma ante notario',
        body: `La escritura pública se firma en persona o mediante apoderado, se paga el resto del precio y las llaves cambian de manos el mismo día. El notario es un funcionario público, neutral entre las partes: verifica la identidad y la legalidad, pero no actúa en su nombre.`,
    },
    {
        title: 'Inscripción e impuestos',
        body: `Su abogado presenta los impuestos de la compra e inscribe la escritura en el Registro de la Propiedad. La inscripción es lo que hace que su titularidad sea oponible frente a terceros.`,
    },
    {
        title: 'Suministros y puesta en marcha del inmueble',
        body: `Agua, electricidad, residuos y, en una finca, lo que requiera el propio terreno: una licencia de pozo, la inscripción en el registro agrícola, un guarda. Es el paso que más subestiman los compradores de propiedades rurales.`,
    },
];

const COSTS = [
    ['Impuesto de transmisiones patrimoniales (ITP) en vivienda de segunda mano', 'Andalucía aplica un tipo autonómico fijo. Confirme la cifra vigente con su abogado antes de presupuestar.'],
    ['IVA y AJD en obra nueva', 'La compra de obra nueva tributa de otra forma: IVA más impuesto de actos jurídicos documentados, en lugar de ITP.'],
    ['Notaría y registro de la propiedad', 'Se fijan según aranceles oficiales y dependen del precio y de la complejidad de la escritura.'],
    ['Honorarios de abogado', 'Habitualmente alrededor del 1 % del precio, a veces una tarifa fija en compras de mayor importe.'],
    ['Peritaje y comprobaciones técnicas', 'Opcional y, en una finca con edificaciones antiguas, el dinero mejor invertido.'],
];

const BuyingGuide = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: '¿Puede un extranjero no residente comprar un inmueble en España?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí. No existe ninguna restricción para que los extranjeros compren inmuebles en España, sean o no residentes. Necesita un número de identificación fiscal español (NIE) antes de que la compra pueda inscribirse.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Comprar un inmueble en España da derecho a residencia?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. España puso fin en 2025 a la ruta de residencia por inversión inmobiliaria del visado dorado. Comprar un inmueble ya no concede un permiso de residencia, y cualquier guía que diga lo contrario está desactualizada.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cuánto tarda la compra de un inmueble en España?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Lo habitual es de dos a tres meses desde la oferta aceptada hasta la firma. Obtener el NIE, gestionar la financiación o resolver irregularidades en la inscripción de edificaciones rurales son los motivos más frecuentes de retraso.',
                },
            },
        ],
    };

    return (
        <div className="page guide-page">
            <SEO
                title="Comprar inmueble en España: guía para compradores no residentes | Azimut Property"
                description="Lo que necesita saber un comprador extranjero antes de adquirir una finca en Andalucía: el NIE, la notaría, los impuestos de compra, los plazos y las comprobaciones que importan en una propiedad rural."
                url="/buying-guide"
                lang="es"
                keywords="comprar inmueble en España siendo extranjero, número NIE, impuesto compraventa inmueble España, comprar finca en Andalucía, compra de inmueble no residente España"
            />
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>

            <div className="container guide-container">
                <header className="guide-header">
                    <h1>Comprar en España siendo no residente</h1>
                    <p className="guide-standfirst">
                        Nada de esto es difícil. Simplemente es desconocido, y lo desconocido es
                        donde se pierde dinero. Esta es la secuencia que sigue realmente una compra
                        en Andalucía, lo que cuesta más allá del precio de venta y las comprobaciones
                        que pesan más en una finca rústica que en un piso.
                    </p>
                </header>

                <section className="guide-section">
                    <h2>La respuesta corta</h2>
                    <p>
                        Un comprador extranjero, sea o no residente, puede adquirir inmuebles en
                        España sin restricciones. Necesitará un número de identificación fiscal
                        español, un abogado independiente y, aproximadamente, entre un diez y un
                        doce por ciento sobre el precio para cubrir impuestos y gastos. Desde la
                        oferta aceptada hasta la entrega de llaves suele haber de dos a tres meses.
                    </p>
                    <p>
                        Hay un cambio que conviene decir claramente, porque buena parte de los
                        consejos publicados aún no lo recogen: <strong>comprar un inmueble en España
                        ya no concede residencia</strong>. La ruta del visado dorado se cerró en
                        2025. Aquí el inmueble es un activo, no una estrategia migratoria.
                    </p>
                </section>

                <section className="guide-section">
                    <h2>Los siete pasos</h2>
                    <ol className="guide-steps">
                        {STEPS.map((step, index) => (
                            <li key={step.title}>
                                <span className="guide-step-index" aria-hidden="true">{index + 1}</span>
                                <div>
                                    <h3>{step.title}</h3>
                                    <p>{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="guide-section">
                    <h2>Lo que cuesta además del precio</h2>
                    <p>
                        Presupueste entre un diez y un doce por ciento del precio de compra para una
                        vivienda de segunda mano en Andalucía. Los tipos los fijan las comunidades
                        autónomas y cambian, así que trate la lista siguiente como la estructura de
                        la factura y no como la factura en sí.
                    </p>
                    <dl className="guide-costs">
                        {COSTS.map(([term, detail]) => (
                            <div className="guide-cost" key={term}>
                                <dt>{term}</dt>
                                <dd>{detail}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className="guide-section">
                    <h2>Lo que exige una finca y una villa no</h2>
                    <p>
                        Una finca se compra por su terreno, y el terreno plantea preguntas que una
                        parcela edificada nunca suscita. Si la superficie registrada coincide con lo
                        que está vallado. Si la casa de labor, el almacén y la piscina están todos
                        declarados. Si el agua es un derecho legal o la cortesía del vecino. Si el
                        camino de acceso es público, privado con servidumbre inscrita, o ninguna de
                        las dos cosas.
                    </p>
                    <p>
                        Ninguna de estas cuestiones es inusual, y ninguna es un obstáculo insalvable
                        cuando se detecta a tiempo. Solo resultan costosas cuando aparecen después de
                        la firma.
                    </p>
                </section>

                <section className="guide-section">
                    <h2>Una vez que es suyo</h2>
                    <p>
                        Un propietario no residente presenta una declaración anual sobre el inmueble
                        aunque no esté alquilado, paga el impuesto municipal sobre bienes inmuebles y
                        puede estar sujeto al impuesto sobre el patrimonio según el valor que posea en
                        España. Su abogado o un gestor suelen encargarse de esto con una pequeña
                        minuta anual.
                    </p>
                    <p>
                        Si su dinero no está en euros, el tipo de cambio se moverá más que cualquier
                        comisión de agencia. En una compra de este tamaño, hable con un bróker de
                        divisas antes de firmar el contrato privado, no después.
                    </p>
                </section>

                <p className="guide-disclaimer">
                    Esta guía ofrece información general sobre cómo funcionan las compraventas de
                    inmuebles en Andalucía. No constituye asesoramiento jurídico ni fiscal, los tipos
                    y las normas cambian, y su situación puede ser diferente. Consulte con un abogado
                    independiente y con un asesor fiscal antes de comprometerse con una compra.
                </p>

                <div className="guide-cta">
                    <h2>Háganos la pregunta concreta</h2>
                    <p>
                        Trabajamos con un número reducido de compradores a la vez, así que la
                        respuesta que recibe se refiere a su compra y no a las compras en general.
                    </p>
                    <div className="guide-cta-actions">
                        <Link to="/contact" className="btn btn-gold">Hable con nosotros</Link>
                        <Link to="/venta" className="btn btn-secondary">Ver la cartera</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyingGuide;
