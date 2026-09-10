import React from 'react';
import { Helmet } from 'react-helmet-async';

const LocationSEOContent = ({ city, area }) => {
    // Content database for major locations
    const content = {
        'marbella': {
            title: 'Comprar Propiedad de Lujo en Marbella',
            description: `Marbella es la joya indiscutible del mercado inmobiliario de lujo en el Mediterráneo. Su microclima excepcional, infraestructura de primer nivel y estilo de vida exclusivo atraen a compradores de alto patrimonio de todo el mundo.

Tanto si buscas una villa en primera línea de playa en la Milla de Oro como una mansión contemporánea en Sierra Blanca, Marbella ofrece una cartera inigualable de propiedades premium. Nuestro conocimiento profundo del mercado local garantiza acceso a los listings más exclusivos fuera de mercado y las mejores oportunidades de inversión.

El mercado inmobiliario de Marbella ha experimentado una revalorización sostenida, con propiedades en la Milla de Oro que han aumentado su valor un 15-20% en los últimos años. La demanda de alquiler vacacional de lujo supera el 90% de ocupación en temporada alta, convirtiendo Marbella en una inversión segura y rentable.`,
            faqs: [
                { q: '¿Cuáles son las mejores zonas para comprar en Marbella?', a: 'La Milla de Oro, Sierra Blanca y Nueva Andalucía son las zonas más prestigiosas y estables para la inversión.' },
                { q: '¿Es Marbella una buena inversión en 2026?', a: 'Sí, Marbella sigue mostrando una fuerte revalorización del capital y alta demanda de alquiler de lujo, con rentabilidades brutas del 4-6% anual.' }
            ]
        },

        'cadiz': {
            title: 'Comprar Casa Rural, Finca y Cortijo en Cádiz',
            intro: 'Cádiz: la provincia más auténtica de Andalucía para la inversión rural',
            description: `La provincia de Cádiz concentra algunas de las propiedades rurales más singulares y mejor conservadas de todo el sur de España. Desde los cortijos de campiña en Medina-Sidonia hasta las fincas ganaderas de Alcalá de los Gazules, pasando por las casas payesas de Vejer de la Frontera, comprar una propiedad rural en Cádiz significa acceder a un patrimonio histórico y natural sin igual.

**¿Por qué comprar casa rural en Cádiz?**

La provincia gaditana ofrece una combinación única de factores que la convierten en el destino ideal para compradores nacionales e internacionales que buscan propiedades rurales de inversión:

- **Precio por hectárea competitivo**: Las fincas agrícolas en Cádiz ofrecen un precio por metro cuadrado muy inferior al de Málaga, con potencial de revalorización significativo.
- **Diversidad de tipologías**: Cortijos de olivar en Arcos de la Frontera, fincas equinas en Jerez, casas de campo con piscina en la Sierra de Grazalema o propiedades frente al Atlántico en Tarifa.
- **Rentabilidad agrícola y turística**: El aceite de oliva gaditano y el vino del Marco de Jerez generan ingresos recurrentes. El turismo rural ha crecido un 35% desde 2022.
- **Entorno natural protegido**: El Parque Natural de los Alcornocales, la Sierra de Grazalema y el entorno de La Janda ofrecen paisajes de extraordinaria belleza.

**Tipos de propiedades rurales en Cádiz**

*Cortijos y casas de campo*: Los cortijos andaluces tradicionales de la campiña gaditana combinan arquitectura centenaria con terrenos productivos de 5 a 500 hectáreas. Ideales para primera y segunda residencia, turismo rural o producción ecológica.

*Fincas agrícolas*: Olivares, viñedos de Jerez, dehesas de alcornoque y explotaciones ganaderas conforman el tejido productivo de la provincia. Una finca con cortijo de aceite de oliva en Cádiz es una de las inversiones más sólidas del mercado agrícola andaluz.

*Haciendas y propiedades históricas*: Las haciendas jerezanas de los siglos XVIII y XIX, ligadas a la industria del sherry, representan un patrimonio arquitectónico único con enorme potencial de rehabilitación para uso hotelero o residencial exclusivo.

*Chalets con terreno y fincas ecuestres*: La zona de Jerez de la Frontera, cuna de la equitación española, concentra las mejores fincas equinas de Andalucía, con instalaciones para doma y cría de caballos de pura raza española.

**Zonas de mayor demanda para comprar propiedad rural en Cádiz**

Medina-Sidonia, Vejer de la Frontera, Alcalá de los Gazules, Arcos de la Frontera, Jerez de la Frontera y la Sierra de Grazalema concentran la mayor demanda de propiedades rurales. El acceso desde Málaga y Sevilla, la proximidad a Sotogrande y la costa del Atlántico, y la creciente comunidad de compradores internacionales convierten estas zonas en focos de alta revalorización.

En Azimut Property contamos con un portfolio selecto de fincas, cortijos y casas de campo en la provincia de Cádiz. Nuestro equipo de especialistas te acompañará en todo el proceso de compra, desde la identificación de la propiedad ideal hasta la gestión de la due diligence y el cierre notarial.`,
            cta: '¿Buscas una finca o cortijo en Cádiz? Consúltanos sin compromiso.',
            faqs: [
                { q: '¿Cuánto cuesta una finca agrícola en Cádiz?', a: 'El precio varía entre 150.000€ para fincas pequeñas de 2-5 hectáreas y más de 3.000.000€ para grandes cortijos históricos con olivar o viñedo. El precio por hectárea oscila entre 8.000€ y 40.000€ según la ubicación y productividad.' },
                { q: '¿Qué zonas de Cádiz son mejores para comprar casa rural?', a: 'Vejer de la Frontera, Medina-Sidonia y Arcos de la Frontera ofrecen el mejor equilibrio entre precio, calidad de vida y potencial de revalorización. Jerez es la zona de referencia para fincas equinas.' },
                { q: '¿Se puede obtener rentabilidad con una propiedad rural en Cádiz?', a: 'Sí. Una finca con casa rural en Cádiz puede generar ingresos por alquiler vacacional (200-400€/noche en temporada alta) además de los rendimientos agrícolas del olivar, viñedo o explotación ganadera.' },
                { q: '¿Qué es una casa payesa en Andalucía?', a: 'La casa payesa es una tipología arquitectónica tradicional andaluza de planta baja, muros de cal blanca, patio central y dependencias para aperos y animales. Son altamente demandadas por compradores que buscan autenticidad y un proyecto de rehabilitación con carácter.' }
            ]
        },

        'huelva': {
            title: 'Comprar Finca, Chalet y Casa de Campo en Huelva',
            intro: 'Huelva: naturaleza, privacidad y rentabilidad rural en el oeste de Andalucía',
            description: `La provincia de Huelva ofrece algunas de las mejores oportunidades para comprar propiedades rurales en Andalucía, combinando precios muy competitivos con un entorno natural de primer orden. Entre el Parque Nacional de Doñana, la Sierra de Aracena y Picos de Aroche, y la Costa de la Luz, Huelva es el destino emergente para compradores que buscan espacio, privacidad y rentabilidad.

**¿Por qué invertir en propiedad rural en Huelva?**

Huelva presenta una relación calidad-precio excepcional en el mercado de propiedades rurales. Los chalets con terreno de 10 hectáreas o más, prácticamente inaccesibles en Málaga o Cádiz por sus precios, son abundantes en la Sierra de Aracena a precios que oscilan entre 300.000€ y 1.500.000€. Esta diferencia de precio, unida al creciente interés internacional por la zona, convierte Huelva en una de las mejores apuestas de inversión rural en España.

**Tipos de propiedades rurales en Huelva**

*Chalets con terreno en la Sierra de Aracena*: La comarca de Aracena y Picos de Aroche concentra algunas de las propiedades más buscadas de Huelva. Chalets y casas de campo con parcelas de 1 a 50 hectáreas, rodeadas de encinar mediterráneo, con agua propia y vistas espectaculares. El microclima de la sierra —fresco en verano y suave en invierno— los convierte en una alternativa perfecta a la Costa del Sol.

*Fincas de dehesa y ganadería extensiva*: La dehesa onubense, con sus encinares centenarios, es el hábitat natural del cerdo ibérico. Las fincas para cría de ganado ibérico representan una inversión con alta rentabilidad y un valor cultural único. El jamón ibérico de Jabugo es uno de los productos gastronómicos más valorados del mundo, lo que garantiza demanda sostenida.

*Fincas ecuestres y equinas*: La cultura ecuestre tiene profunda tradición en Huelva. Las fincas con instalaciones para caballos —cuadras, picadero, paddocks— son muy demandadas tanto por uso particular como para escuelas de equitación y turismo ecuestre.

*Casas rurales con piscina para turismo*: El turismo rural en Huelva ha experimentado un crecimiento del 40% en los últimos tres años. Las propiedades rehabilitadas con casa rural y piscina generan ocupaciones superiores al 75% anual, con ingresos medios de 800-1.200€ por semana en temporada alta.

*Propiedades en Costa de la Luz*: El litoral onubense, con sus playas vírgenes de arena blanca y dunas, ofrece propiedades únicas en Mazagón, Matalascañas y El Rompido. Las fincas y chaletes próximas al Parque Nacional de Doñana son especialmente valoradas por compradores europeos que buscan naturaleza sin masificación.

**Rentabilidad de la propiedad rural en Huelva**

La combinación de turismo rural, producción agrícola y ganadería ecológica convierte las propiedades rurales de Huelva en activos con múltiples fuentes de ingreso. La Denominación de Origen Protegida del jamón de Jabugo, los vinos del Condado de Huelva y los frutos rojos de Lepe y Palos de la Frontera son productos de alta demanda internacional.

En Azimut Property disponemos de una selección exclusiva de propiedades rurales en Huelva, con acceso a inmuebles fuera de mercado y asesoramiento especializado para compradores nacionales e internacionales.`,
            cta: '¿Buscas un chalet con terreno o una finca en Huelva? Habla con nuestros especialistas.',
            faqs: [
                { q: '¿Cuánto cuesta un chalet con terreno en Huelva?', a: 'Los chalets con parcelas de 1-5 hectáreas en la Sierra de Aracena oscilan entre 180.000€ y 600.000€. Para fincas de 10 hectáreas o más, los precios van de 250.000€ a 1.200.000€ según la ubicación y las instalaciones.' },
                { q: '¿Qué zonas de Huelva son mejores para comprar propiedad rural?', a: 'Aracena, Jabugo, Cortegana y Almonaster la Real concentran la mayor demanda en la sierra. En la costa, Mazagón, El Rompido y Punta Umbría son las zonas más valoradas para segunda residencia.' },
                { q: '¿Es Huelva una buena inversión inmobiliaria?', a: 'Sí. Huelva es uno de los mercados con mayor potencial de revalorización en Andalucía. Los precios actuales son un 40-60% inferiores a los de Málaga para propiedades equivalentes, con una tendencia alcista sostenida.' },
                { q: '¿Puedo comprar una finca equina en Huelva?', a: 'Absolutamente. La provincia cuenta con numerosas fincas con instalaciones ecuestres completas. Los precios para fincas equinas de 5-20 hectáreas con cuadras y picadero oscilan entre 350.000€ y 1.500.000€.' }
            ]
        },

        'sevilla': {
            title: 'Comprar Cortijo, Hacienda y Finca en Sevilla',
            intro: 'Sevilla: el corazón de la propiedad rural andaluza, entre olivares y dehesas',
            description: `La provincia de Sevilla es sinónimo de hacienda andaluza, cortijo señorial y finca agrícola de alta productividad. Comprar una propiedad rural en Sevilla significa adquirir parte del alma de Andalucía: un cortijo entre olivares centenarios, una hacienda rehabilitada con arquitectura histórica, o una finca agrícola con plenas posibilidades de explotación.

**El mercado de propiedades rurales en Sevilla**

Sevilla concentra la mayor superficie de olivar en producción de España, con más de 300.000 hectáreas dedicadas al aceite de oliva virgen extra. Las fincas con olivar son activos agrícolas con una rentabilidad bruta del 3-5% anual sobre el valor del suelo, además del potencial de revalorización patrimonial. La finca orgánica en Andalucía —certificada en agricultura ecológica— ha duplicado su demanda desde 2020, impulsada por compradores europeos que buscan producción propia de AOVE ecológico.

**Tipos de propiedades rurales en Sevilla**

*Cortijos de olivar y campiña*: Los cortijos tradicionales sevillanos combinan arquitectura vernácula —encalados, azulejos, patios con naranjos— con explotaciones agrícolas de alta productividad. Los municipios de Carmona, Écija, Morón de la Frontera y Osuna concentran el mayor stock de cortijos con olivar en venta.

*Haciendas históricas*: Las haciendas sevillanas representan el escalón más alto de la propiedad rural andaluza. Con orígenes en los siglos XVI y XVII, muchas han sido rehabilitadas como hoteles rurales de lujo, fincas de eventos o residencias familiares exclusivas. Disponen de capilla, bodega, torre vigía y construcciones auxiliares sobre parcelas de 20 a 500 hectáreas.

*Fincas ecuestres y para uso equestre*: El Real Club de Polo de Sevilla y la tradición jinete de la Maestranza convierten la provincia en un referente ecuestre. Fincas con instalaciones para doma vaquera, polo y cría de caballos PRE se concentran en el Aljarafe sevillano y la campiña sur.

*Fincas orgánicas y de producción ecológica*: El crecimiento de la demanda de aceite ecológico, cerdo ibérico de bellota y vinos biodinámicos hace de las fincas orgánicas en Sevilla una inversión con alto retorno. Los compradores europeos, especialmente alemanes y escandinavos, lideran la demanda de este tipo de propiedad.

*Propiedades para turismo rural y eventos*: Sevilla recibe más de 3 millones de turistas anuales. Una hacienda o cortijo rehabilitado para celebraciones, retiros corporativos o turismo rural de lujo puede generar ingresos anuales de 150.000€ a 500.000€.

**Zonas destacadas para comprar finca en Sevilla**

- **Carmona y Campiña Norte**: Cortijos entre olivares a 30 km de Sevilla capital. Alta demanda para segunda residencia y producción agrícola.
- **Osuna y Estepa**: Fincas con olivar de alta rentabilidad en la campiña sur, próximas a Málaga y Granada.
- **Constantina y Sierra Norte**: Propiedades rurales en el Parque Natural Sierra Norte, ideales para turismo rural y retiros.
- **Aljarafe y Alrededores**: Fincas ecuestres y residencias de lujo a menos de 20 km de la capital hispalense.
- **Marchena y Paradas**: Cortijos de campiña con grandes extensiones a precios muy competitivos.

En Azimut Property somos especialistas en la búsqueda y adquisición de propiedades rurales en Sevilla, con acceso privilegiado a cortijos, haciendas y fincas fuera de mercado. Nuestro equipo acompaña al comprador desde la identificación de la propiedad hasta el cierre notarial.`,
            cta: '¿Buscas un cortijo, hacienda u olivar en Sevilla? Contacta con nuestros asesores rurales.',
            faqs: [
                { q: '¿Cuánto cuesta comprar un cortijo en Sevilla?', a: 'Los cortijos de campiña con 5-20 hectáreas de olivar oscilan entre 400.000€ y 2.000.000€. Las haciendas históricas rehabilitadas superan habitualmente el millón de euros. El precio por hectárea de olivar productivo en Sevilla está entre 12.000€ y 25.000€.' },
                { q: '¿Es rentable una finca con olivar en Sevilla?', a: 'Sí. Una finca con olivar productivo genera ingresos por la venta de aceite de oliva virgen extra, con rentabilidades brutas del 3-5% sobre el valor del suelo. Las certificaciones ecológicas incrementan el precio de venta del AOVE hasta un 40% sobre el convencional.' },
                { q: '¿Qué es una hacienda en Andalucía?', a: 'La hacienda es la tipología más completa de la propiedad rural andaluza. Incluye la casa principal (señorío), capilla, bodega, almacenes, viviendas de aperos y extensas tierras de cultivo. Muchas haciendas sevillanas están catalogadas como Bien de Interés Cultural.' },
                { q: '¿Puede un extranjero comprar una finca en Sevilla?', a: 'Sí, sin restricciones. Los ciudadanos de la UE y extracomunitarios pueden comprar libremente propiedades rurales en España. Azimut Property gestiona el NIE, la due diligence urbanística y el cierre notarial para compradores internacionales.' },
                { q: '¿Qué es una finca orgánica en Andalucía?', a: 'Una finca orgánica o ecológica está certificada por el Comité Andaluz de Agricultura Ecológica (CAAE). Sus producciones —aceite, vino, cerdo ibérico— obtienen precios premium y acceso a mercados europeos de alto valor. La conversión a producción ecológica suele completarse en 2-3 años.' }
            ]
        },

        'malaga': {
            title: 'Fincas, Terrenos y Cortijos en Málaga Interior',
            intro: 'Málaga: inversión en suelo y fincas exclusivas más allá de la costa',
            description: `La provincia de Málaga ofrece un potencial de revalorización único en su zona de interior. Mientras la costa está consolidada, áreas como Ronda, el Valle del Guadalhorce y la Axarquía presentan oportunidades excepcionales para adquirir fincas de recreo, explotaciones agrícolas y terrenos con gran potencial de desarrollo.

**¿Por qué invertir en el interior de Málaga?**

Málaga es el motor económico de Andalucía. Su conectividad internacional a través del aeropuerto y el AVE, unida a una calidad de vida envidiable, hace que las propiedades rurales en el interior de la provincia sean activos altamente líquidos.

- **Conectividad**: Acceso rápido desde la Costa del Sol y Málaga capital a entornos rurales protegidos.
- **Microclimas**: Variedad de paisajes, desde los viñedos de Ronda hasta los cultivos tropicales de la Axarquía.
- **Turismo de Interior**: Un sector al alza que garantiza rentabilidades por alquiler vacacional rural superiores al 6% anual.
- **Escasez de Activos**: La demanda de fincas con cortijo rehabilitado supera ampliamente la oferta disponible.

**Zonas destacadas para inversión rural en Málaga**

*Ronda y Serranía*: La zona de referencia para fincas exclusivas y viñedos. Ronda combina prestigio histórico con una naturaleza salvaje y majestuosa.

*Valle del Guadalhorce (Coín, Álora, Alhaurín)*: Conocido como "la huerta de Málaga", es ideal para quienes buscan una finca con producción de cítricos o aguacates cerca de la capital.

*La Axarquía*: Pendientes pronunciadas con vistas al mar, ideales para cultivos subtropicales y casas de campo con carácter mediterráneo auténtico.

En Azimut Property seleccionamos activos en Málaga que combinan la autenticidad del entorno rural con la seguridad de una inversión sólida en la provincia más dinámica del sur de España.`,
            cta: '¿Buscas una inversión en terreno o una finca en Málaga? Consúltanos.',
            faqs: [
                { q: '¿Qué rentabilidad ofrece una finca agrícola en Málaga?', a: 'Dependiendo del cultivo (aguacates, cítricos, olivar), la rentabilidad agrícola suele oscilar entre el 3% y el 7% anual, a lo que se suma la revalorización del suelo.' },
                { q: '¿Es buen momento para comprar terreno en Málaga?', a: 'Sí, la escasez de suelo finalista y el crecimiento de la población en la provincia aseguran una demanda creciente de terrenos tanto para uso agrícola como para proyectos de turismo sostenible.' }
            ]
        },

        'sierra-blanca': {
            title: 'Mansiones de Lujo en Sierra Blanca, Marbella',
            description: `Sierra Blanca es conocida como el "Beverly Hills de Marbella". Enclavada a los pies de La Concha, esta exclusiva urbanización ofrece vistas panorámicas al mar y seguridad de alto nivel.

Las propiedades en Sierra Blanca destacan por su escala, arquitectura neoclásica o contemporánea y grandes parcelas. La elección perfecta para familias que buscan un entorno tranquilo y seguro a minutos del centro de Marbella y Puerto Banús.`,
            faqs: [
                { q: '¿Por qué Sierra Blanca es tan popular?', a: 'La combinación de seguridad, proximidad al centro y vistas excepcionales la convierten en una de las direcciones más codiciadas de España.' }
            ]
        },

        'benahavis': {
            title: 'Villas y Fincas Exclusivas en Benahavís',
            description: `Benahavís es el municipio más rico de Andalucía y alberga algunas de las urbanizaciones más exclusivas de Europa, incluyendo La Zagaleta y El Madroño.

Este pueblo-montaña ofrece privacidad, seguridad y vistas impresionantes al Mediterráneo y Gibraltar. Es la elección preferida de quienes buscan discreción y naturaleza sin renunciar al lujo.`,
            faqs: [
                { q: '¿Es La Zagaleta la zona más exclusiva?', a: 'Sí, La Zagaleta está considerada la finca residencial más privada y segura de Europa.' }
            ]
        },

        'estepona': {
            title: 'Propiedades de Lujo en la Nueva Milla de Oro, Estepona',
            description: `Estepona ha experimentado una transformación notable, rivalizando con Marbella en oferta de lujo mientras mantiene su encanto andaluz. La "Nueva Milla de Oro" alberga impresionantes desarrollos frente al mar y modernas villas.

Con infraestructura mejorada y un bello casco histórico rehabilitado, Estepona es una de las zonas más emocionantes para invertir en la Costa del Sol.`
        },

        'jimena-de-la-frontera': {
            title: 'Comprar Finca Ecuestre y Propiedad Rural en Jimena de la Frontera',
            intro: 'Jimena de la Frontera: el secreto mejor guardado del Campo de Gibraltar para fincas de lujo',
            description: `Jimena de la Frontera, enclavada en el corazón del Parque Natural de los Alcornocales, es uno de los municipios más singulares de la provincia de Cádiz para la adquisición de fincas rurales y propiedades ecuestres de alto nivel. Su posición estratégica — a 30 minutos de Sotogrande, 45 minutos de Gibraltar y 90 minutos de Málaga — la convierte en un enclave de máxima privacidad con conectividad internacional.

**¿Por qué comprar una finca en Jimena de la Frontera?**

El término municipal de Jimena de la Frontera abarca más de 34.000 hectáreas de paisaje protegido, con alcornocales centenarios, ríos de aguas cristalinas y una biodiversidad excepcional. Las propiedades rurales en Jimena ofrecen parcelas de gran extensión — desde 10 hasta más de 500 hectáreas — a precios por hectárea significativamente inferiores a los de la Costa del Sol.

- **Fincas ecuestres**: Jimena es referencia para la cría de caballos y la práctica del polo. Las fincas con campos de polo, cuadras profesionales y paddocks son muy demandadas por compradores internacionales, especialmente del Reino Unido, Escandinavia y Alemania.
- **Proximidad a Sotogrande**: A menos de 30 minutos del resort de polo y golf más exclusivo de Europa, las fincas de Jimena ofrecen el entorno rural que Sotogrande no puede proporcionar, con acceso a sus servicios de élite.
- **Parque Natural de los Alcornocales**: El mayor alcornocal de Europa ofrece un entorno paisajístico sin igual. Las fincas dentro o colindantes al parque natural son activos con protección legal que garantiza la preservación del entorno.
- **Inversión con potencial**: El creciente interés de compradores internacionales por la España rural auténtica, combinado con la escasez de grandes fincas en venta, proyecta una revalorización sostenida.

**Tipos de propiedades en Jimena de la Frontera**

*Fincas ecuestres con campo de polo*: Las propiedades más exclusivas de la zona incluyen campos de polo reglamentarios, cuadras para 20+ caballos, pistas de entrenamiento y vivienda principal de lujo. Ideales para jinetes profesionales o como inversión en turismo ecuestre.

*Cortijos de alcornocal*: Las fincas productivas de corcho en los Alcornocales generan ingresos recurrentes por la saca del corcho (cada 9 años) además de su valor patrimonial. El corcho de Jimena es de los más valorados del mundo.

*Fincas ganaderas de dehesa*: La dehesa mediterránea de Jimena soporta ganadería extensiva de cerdo ibérico, vacuno retinto y caprino payoyo. Las fincas de dehesa son activos productivos con alta demanda.

*Casas de campo rehabilitadas*: Las casas rurales de Jimena, rehabilitadas con materiales tradicionales y modernas comodidades, son ideales como segunda residencia o para turismo rural de lujo.

En Azimut Property disponemos de una cartera exclusiva de fincas y propiedades rurales en Jimena de la Frontera. Nuestros especialistas en el Campo de Gibraltar le acompañarán en todo el proceso de adquisición.`,
            cta: '¿Buscas una finca ecuestre o propiedad rural en Jimena de la Frontera? Consúltanos sin compromiso.',
            faqs: [
                { q: '¿Cuánto cuesta una finca en Jimena de la Frontera?', a: 'Las fincas en Jimena de la Frontera oscilan entre 500.000€ para propiedades de 10-20 hectáreas y más de 3.000.000€ para grandes fincas ecuestres con campo de polo e instalaciones profesionales. El precio por hectárea varía entre 5.000€ y 30.000€ según la ubicación y las infraestructuras.' },
                { q: '¿Cuánto se tarda de Jimena de la Frontera a Sotogrande?', a: 'Jimena de la Frontera se encuentra a solo 25-30 minutos en coche de Sotogrande, lo que permite disfrutar de la privacidad rural con acceso rápido a los servicios de lujo, campos de golf y polo de la urbanización más exclusiva de Andalucía.' },
                { q: '¿Es Jimena de la Frontera buena inversión para comprar finca?', a: 'Sí. Jimena ofrece precios por hectárea un 40-60% inferiores a zonas comparables de Málaga, con un entorno natural protegido por el Parque de los Alcornocales que garantiza la preservación del paisaje. La demanda creciente de compradores internacionales y la escasez de oferta proyectan una revalorización significativa.' },
                { q: '¿Puede un extranjero comprar una finca en Jimena de la Frontera?', a: 'Sí, sin restricciones. Los compradores extranjeros, tanto de la UE como de terceros países, pueden adquirir libremente propiedades rurales en Jimena de la Frontera. Azimut Property gestiona el NIE, la due diligence urbanística y rural, y el cierre notarial para compradores internacionales.' }
            ]
        },

        'sotogrande': {
            title: 'Propiedades Exclusivas en Sotogrande — Villas, Golf y Marina',
            description: `Sotogrande es la urbanización residencial más exclusiva de Andalucía y uno de los enclaves de lujo más reconocidos del sur de Europa. Situado en el municipio de San Roque (Cádiz), entre el Mediterráneo y las montañas del Parque Natural de Los Alcornocales, Sotogrande combina un estilo de vida deportivo, cosmopolita y profundamente privado.

**Sotogrande Alto** es la zona residencial más prestigiosa, con villas independientes de gran parcela, vistas panorámicas al campo de golf de Valderrama y al lago, y acceso directo al International School of Sotogrande — uno de los colegios internacionales más valorados de España. Las propiedades en Sotogrande Alto combinan privacidad absoluta con proximidad a todos los servicios del resort.

- **Golf de élite**: Valderrama (sede de la Ryder Cup 1997), Real Club de Golf Sotogrande, La Reserva, La Cañada y Almenara. Más de 5 campos de golf a menos de 10 minutos.
- **Polo internacional**: El Santa María Polo Club acoge el torneo de polo más importante de Europa y atrae a jugadores de Argentina, Reino Unido y Oriente Medio cada verano.
- **Marina y gastronomía**: El puerto deportivo de Sotogrande ofrece restaurantes de primer nivel, tiendas de diseño y amarres para embarcaciones de gran eslora.
- **Conectividad**: A 25 minutos del aeropuerto de Gibraltar, 90 minutos de Málaga-Costa del Sol, y 30 minutos de las playas vírgenes de Tarifa y la Costa de la Luz.
- **Comunidad internacional**: Sotogrande alberga una comunidad residente de familias británicas, escandinavas, alemanas y del Golfo Pérsico, creando un entorno multicultural con servicios de nivel internacional.

El mercado inmobiliario de Sotogrande ofrece villas de alto standing desde €1M hasta €15M, con parcelas generosas (1.000-5.000 m²), jardines maduros, piscinas privadas y, en muchos casos, spa interior y vistas al golf. La demanda internacional se mantiene estable gracias a la combinación única de clima, deporte, educación y privacidad.`,
            faqs: [
                { q: '¿Cuánto cuesta una villa en Sotogrande Alto?', a: 'Las villas en Sotogrande Alto oscilan entre €1.200.000 y €8.000.000 dependiendo del tamaño, vistas y amenidades. Una villa de 5 dormitorios con piscina y vistas al golf se sitúa típicamente entre €1.500.000 y €3.000.000. Las propiedades con spa privado o parcelas superiores a 2.000 m² alcanzan precios más elevados.' },
                { q: '¿Qué colegios internacionales hay en Sotogrande?', a: 'El International School of Sotogrande (ISS) es un colegio IB World School que ofrece educación desde infantil hasta bachillerato internacional en inglés. Es uno de los factores clave que atrae a familias internacionales a la zona. También hay acceso al colegio británico de San Roque y opciones en Gibraltar a 25 minutos.' },
                { q: '¿Es Sotogrande buena inversión inmobiliaria?', a: 'Sí. Sotogrande ha demostrado ser una inversión resiliente con revalorización media del 4-6% anual en la última década. La demanda internacional estable, la oferta limitada de suelo urbanizable y la calidad del entorno deportivo y educativo sostienen los precios incluso en periodos de incertidumbre económica.' },
                { q: '¿Puede un extranjero comprar propiedad en Sotogrande?', a: 'Sí, no hay restricciones para compradores extranjeros en España. Ciudadanos de la UE y no-UE pueden comprar libremente. Azimut Property gestiona todo el proceso: solicitud de NIE, due diligence, escritura notarial y asesoramiento fiscal.' }
            ]
        },

        'almeria': {
            title: 'Comprar Finca, Cortijo y Casa de Campo en Almería',
            intro: 'Almería: sol, precio y rentabilidad en el sureste más luminoso de España',
            description: `La provincia de Almería es la gran oportunidad emergente del mercado inmobiliario del sureste español. Con más de 3.000 horas de sol al año —el clima más seco y luminoso de Europa continental—, precios muy inferiores a los de Málaga o Cádiz y un litoral en buena parte protegido, Almería combina como ninguna otra provincia andaluza rentabilidad, calidad de vida y potencial de revalorización.

**¿Por qué comprar propiedad en Almería?**

- **Precio y recorrido**: El precio medio por metro cuadrado en Almería es de los más bajos de Andalucía, lo que ofrece un margen de revalorización muy superior al de mercados ya maduros. Una finca con casa de campo o un chalet con terreno cuesta aquí una fracción de lo que valdría en la Costa del Sol.
- **Clima excepcional**: El microclima subtropical del Levante almeriense y del valle del Almanzora garantiza inviernos suaves y veranos secos, lo que convierte a la provincia en destino preferente de compradores del norte de Europa.
- **Demanda internacional consolidada**: El interior del valle del Almanzora (Albox, Arboleas, Zurgena) y la costa de Mojácar, Vera y Garrucha concentran una de las comunidades británicas y nórdicas más numerosas de España, con un mercado de segunda residencia muy activo.
- **Naturaleza protegida**: El Parque Natural de Cabo de Gata-Níjar, el desierto de Tabernas y la sierra de los Filabres ofrecen paisajes únicos y un litoral sin masificar.

**Tipos de propiedad en Almería**

*Fincas rústicas y cortijos*: El interior almeriense —valle del Almanzora, comarca de los Vélez y campo de Níjar— concentra cortijos tradicionales y fincas de secano y regadío a precios muy competitivos, ideales para proyecto de vida, turismo rural o producción agrícola.

*Chalets y casas de campo con terreno*: Muy demandados por compradores internacionales, combinan parcela, piscina y vistas a la sierra o al mar a precios inalcanzables en otras provincias del litoral mediterráneo.

*Propiedades costeras*: Mojácar, Vera Playa, Garrucha y Carboneras ofrecen villas, apartamentos y áticos frente al Mediterráneo, con fuerte demanda de alquiler vacacional.

*Villas de golf*: El resort Desert Springs, en Cuevas del Almanzora, es el único campo de golf de desierto de Europa y un enclave de villas de lujo ya consolidado.

En Azimut Property seleccionamos activos en toda la provincia de Almería, del cortijo del Almanzora a la villa frente al mar, con acceso a propiedades fuera de mercado y asesoramiento integral para el comprador nacional e internacional.`,
            cta: '¿Buscas una finca, cortijo o villa en Almería? Consúltanos sin compromiso.',
            faqs: [
                { q: '¿Por qué es Almería más económica que el resto de Andalucía?', a: 'Almería partió de precios más bajos y su mercado se ha internacionalizado más tarde que la Costa del Sol. El resultado es un precio por metro cuadrado un 40-60% inferior al de Málaga para propiedades equivalentes, con un recorrido de revalorización superior a medida que crece la demanda extranjera.' },
                { q: '¿Qué zonas de Almería son mejores para comprar?', a: 'El Levante almeriense (Vera, Mojácar y Garrucha) concentra la demanda costera de lujo y segunda residencia. El valle del Almanzora (Cuevas del Almanzora, Albox, Arboleas) es el gran foco de compradores británicos de interior. Cabo de Gata-Níjar es la referencia para propiedades en entorno natural protegido.' },
                { q: '¿Es Almería una buena inversión inmobiliaria?', a: 'Sí. La combinación de precios bajos, clima excepcional, demanda internacional creciente y alta ocupación de alquiler vacacional en la costa convierte a Almería en uno de los mercados con mayor potencial de revalorización de España.' },
                { q: '¿Puede un extranjero comprar una propiedad en Almería?', a: 'Sí, sin restricciones. Los compradores de la UE y de terceros países pueden adquirir libremente inmuebles en Almería. Azimut Property gestiona el NIE, la due diligence urbanística y rural y el cierre notarial para compradores internacionales.' }
            ]
        },

        'vera': {
            title: 'Comprar Casa, Finca y Villa en Vera (Almería)',
            intro: 'Vera: el corazón del Levante almeriense, entre la huerta y el mar',
            description: `Vera es uno de los municipios más dinámicos del Levante almeriense y una de las mejores puertas de entrada al mercado inmobiliario de la provincia. Situada a pocos kilómetros del Mediterráneo, entre la vega fértil y la costa de Vera Playa, combina la autenticidad de un pueblo andaluz con servicios completos y una comunidad internacional consolidada.

**¿Por qué comprar en Vera?**

Vera ofrece una relación calidad-precio difícil de igualar en el litoral mediterráneo. Su ubicación —a 10 minutos de las playas, 15 de Mojácar y Garrucha y con acceso rápido a la autovía del Mediterráneo y al aeropuerto de Almería— la convierte en un punto estratégico para vivir todo el año o como segunda residencia.

- **Vera Playa**: Uno de los complejos residenciales y turísticos más consolidados de la costa almeriense, con apartamentos, áticos y villas de primera línea, además del célebre enclave naturista, único en su categoría en España.
- **Fincas y casas de campo**: La vega de Vera y su entorno rural concentran fincas de regadío, casas de campo con terreno y parcelas a precios muy competitivos, ideales para huerta, caballos o proyecto de turismo rural.
- **Clima y salud**: El microclima seco y templado de Vera, con más de 300 días de sol al año, ha impulsado un turismo de bienestar y salud muy valorado por compradores del norte de Europa.

**Tipos de propiedad en Vera**

Desde apartamentos y áticos en Vera Playa hasta villas independientes con piscina, cortijos rehabilitados en la vega y parcelas rústicas para construir, Vera cubre todo el espectro de comprador, del inversor en alquiler vacacional a la familia que busca residencia permanente.

En Azimut Property disponemos de una selección de propiedades en Vera y su entorno, con acceso a inmuebles fuera de mercado y asesoramiento para compradores nacionales e internacionales.`,
            cta: '¿Buscas una casa, finca o villa en Vera? Habla con nuestros especialistas del Levante almeriense.',
            faqs: [
                { q: '¿Cuánto cuesta una propiedad en Vera?', a: 'Los apartamentos en Vera Playa parten de unos 90.000€-150.000€, mientras que las villas independientes con piscina se sitúan entre 250.000€ y 600.000€. Las fincas y casas de campo con terreno en la vega oscilan entre 120.000€ y 450.000€ según la superficie y las edificaciones.' },
                { q: '¿Está Vera junto a la playa?', a: 'El casco urbano de Vera se encuentra a unos 8-10 minutos en coche de Vera Playa, su franja litoral sobre el Mediterráneo. Esto permite disfrutar de la vida de pueblo y los servicios del interior con la playa a pocos minutos.' },
                { q: '¿Es Vera una buena inversión?', a: 'Sí. La combinación de precios accesibles, demanda internacional estable y alta ocupación de alquiler vacacional en Vera Playa hace de Vera una de las inversiones más sólidas del Levante almeriense.' },
                { q: '¿Qué hay cerca de Vera?', a: 'Vera limita con Garrucha (puerto y paseo marítimo), Mojácar (pueblo blanco y playas) y Cuevas del Almanzora (golf de desierto Desert Springs), formando el núcleo turístico y residencial más importante del Levante de Almería.' }
            ]
        },

        'mojacar': {
            title: 'Comprar Villa, Apartamento y Casa en Mojácar (Almería)',
            intro: 'Mojácar: el pueblo blanco frente al Mediterráneo más codiciado de Almería',
            description: `Mojácar es el destino residencial de referencia de la costa de Almería y uno de los pueblos más bellos y reconocibles de todo el litoral mediterráneo. Su casco antiguo de casas blancas encaramadas a la colina —Mojácar Pueblo— y sus 17 kilómetros de playa —Mojácar Playa— conforman un binomio único que atrae a compradores internacionales desde hace décadas.

**¿Por qué comprar en Mojácar?**

Mojácar combina el encanto del pueblo blanco andaluz con una oferta costera moderna y una comunidad internacional muy asentada, especialmente británica y del norte de Europa. Su marca turística, consolidada y estable, sostiene un mercado de segunda residencia y alquiler vacacional entre los más activos de la provincia.

- **Mojácar Pueblo**: Casas tradicionales encaladas, calles estrechas y vistas panorámicas al Mediterráneo y a la sierra de Cabrera. Muy demandadas por quienes buscan carácter y autenticidad.
- **Mojácar Playa**: Villas, apartamentos y áticos en primera y segunda línea de playa, con paseo marítimo, servicios y una temporada turística prolongada por el clima suave.
- **Entorno**: A pocos minutos de Garrucha, Vera y del Parque Natural de Cabo de Gata, con campos de golf cercanos y aeropuertos de Almería y Murcia-Corvera a poco más de una hora.

**Tipos de propiedad en Mojácar**

El mercado de Mojácar abarca desde casas de pueblo con encanto y villas con piscina y vistas al mar hasta apartamentos y áticos en complejos frente a la playa. Es un mercado especialmente líquido para el alquiler vacacional gracias a su notoriedad internacional.

En Azimut Property ofrecemos propiedades seleccionadas en Mojácar Pueblo y Mojácar Playa, con acceso a oportunidades fuera de mercado y acompañamiento completo al comprador internacional.`,
            cta: '¿Buscas una villa o apartamento en Mojácar? Consúltanos sin compromiso.',
            faqs: [
                { q: '¿Cuánto cuesta una villa en Mojácar?', a: 'Las villas con piscina y vistas al mar en Mojácar oscilan habitualmente entre 350.000€ y 900.000€. Los apartamentos en Mojácar Playa parten de unos 120.000€ y las casas con encanto en Mojácar Pueblo se sitúan entre 180.000€ y 450.000€ según ubicación y estado.' },
                { q: '¿Cuál es la diferencia entre Mojácar Pueblo y Mojácar Playa?', a: 'Mojácar Pueblo es el casco histórico en la colina, con casas blancas tradicionales y vistas panorámicas. Mojácar Playa es la franja costera, con 17 km de playa, paseo marítimo y propiedades modernas frente al mar. Están conectados y a pocos minutos en coche.' },
                { q: '¿Es Mojácar buena inversión para alquiler?', a: 'Sí. La fuerte notoriedad turística de Mojácar y su larga temporada garantizan una demanda de alquiler vacacional muy alta, con ocupaciones elevadas en temporada y rentabilidades atractivas para el inversor.' },
                { q: '¿Puede un extranjero comprar en Mojácar?', a: 'Sí, sin restricciones. Mojácar cuenta con una de las comunidades internacionales más consolidadas de Almería. Azimut Property gestiona el NIE, la due diligence y el cierre notarial para compradores extranjeros.' }
            ]
        },

        'cuevas-del-almanzora': {
            title: 'Comprar Finca, Villa de Golf y Casa en Cuevas del Almanzora',
            intro: 'Cuevas del Almanzora: golf de desierto, valle fértil y costa virgen',
            description: `Cuevas del Almanzora es uno de los municipios más extensos y singulares del Levante almeriense, un territorio que reúne golf de lujo, valle agrícola fértil, embalse y una costa aún poco masificada en Villaricos y Palomares. Su combinación de campo, deporte y mar la convierte en un enclave con múltiples perfiles de comprador.

**¿Por qué comprar en Cuevas del Almanzora?**

El municipio destaca por su diversidad: el valle del Almanzora ofrece fincas y casas de campo a precios muy competitivos, mientras que el resort Desert Springs aporta un mercado de villas de golf de perfil internacional.

- **Desert Springs Resort**: El único campo de golf de desierto de Europa, un complejo residencial consolidado con villas, apartamentos y servicios de alto nivel que atrae a compradores del Reino Unido y el norte de Europa.
- **Valle del Almanzora**: Fincas de regadío, cortijos y casas de campo con terreno a precios accesibles, en pleno foco de la demanda británica de interior.
- **Costa de Villaricos y Palomares**: Un litoral tranquilo y menos masificado, con propiedades frente al mar y a pocos minutos de Vera y Garrucha.

**Tipos de propiedad en Cuevas del Almanzora**

Desde villas y apartamentos en el resort de golf hasta fincas rústicas en el valle y casas frente al mar en la costa, Cuevas del Almanzora ofrece una gama amplia que cubre tanto la inversión de lujo como la compra de valor.

En Azimut Property disponemos de propiedades seleccionadas en Cuevas del Almanzora, del entorno de Desert Springs a las fincas del valle, con asesoramiento integral al comprador internacional.`,
            cta: '¿Buscas una villa de golf o una finca en Cuevas del Almanzora? Consúltanos.',
            faqs: [
                { q: '¿Qué es Desert Springs?', a: 'Desert Springs es el único resort de golf de desierto de Europa, situado en Cuevas del Almanzora. Es un complejo residencial de lujo con villas y apartamentos, campo de golf de 18 hoyos, club y servicios, muy demandado por compradores internacionales.' },
                { q: '¿Cuánto cuesta una propiedad en Cuevas del Almanzora?', a: 'Las fincas y casas de campo en el valle del Almanzora parten de unos 90.000€-250.000€. Las villas y apartamentos en Desert Springs se sitúan habitualmente entre 200.000€ y 700.000€ según tipología, vistas y proximidad al campo de golf.' },
                { q: '¿Está Cuevas del Almanzora cerca de la playa?', a: 'Sí. El municipio cuenta con litoral propio en Villaricos y Palomares, y está a pocos minutos de las playas de Vera y Garrucha, combinando interior de valle, golf y costa en un mismo término municipal.' },
                { q: '¿Es buena zona para compradores extranjeros?', a: 'Muy buena. El valle del Almanzora y Desert Springs concentran una comunidad británica y del norte de Europa muy asentada, con servicios orientados al comprador internacional. Azimut Property gestiona todo el proceso, incluido el NIE y el cierre notarial.' }
            ]
        },

        'garrucha': {
            title: 'Comprar Piso, Ático y Villa en Garrucha (Almería)',
            intro: 'Garrucha: puerto, paseo marítimo y vida mediterránea en el Levante almeriense',
            description: `Garrucha es el puerto por excelencia del Levante almeriense y uno de los enclaves costeros con más vida y demanda de la provincia. Su puerto pesquero y deportivo, su animado paseo marítimo y su famosa gamba roja hacen de Garrucha un destino residencial y turístico muy apreciado, con propiedades de primera línea frente al Mediterráneo.

**¿Por qué comprar en Garrucha?**

Pequeña en extensión pero intensa en servicios, Garrucha ofrece una vida mediterránea completa durante todo el año: puerto, playa, gastronomía y comercio a pie de calle, junto a Vera y Mojácar.

- **Primera línea de mar**: Apartamentos, áticos y edificios frente al paseo marítimo con vistas directas al Mediterráneo, muy demandados para segunda residencia y alquiler vacacional.
- **Puerto y marina**: El puerto deportivo y pesquero aporta actividad, restaurantes y amarres, un valor diferencial frente a otros núcleos del Levante.
- **Ubicación**: A pocos minutos de Mojácar, Vera y Cuevas del Almanzora, en pleno corazón del Levante almeriense y con acceso rápido a la autovía del Mediterráneo.

**Tipos de propiedad en Garrucha**

El mercado de Garrucha se orienta sobre todo a apartamentos y áticos frente al mar, con villas y adosados en las zonas altas. Es un mercado muy líquido para el alquiler vacacional gracias a su vida de puerto y su paseo marítimo.

En Azimut Property ofrecemos propiedades seleccionadas en Garrucha, con acceso a oportunidades de primera línea de playa y asesoramiento al comprador nacional e internacional.`,
            cta: '¿Buscas un piso o ático frente al mar en Garrucha? Consúltanos sin compromiso.',
            faqs: [
                { q: '¿Cuánto cuesta un piso en Garrucha?', a: 'Los apartamentos en Garrucha parten de unos 100.000€, y los áticos y pisos en primera línea de paseo marítimo se sitúan habitualmente entre 180.000€ y 450.000€ según superficie, altura y vistas al mar.' },
                { q: '¿Qué hace especial a Garrucha?', a: 'Garrucha combina puerto pesquero y deportivo, un largo paseo marítimo, gastronomía marinera —su gamba roja es famosa en toda España— y una vida de pueblo mediterráneo activa todo el año, algo poco frecuente en núcleos costeros de su tamaño.' },
                { q: '¿Es Garrucha buena para alquiler vacacional?', a: 'Sí. Su vida de puerto, su paseo marítimo y su cercanía a Mojácar y Vera generan una demanda de alquiler vacacional muy alta, especialmente para propiedades en primera línea de mar.' },
                { q: '¿Puede un extranjero comprar en Garrucha?', a: 'Sí, sin restricciones. Garrucha forma parte del Levante almeriense, con una comunidad internacional consolidada. Azimut Property gestiona el NIE, la due diligence y el cierre notarial para compradores extranjeros.' }
            ]
        },

        // Generic Fallback for other locations
        'default': {
            title: `Propiedades Exclusivas en Venta en ${city}`,
            description: `Descubre oportunidades inmobiliarias exclusivas en ${city}. En Azimut Property somos especialistas en identificar activos inmobiliarios únicos que ofrecen excelencia de vida y potencial de inversión.

Nuestro equipo aporta conocimiento local experto y acceso a una selección curada de propiedades en ${city}, garantizando un proceso de adquisición fluido para nuestra clientela internacional.`,
            faqs: [
                { q: `¿Es ${city} un buen lugar para comprar propiedad?`, a: `Sí, ${city} ofrece alta calidad de vida y es un mercado estable con creciente interés de compradores nacionales e internacionales.` },
                { q: '¿Cómo puede ayudarme Azimut Property?', a: 'Ofrecemos consultoría integral, desde identificar las mejores oportunidades hasta gestionar los aspectos legales y administrativos de su compra.' }
            ]
        }
    };

    // Slugify city for URLs so multi-word cities (e.g. "Jimena de la Frontera")
    // produce valid links like /venta/jimena-de-la-frontera/finca instead of a
    // broken URL containing spaces and accents.
    const citySlug = city?.toLowerCase().normalize('NFD')
        .replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const currentContent = content[citySlug] || content['default'];

    if (!city) return null;

    const isRuralProvince = ['cadiz', 'huelva', 'sevilla', 'malaga', 'jimena-de-la-frontera', 'sotogrande', 'almeria', 'vera', 'mojacar', 'cuevas-del-almanzora', 'garrucha'].includes(citySlug);

    // Generate FAQ Schema for Google/AI
    const faqSchema = currentContent.faqs ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": currentContent.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    } : null;

    return (
        <div className="location-seo-content container" style={{ marginTop: '4rem', paddingBottom: '4rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
            <Helmet>
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
            </Helmet>

            {/* Province badge for rural pages */}
            {isRuralProvince && currentContent.intro && (
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gold-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    {currentContent.intro}
                </p>
            )}

            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--ink-800)' }}>{currentContent.title}</h2>

            <div style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--ink-500)', maxWidth: '800px' }}>
                {currentContent.description.split('\n\n').map((paragraph, idx) => {
                    // Render paragraphs with bold via simple markdown **text**
                    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                    return (
                        <p key={idx} style={{ marginBottom: '1.5rem' }}>
                            {parts.map((part, i) =>
                                part.startsWith('**') && part.endsWith('**')
                                    ? <strong key={i}>{part.slice(2, -2)}</strong>
                                    : part
                            )}
                        </p>
                    );
                })}
            </div>

            {/* Internal Silo Links */}
            <div className="silo-links" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
                <a href={`/venta/${citySlug}/finca`} style={{ background: 'var(--surface-sunken)', color: 'var(--ink-800)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none', border: '1px solid var(--border)' }}>
                    Fincas en {city}
                </a>
                <a href={`/venta/${citySlug}/plot`} style={{ background: 'var(--surface-sunken)', color: 'var(--ink-800)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none', border: '1px solid var(--border)' }}>
                    Terrenos en {city}
                </a>
                <a href={`/venta/${citySlug}/villa`} style={{ background: 'var(--surface-sunken)', color: 'var(--ink-800)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none', border: '1px solid var(--border)' }}>
                    Villas en {city}
                </a>
            </div>

            {/* CTA for rural provinces */}
            {isRuralProvince && currentContent.cta && (
                <div style={{ margin: '2rem 0', padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: '#fff', fontSize: '1.125rem', fontWeight: '500', margin: 0 }}>{currentContent.cta}</p>
                    <a href="/contact" style={{ background: 'var(--gold-ink)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Contactar ahora
                    </a>
                </div>
            )}

            {currentContent.faqs && (
                <div className="seo-faqs" style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--ink-800)' }}>
                        {isRuralProvince ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
                    </h3>
                    <div className="faq-grid" style={{ display: 'grid', gap: '1.5rem' }}>
                        {currentContent.faqs.map((faq, idx) => (
                            <div key={idx} className="faq-item" style={{ background: 'var(--surface-sunken)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ink-800)' }}>{faq.q}</h4>
                                <p style={{ color: 'var(--ink-500)', margin: 0 }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSEOContent;
