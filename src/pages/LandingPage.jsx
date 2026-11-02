import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import NotFound from './NotFound';
import '../styles/Home.css';

/**
 * Zone × typology landing pages (SEO audit, priorities #2 and #4).
 *
 * Each collection exists in two real, translated versions — English at
 * `/${slug}` and Spanish at `/es/${esSlug}` — paired with hreflang so Google
 * serves the right language instead of the mixed signal the audit flagged. The
 * English pages target international luxury searches; the Spanish pages target
 * the audit's Spanish keyword set (finca de lujo, mansión Sotogrande, hacienda
 * histórica, inmobiliaria de lujo Golden Triangle). The Spanish /venta province
 * pages already serve Spanish rural searches, so these add the luxury angle
 * without cannibalising them.
 *
 * `match` runs over the live portfolio, so a page shows real cards when we hold
 * stock and falls back to prose + CTA when we do not.
 */
const text = (p) => `${p.type || ''} ${p.city || ''} ${p.province || ''} ${p.location || ''} ${p.title || ''}`.toLowerCase();
const isVilla = (p) => (p.type || '').toLowerCase().includes('villa');

// UI chrome, per language. Page copy lives in each collection's en/es block.
const STR = {
    en: { consult: 'Arrange a Private Consultation', trust1: 'Off-Market Access', trust2: 'Discreet Representation', available: 'AVAILABLE NOW', other: 'Español', crumb: 'Home' },
    es: { consult: 'Concierte una Consulta Privada', trust1: 'Acceso Off-Market', trust2: 'Representación Discreta', available: 'DISPONIBLE AHORA', other: 'English', crumb: 'Inicio' },
};

const LANDINGS = {
    'villas-marbella': {
        esSlug: 'villas-de-lujo-marbella',
        match: (p) => isVilla(p) && /(marbella|benahav|estepona|nueva andaluc|sierra blanca|golden mile)/.test(text(p)),
        en: {
            eyebrow: 'Golden Triangle',
            h1: 'Luxury Villas in Marbella & the Golden Triangle',
            subhead: 'Contemporary and frontline-golf villas in Marbella, Benahavís and Estepona — many available off-market.',
            heroAlt: 'Contemporary luxury villa with pool overlooking the Marbella coastline at dusk',
            seoTitle: 'Luxury Villas for Sale in Marbella & the Golden Triangle | Azimut Property',
            seoDescription: 'Luxury villas for sale in Marbella, Benahavís and Estepona — the Golden Triangle. Contemporary, frontline-golf and sea-view villas, many off-market, for international buyers.',
            keywords: 'luxury villas Marbella, villas for sale Golden Triangle, Marbella Golden Mile villas, contemporary villas Benahavís, sea view villa Estepona, off-market villas Marbella',
            intro: [
                'Marbella and the wider Golden Triangle — Benahavís and Estepona — remain the most established address for luxury villas on the Costa del Sol. From frontline-golf residences in Nueva Andalucía and La Zagaleta to contemporary sea-view villas on the Golden Mile and Sierra Blanca, this is where design, security and long-term capital preservation meet.',
                'Azimut Property curates a select portfolio of villas across the Triangle, with privileged access to off-market listings that never reach the public portals. Whether you are buying a primary residence, a holiday home or a long-term investment, we advise international buyers end to end — from the first private viewing to due diligence and the notary.',
                'Villa buyers here prioritise privacy, panoramic views and proximity to Puerto Banús and the international schools. We match each brief to the right micro-location and move discreetly, so the most coveted properties are secured before they are ever advertised.',
            ],
            highlights: [
                { h: 'Golden Triangle focus', p: 'Marbella, Benahavís and Estepona — the Golden Mile, Sierra Blanca, Nueva Andalucía and La Zagaleta.' },
                { h: 'Off-market access', p: 'Villas held quietly by owners who never list on the public portals.' },
                { h: 'End-to-end advice', p: 'Private viewings, due diligence, NIE and the notary for international buyers.' },
            ],
            listingsHref: '/venta/marbella/villa',
            listingsCta: 'Browse Marbella villas',
        },
        es: {
            eyebrow: 'Golden Triangle',
            h1: 'Villas de Lujo en Marbella y el Golden Triangle',
            subhead: 'Villas contemporáneas y a pie de golf en Marbella, Benahavís y Estepona — muchas fuera de mercado.',
            heroAlt: 'Villa de lujo contemporánea con piscina y vistas a la costa de Marbella al atardecer',
            seoTitle: 'Villas de Lujo en Venta en Marbella y el Golden Triangle | Azimut Property',
            seoDescription: 'Villas de lujo en venta en Marbella, Benahavís y Estepona — el Golden Triangle. Villas contemporáneas, a pie de golf y con vistas al mar, muchas off-market, para compradores internacionales.',
            keywords: 'villas de lujo Marbella, inmobiliaria de lujo Golden Triangle, villa en venta Benahavís, villa vistas al mar Estepona, villa a pie de golf Nueva Andalucía, villa off-market Marbella',
            intro: [
                'Marbella y el conjunto del Golden Triangle —Benahavís y Estepona— siguen siendo la dirección más consolidada para las villas de lujo de la Costa del Sol. De las residencias a pie de golf en Nueva Andalucía y La Zagaleta a las villas contemporáneas con vistas al mar en la Milla de Oro y Sierra Blanca, aquí se combinan diseño, seguridad y preservación del capital a largo plazo.',
                'En Azimut Property seleccionamos una cartera exclusiva de villas en todo el Triángulo, con acceso privilegiado a propiedades fuera de mercado que nunca llegan a los portales. Tanto si busca primera residencia, segunda vivienda o inversión, acompañamos al comprador internacional de principio a fin: de la primera visita privada a la due diligence y la firma notarial.',
                'El comprador de villa aquí prioriza privacidad, vistas panorámicas y proximidad a Puerto Banús y los colegios internacionales. Ajustamos cada búsqueda a la microzona adecuada y trabajamos con discreción, para asegurar las mejores propiedades antes de que se anuncien.',
            ],
            highlights: [
                { h: 'Foco en el Golden Triangle', p: 'Marbella, Benahavís y Estepona — Milla de Oro, Sierra Blanca, Nueva Andalucía y La Zagaleta.' },
                { h: 'Acceso off-market', p: 'Villas en manos de propietarios que nunca publican en los portales.' },
                { h: 'Acompañamiento integral', p: 'Visitas privadas, due diligence, NIE y firma notarial para el comprador internacional.' },
            ],
            listingsHref: '/venta/marbella/villa',
            listingsCta: 'Ver villas en Marbella',
        },
    },

    'mansions-sotogrande': {
        esSlug: 'mansiones-sotogrande',
        match: (p) => /sotogrande/.test(text(p)),
        en: {
            eyebrow: 'Sotogrande',
            h1: 'Mansions & Villas for Sale in Sotogrande',
            subhead: "Golf, polo and marina living in southern Europe's most private resort — including off-market estates.",
            heroAlt: 'Elegant mansion with mature gardens and a private pool in Sotogrande, Cádiz',
            seoTitle: 'Mansions for Sale in Sotogrande — Golf & Marina Villas | Azimut Property',
            seoDescription: 'Mansions and luxury villas for sale in Sotogrande, San Roque (Cádiz). Golf, polo and marina living from €1M to €15M, including off-market estates, for international buyers.',
            keywords: 'mansion for sale Sotogrande, luxury villas Sotogrande, off-market properties Sotogrande, Sotogrande Alto villa, Valderrama golf property, San Roque luxury real estate',
            intro: [
                "Sotogrande, in the Cádiz municipality of San Roque, is one of southern Europe's most private luxury enclaves — a resort of championship golf, international polo and a deep-water marina. Sotogrande Alto, with its large plots, mature gardens and views over the Valderrama course, is the address of choice for families who value discretion above all.",
                'Azimut Property represents buyers seeking mansions and villas in Sotogrande, from €1M residences to €15M estates. Our access extends to off-market properties held quietly by owners who do not advertise, and our team guides international purchasers through every step — NIE, due diligence, the notary and tax advice.',
                'Beyond the golf and polo, Sotogrande offers the International School of Sotogrande, marina restaurants and 25-minute access to Gibraltar airport — the blend of sport, education and privacy that sustains demand and long-term value.',
            ],
            highlights: [
                { h: 'Sotogrande Alto', p: 'Large plots, mature gardens and views over Valderrama and the lake.' },
                { h: '€1M–€15M', p: 'From family villas to landmark estates, on and off market.' },
                { h: 'Sport & schooling', p: 'Golf, polo, marina and the International School of Sotogrande.' },
            ],
            listingsHref: '/venta/sotogrande',
            listingsCta: 'Browse Sotogrande properties',
        },
        es: {
            eyebrow: 'Sotogrande',
            h1: 'Mansiones y Villas de Lujo en Sotogrande',
            subhead: 'Golf, polo y puerto deportivo en el enclave más privado del sur de Europa — incluidas fincas off-market.',
            heroAlt: 'Elegante mansión con jardines maduros y piscina privada en Sotogrande, Cádiz',
            seoTitle: 'Mansiones en Venta en Sotogrande — Villas de Golf y Puerto | Azimut Property',
            seoDescription: 'Mansiones y villas de lujo en venta en Sotogrande, San Roque (Cádiz). Golf, polo y puerto deportivo desde 1M€ hasta 15M€, incluidas propiedades off-market, para compradores internacionales.',
            keywords: 'mansión en venta Sotogrande, villas de lujo Sotogrande, propiedades off-market Sotogrande, villa Sotogrande Alto, propiedad golf Valderrama, inmobiliaria de lujo San Roque',
            intro: [
                'Sotogrande, en el municipio gaditano de San Roque, es uno de los enclaves de lujo más privados del sur de Europa: un resort de golf de campeonato, polo internacional y puerto deportivo de aguas profundas. Sotogrande Alto, con sus grandes parcelas, jardines maduros y vistas al campo de Valderrama, es la dirección preferida de las familias que valoran la discreción por encima de todo.',
                'En Azimut Property representamos a compradores que buscan mansiones y villas en Sotogrande, desde residencias de 1M€ hasta fincas de 15M€. Nuestro acceso alcanza propiedades off-market en manos de propietarios que no anuncian, y acompañamos al comprador internacional en cada paso: NIE, due diligence, notaría y asesoramiento fiscal.',
                'Más allá del golf y el polo, Sotogrande ofrece el International School of Sotogrande, la restauración del puerto deportivo y 25 minutos hasta el aeropuerto de Gibraltar — la combinación de deporte, educación y privacidad que sostiene la demanda y el valor a largo plazo.',
            ],
            highlights: [
                { h: 'Sotogrande Alto', p: 'Grandes parcelas, jardines maduros y vistas a Valderrama y el lago.' },
                { h: '1M€–15M€', p: 'De villas familiares a fincas emblemáticas, dentro y fuera de mercado.' },
                { h: 'Deporte y colegios', p: 'Golf, polo, puerto e International School of Sotogrande.' },
            ],
            listingsHref: '/venta/sotogrande',
            listingsCta: 'Ver propiedades en Sotogrande',
        },
    },

    'equestrian-estates-jimena-de-la-frontera': {
        esSlug: 'fincas-ecuestres-jimena-de-la-frontera',
        match: (p) => /(jimena|equestrian|ecuestre|equine|\bpolo\b)/.test(text(p)),
        en: {
            eyebrow: 'Campo de Gibraltar',
            h1: 'Equestrian Estates in Jimena de la Frontera',
            subhead: 'Polo fields, professional stabling and protected dehesa — 30 minutes from Sotogrande.',
            heroAlt: 'Equestrian estate with paddocks and cork-oak dehesa in Jimena de la Frontera, Cádiz',
            seoTitle: 'Equestrian Estates for Sale in Jimena de la Frontera | Azimut Property',
            seoDescription: 'Equestrian estates for sale in Jimena de la Frontera, Cádiz — polo fields, professional stabling and cork-oak dehesa, 30 minutes from Sotogrande. Off-market access for international buyers.',
            keywords: 'equestrian estate Jimena de la Frontera, polo estate for sale Cádiz, finca ecuestre Jimena, off-market equestrian estate near Sotogrande, horse property Andalusia, dehesa estate Cádiz',
            intro: [
                'Jimena de la Frontera, at the heart of the Alcornocales Natural Park in Cádiz, is one of Andalusia’s finest addresses for equestrian estates. Thirty minutes from Sotogrande’s polo and golf, it offers the space, privacy and protected landscape the resort itself cannot — cork-oak dehesa, clean rivers and large parcels from ten to more than five hundred hectares.',
                'The most sought-after estates combine regulation polo fields, professional stabling and paddocks with a luxury main residence — ideal for professional riders or as an equestrian-tourism investment. Azimut Property offers off-market access to these properties, prized by international buyers from the UK, Scandinavia and the Middle East.',
                'We advise on the full acquisition — rural and urban due diligence, water and cork rights, NIE and the notary. It is a niche few agencies cover with real depth, and one we know property by property.',
            ],
            highlights: [
                { h: 'Polo & stabling', p: 'Regulation polo fields, professional stables and paddocks.' },
                { h: 'Next to Sotogrande', p: 'The privacy of the interior, 30 minutes from resort services.' },
                { h: 'Protected dehesa', p: 'Cork-oak estates inside the Alcornocales Natural Park.' },
            ],
            listingsHref: '/venta/jimena-de-la-frontera',
            listingsCta: 'Browse Jimena estates',
        },
        es: {
            eyebrow: 'Campo de Gibraltar',
            h1: 'Fincas Ecuestres en Jimena de la Frontera',
            subhead: 'Campos de polo, cuadras profesionales y dehesa protegida — a 30 minutos de Sotogrande.',
            heroAlt: 'Finca ecuestre con paddocks y dehesa de alcornoque en Jimena de la Frontera, Cádiz',
            seoTitle: 'Fincas Ecuestres en Venta en Jimena de la Frontera | Azimut Property',
            seoDescription: 'Fincas ecuestres en venta en Jimena de la Frontera, Cádiz — campos de polo, cuadras profesionales y dehesa de alcornoque, a 30 minutos de Sotogrande. Acceso off-market para compradores internacionales.',
            keywords: 'finca ecuestre Jimena de la Frontera, finca de polo Cádiz, finca ecuestre cerca de Sotogrande, finca con cuadras Andalucía, finca de dehesa Cádiz, propiedad ecuestre en venta',
            intro: [
                'Jimena de la Frontera, en el corazón del Parque Natural de los Alcornocales (Cádiz), es una de las mejores direcciones de Andalucía para fincas ecuestres. A 30 minutos del polo y el golf de Sotogrande, ofrece el espacio, la privacidad y el paisaje protegido que el propio resort no puede dar: dehesa de alcornoque, ríos limpios y grandes parcelas de diez a más de quinientas hectáreas.',
                'Las fincas más codiciadas combinan campos de polo reglamentarios, cuadras profesionales y paddocks con una vivienda principal de lujo — ideales para jinetes profesionales o como inversión en turismo ecuestre. En Azimut Property ofrecemos acceso off-market a estas propiedades, muy demandadas por compradores del Reino Unido, Escandinavia y Oriente Medio.',
                'Asesoramos en toda la adquisición: due diligence rústica y urbanística, derechos de agua y corcho, NIE y notaría. Es un nicho que pocas agencias cubren con verdadera profundidad, y que conocemos finca a finca.',
            ],
            highlights: [
                { h: 'Polo y cuadras', p: 'Campos de polo reglamentarios, cuadras profesionales y paddocks.' },
                { h: 'Junto a Sotogrande', p: 'La privacidad del interior, a 30 minutos de los servicios del resort.' },
                { h: 'Dehesa protegida', p: 'Fincas de alcornocal dentro del Parque Natural de los Alcornocales.' },
            ],
            listingsHref: '/venta/jimena-de-la-frontera',
            listingsCta: 'Ver fincas en Jimena',
        },
    },

    'olive-estates-sevilla': {
        esSlug: 'haciendas-y-olivares-sevilla',
        match: (p) => /(sevilla|seville)/.test(text(p)) && /(finca|cortijo|hacienda|olive|olivar|estate)/.test(text(p)),
        en: {
            eyebrow: 'Campiña Sevillana',
            h1: 'Olive-Grove Estates & Haciendas in Seville',
            subhead: 'Historic haciendas and productive olive estates across Carmona, Écija, Osuna and the Aljarafe.',
            heroAlt: 'Historic hacienda among centuries-old olive groves in the Seville countryside at sunset',
            seoTitle: 'Olive-Grove Estates & Historic Haciendas for Sale in Seville | Azimut Property',
            seoDescription: 'Olive-grove estates and historic haciendas for sale in Seville — Carmona, Écija, Osuna and the Aljarafe. Productive, organic and off-market estates for international investors.',
            keywords: 'olive grove estate for sale Andalusia, historic hacienda for sale Seville, cortijo de olivar Sevilla, olive estate investment Andalusia, organic olive farm Spain, hacienda for hotel Seville',
            intro: [
                'The province of Seville holds the largest area of productive olive groves in Spain — more than 300,000 hectares of extra-virgin olive oil. For international buyers, an olive-grove estate here is both a lifestyle and a working asset: a historic hacienda or cortijo among centuries-old groves, with a gross agricultural yield of 3–5% on land value and strong long-term capital preservation.',
                'Demand for organic, certified estates has surged, led by European buyers seeking their own EVOO production. Azimut Property sources cortijos, historic haciendas and olive estates across Carmona, Écija, Osuna and the Aljarafe — including off-market properties with rehabilitation potential for boutique-hotel or private use.',
                'We guide the full purchase — agronomic and legal due diligence, organic-conversion status, NIE and the notary — so investors can acquire a Seville olive estate with confidence.',
            ],
            highlights: [
                { h: 'Working olive asset', p: 'Productive groves with a 3–5% gross yield on land value.' },
                { h: 'Historic haciendas', p: 'Carmona, Écija, Osuna and the Aljarafe — many with hotel potential.' },
                { h: 'Organic premium', p: 'Certified estates commanding a premium with European buyers.' },
            ],
            listingsHref: '/venta/sevilla',
            listingsCta: 'Browse Seville estates',
        },
        es: {
            eyebrow: 'Campiña Sevillana',
            h1: 'Haciendas y Fincas de Olivar de Lujo en Sevilla',
            subhead: 'Haciendas históricas y olivares productivos en Carmona, Écija, Osuna y el Aljarafe.',
            heroAlt: 'Hacienda histórica entre olivares centenarios en la campiña de Sevilla al atardecer',
            seoTitle: 'Haciendas Históricas y Fincas de Olivar en Venta en Sevilla | Azimut Property',
            seoDescription: 'Haciendas históricas y fincas de olivar en venta en Sevilla — Carmona, Écija, Osuna y el Aljarafe. Fincas productivas, ecológicas y off-market para el inversor internacional.',
            keywords: 'hacienda histórica en venta Sevilla, finca de olivar Sevilla, finca de olivar de inversión, finca de lujo Sevilla, olivar en venta Andalucía, hacienda para hotel rural Sevilla',
            intro: [
                'La provincia de Sevilla concentra la mayor superficie de olivar productivo de España — más de 300.000 hectáreas de aceite de oliva virgen extra. Para el comprador internacional, una finca de olivar aquí es a la vez estilo de vida y activo productivo: una hacienda histórica o un cortijo entre olivos centenarios, con una rentabilidad agrícola bruta del 3–5% sobre el valor del suelo y una sólida preservación del capital a largo plazo.',
                'La demanda de fincas ecológicas certificadas se ha disparado, impulsada por compradores europeos que buscan su propia producción de AOVE. En Azimut Property localizamos cortijos, haciendas históricas y fincas de olivar en Carmona, Écija, Osuna y el Aljarafe — incluidas propiedades off-market con potencial de rehabilitación para uso hotelero o residencial exclusivo.',
                'Acompañamos toda la compra: due diligence agronómica y legal, estado de conversión ecológica, NIE y notaría, para que el inversor adquiera su finca de olivar sevillana con total seguridad.',
            ],
            highlights: [
                { h: 'Activo de olivar', p: 'Olivares productivos con una rentabilidad bruta del 3–5% sobre el suelo.' },
                { h: 'Haciendas históricas', p: 'Carmona, Écija, Osuna y el Aljarafe — muchas con potencial hotelero.' },
                { h: 'Prima ecológica', p: 'Fincas certificadas que alcanzan precios premium con el comprador europeo.' },
            ],
            listingsHref: '/venta/sevilla',
            listingsCta: 'Ver fincas en Sevilla',
        },
    },

    // Spanish-only collections: the search demand is Spanish ("cortijos en venta
    // en Sevilla") and there is no English version, so they are served at
    // `/${slug}` with a self-referencing hreflang and no language switch. Each
    // targets a cortijo keyword that the province page /venta/{provincia} does
    // not lead with, so the two pages do not compete for the same query.
    'cortijos-en-venta-sevilla': {
        esOnly: true,
        match: (p) => /(sevilla|seville)/.test(text(p)) && /(finca|cortijo|hacienda|estate)/.test(text(p)),
        es: {
            eyebrow: 'Campiña Sevillana',
            h1: 'Cortijos en Venta en Sevilla',
            subhead: 'Cortijos de olivar, haciendas históricas y fincas rurales en Carmona, Écija, Osuna y el Aljarafe, con acompañamiento completo en la compra.',
            heroAlt: 'Cortijo andaluz entre olivares en la campiña sevillana',
            seoTitle: 'Cortijos en Venta en Sevilla | Olivar y Haciendas | Azimut Property',
            seoDescription: 'Cortijos en venta en Sevilla: cortijos de olivar, haciendas históricas y fincas rurales en Carmona, Écija, Osuna y el Aljarafe. Propiedades exclusivas fuera de mercado.',
            keywords: 'cortijos en venta en Sevilla, cortijo en venta Sevilla, cortijo de olivar Sevilla, cortijo Carmona, cortijo Écija, hacienda histórica Sevilla',
            intro: [
                'La campiña sevillana es una de las zonas rurales más reconocibles de Andalucía: olivares, cortijos y haciendas históricas entre Carmona, Écija, Osuna y el Aljarafe. Un cortijo aquí puede ser una residencia de campo, un activo agrícola o un proyecto de uso turístico.',
                'Azimut Property localiza cortijos de olivar, haciendas y fincas con terreno en la provincia, incluidas propiedades fuera de mercado. Cada cortijo se presenta con su situación del suelo, su acceso y su estado de conservación, para que el comprador decida con información completa.',
                'Acompañamos la compra completa: revisión urbanística y registral, NIE, notaría e impuestos, para que la compra de un cortijo sevillano sea segura desde el primer contacto.',
            ],
            highlights: [
                { h: 'Cortijos de olivar', p: 'Fincas con olivar en producción y edificaciones con historia.' },
                { h: 'Haciendas históricas', p: 'Carmona, Écija, Osuna y el Aljarafe, muchas con potencial de uso turístico.' },
                { h: 'Compra acompañada', p: 'Revisión urbanística, registral y notarial antes de firmar.' },
            ],
            listingsHref: '/venta/sevilla',
            listingsCta: 'Ver fincas en Sevilla',
        },
    },

    'cortijos-en-venta-huelva': {
        esOnly: true,
        match: (p) => /(huelva)/.test(text(p)) && /(finca|cortijo|hacienda|estate)/.test(text(p)),
        es: {
            eyebrow: 'Campo Onubense',
            h1: 'Cortijos en Venta en Huelva',
            subhead: 'Cortijos y fincas rurales entre el Parque Nacional de Doñana y la Sierra de Aracena, con acompañamiento completo en la compra.',
            heroAlt: 'Cortijo rodeado de dehesa en el campo de Huelva al atardecer',
            seoTitle: 'Cortijos en Venta en Huelva | Fincas Rurales | Azimut Property',
            seoDescription: 'Cortijos en venta en Huelva, entre Doñana y la Sierra de Aracena. Fincas rurales con terreno para uso privado o agrícola, con compra acompañada para el comprador internacional.',
            keywords: 'cortijos en venta en Huelva, cortijo Huelva, finca rural Huelva, cortijo con terreno Huelva, finca Doñana, finca Sierra de Aracena',
            intro: [
                'La provincia de Huelva combina dehesa, sierra y marisma: desde el entorno de Doñana hasta la Sierra de Aracena y la Costa de la Luz. Para el comprador internacional, un cortijo aquí es un refugio rural con terreno, con una vida tranquila y un paisaje muy distinto al de la costa.',
                'Azimut Property presenta cortijos, fincas agrícolas y casas de campo con terreno en comarcas como la Sierra de Aracena y el entorno de Almonte. Algunas propiedades se presentan fuera de mercado, y cada finca llega con la información que el comprador necesita para decidir.',
                'Acompañamos toda la compra: revisión urbanística y registral, agua y acceso, NIE y notaría, para que la compra de un cortijo onubense sea segura.',
            ],
            highlights: [
                { h: 'Entorno natural', p: 'Dehesa, sierra y marisma entre Doñana y la Sierra de Aracena.' },
                { h: 'Terreno y uso rural', p: 'Fincas con terreno para uso privado o agrícola.' },
                { h: 'Compra acompañada', p: 'Revisión urbanística, registral y notarial antes de cerrar.' },
            ],
            listingsHref: '/venta/huelva',
            listingsCta: 'Ver fincas en Huelva',
        },
    },

    'cortijos-en-venta-cadiz': {
        esOnly: true,
        match: (p) => /(cadiz|cádiz)/.test(text(p)) && /(finca|cortijo|hacienda|estate)/.test(text(p)),
        es: {
            eyebrow: 'Campiña Gaditana',
            h1: 'Cortijos en Venta en Cádiz',
            subhead: 'Cortijos de olivar, haciendas y fincas ecuestres entre Arcos, Jerez y Jimena de la Frontera, a un paso de Sotogrande.',
            heroAlt: 'Cortijo de olivar en la campiña gaditana al atardecer',
            seoTitle: 'Cortijos en Venta en Cádiz | Fincas Rurales | Azimut Property',
            seoDescription: 'Cortijos en venta en Cádiz: cortijos de olivar, haciendas y fincas ecuestres entre Arcos, Jerez y Jimena de la Frontera, cerca de Sotogrande. Propiedades fuera de mercado.',
            keywords: 'cortijos en venta en Cádiz, cortijo Cádiz, cortijo de olivar Cádiz, cortijo Jerez, cortijo Jimena de la Frontera, finca rural Cádiz',
            intro: [
                'La provincia de Cádiz reúne algunos de los paisajes rurales más buscados de Andalucía: campiña de olivar y viña en torno a Arcos y Jerez, y sierra y alcornocal hacia el Campo de Gibraltar. Un cortijo gaditano combina uso privado con un terreno rural bien situado.',
                'Azimut Property presenta cortijos, haciendas y fincas en comarcas como Jimena de la Frontera, Medina-Sidonia y Vejer, con acceso a propiedades fuera de mercado y una selección por ubicación, terreno y acceso.',
                'Acompañamos la compra completa: análisis urbanístico, agua y acceso, NIE y notaría, para que el comprador internacional adquiera con seguridad.',
            ],
            highlights: [
                { h: 'Ubicación privilegiada', p: 'Entre Sotogrande, Jerez y el Campo de Gibraltar.' },
                { h: 'Fincas ecuestres', p: 'Propiedades con perfil ecuestre en la zona de Jimena de la Frontera.' },
                { h: 'Compra acompañada', p: 'Análisis urbanístico, registral y notarial antes de firmar.' },
            ],
            listingsHref: '/venta/cadiz',
            listingsCta: 'Ver fincas en Cádiz',
        },
    },
};

const SITE_URL = 'https://www.azimutproperty.com';

const LandingPage = ({ slug, lang = 'en' }) => {
    const entry = LANDINGS[slug];
    const { properties, loading } = useProperties();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug, lang]);

    const matches = useMemo(() => {
        if (!entry || loading || !properties?.length) return [];
        return properties.filter(entry.match).slice(0, 3);
    }, [entry, properties, loading]);

    // Stable reference so SEO's effect doesn't re-run every render.
    const enUrl = entry ? `/${slug}` : '';
    const esUrl = entry ? (entry.esOnly ? `/${slug}` : `/es/${entry.esSlug}`) : '';
    const alternates = useMemo(() => {
        if (entry?.esOnly) return [
            { hreflang: 'es', url: `${SITE_URL}${esUrl}` },
            { hreflang: 'x-default', url: `${SITE_URL}${esUrl}` },
        ];
        return [
            { hreflang: 'en', url: `${SITE_URL}${enUrl}` },
            { hreflang: 'es', url: `${SITE_URL}${esUrl}` },
            { hreflang: 'x-default', url: `${SITE_URL}${enUrl}` },
        ];
    }, [entry, enUrl, esUrl]);

    // Routes are registered per known slug, so this is defensive only.
    if (!entry) return <NotFound />;

    const c = entry[lang];
    const t = STR[lang];
    const selfPath = lang === 'es' ? esUrl : enUrl;
    const otherPath = lang === 'es' ? enUrl : esUrl;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t.crumb, item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: c.h1, item: `${SITE_URL}${selfPath}` },
        ],
    };

    return (
        <div className="page home">
            <SEO
                title={c.seoTitle}
                description={c.seoDescription}
                url={selfPath}
                lang={lang}
                keywords={c.keywords}
                alternates={alternates}
            />
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            {/* Hero */}
            <section className="hero">
                <picture className="hero-media">
                    <source
                        type="image/webp"
                        srcSet="/media/hero-estate-960.webp 960w, /media/hero-estate-1440.webp 1440w, /media/hero-estate-1920.webp 1920w"
                        sizes="100vw"
                    />
                    <img
                        src="/media/hero-estate-1440.jpg"
                        srcSet="/media/hero-estate-960.jpg 960w, /media/hero-estate-1440.jpg 1440w, /media/hero-estate-1920.jpg 1920w"
                        sizes="100vw"
                        alt={c.heroAlt}
                        fetchpriority="high"
                        decoding="async"
                        width="1920"
                        height="1080"
                    />
                </picture>
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <header className="hero-header-branded">
                        <p className="landing-eyebrow" style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.9 }}>
                            {c.eyebrow}
                            {!entry.esOnly && (
                                <Link to={otherPath} hrefLang={lang === 'es' ? 'en' : 'es'} style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.4)', color: 'inherit', letterSpacing: '0.12em' }}>{t.other}</Link>
                            )}
                        </p>
                        <h1 className="hero-title">{c.h1}</h1>
                        <p className="main-value-proposition">{c.subhead}</p>
                    </header>

                    <div className="cta-group-luxury">
                        <Link to="/contact" className="btn btn-hero btn-primary-gold">{t.consult}</Link>
                        <Link to={c.listingsHref} className="btn btn-hero btn-secondary-outline">{c.listingsCta}</Link>
                    </div>

                    <div className="trust-indicators">
                        <span>{t.trust1}</span>
                        <span className="separator">•</span>
                        <span>{t.trust2}</span>
                    </div>
                </div>
            </section>

            {/* Intro prose */}
            <section className="section authority-section">
                <div className="container">
                    <div className="authority-content">
                        {c.intro.map((para, i) => (
                            i === 0
                                ? <p key={i} className="lead-text">{para}</p>
                                : <p key={i}>{para}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="section why-choose-section">
                <div className="container">
                    <div className="value-grid">
                        {c.highlights.map((item, i) => (
                            <div className="value-item" key={i}>
                                <h3>{item.h}</h3>
                                <p>{item.p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Matching listings (only when we hold stock) */}
            {matches.length > 0 && (
                <section className="section featured-section">
                    <div className="container">
                        <div className="section-header decorative-header">
                            <h2>{t.available}</h2>
                        </div>
                        <div className="featured-grid">
                            {matches.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                        <div className="view-all-container">
                            <Link to={c.listingsHref} className="btn btn-gold">{c.listingsCta.toUpperCase()}</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default LandingPage;
