import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import '../styles/Guide.css';

const STEPS = [
    {
        title: 'Get your NIE',
        body: `The Número de Identidad de Extranjero is the tax number every foreign buyer needs before a purchase can be registered. You can apply at a Spanish consulate in your own country or at a police station in Spain. Start it early: it is the step most likely to add weeks to a purchase, and it holds up everything after it.`,
    },
    {
        title: 'Appoint an independent lawyer',
        body: `Not the seller's, not the agency's. Your lawyer runs the checks that decide whether a rural estate is what it appears to be: that the boundaries on the deed match the land, that the buildings are legally registered, that there are no debts attached to the property, and that water rights and access are real rather than customary.`,
    },
    {
        title: 'Reservation contract',
        body: `A modest deposit takes the property off the market while the checks run. It is normally a few thousand euros and is set against the price.`,
    },
    {
        title: 'Private contract, the "contrato de arras"',
        body: `Usually 10% of the price. Under the Spanish Civil Code, the common form of these deposits means that a buyer who withdraws loses it and a seller who withdraws returns double. Read what you are signing: the consequences differ by the type of arras used.`,
    },
    {
        title: 'Completion before a notary',
        body: `The escritura pública is signed in person or by power of attorney, the balance is paid, and the keys change hands the same day. The notary is a public official, neutral between the parties: they confirm identity and legality, they do not act for you.`,
    },
    {
        title: 'Registration and taxes',
        body: `Your lawyer files the purchase taxes and registers the deed at the Registro de la Propiedad. Registration is what makes your ownership enforceable against third parties.`,
    },
    {
        title: 'Utilities and the running of the place',
        body: `Water, electricity, waste and, on an estate, whatever the land itself needs — a borehole licence, an agricultural register entry, a caretaker. This is the step buyers underestimate on rural property.`,
    },
];

const COSTS = [
    ['Transfer tax (ITP) on a resale property', 'Andalusia applies a flat regional rate. Confirm the current figure with your lawyer before you budget.'],
    ['VAT and stamp duty on a new build', 'A new-build purchase is taxed differently: VAT plus stamp duty rather than transfer tax.'],
    ['Notary and land registry', 'Set by official scales and driven by the price and complexity of the deed.'],
    ['Legal fees', 'Commonly around 1% of the price, sometimes a fixed fee on larger purchases.'],
    ['Survey and technical checks', 'Optional and, on a rural estate with old buildings, the best money you will spend.'],
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
                name: 'Can a non-resident foreigner buy property in Spain?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. There is no restriction on foreign nationals buying property in Spain, whether or not they are resident. You need a Spanish tax number (NIE) before the purchase can be registered.',
                },
            },
            {
                '@type': 'Question',
                name: 'Does buying property in Spain give you residency?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. Spain ended its golden visa residency-by-property-investment route in 2025. Buying property no longer grants a residency permit, and any guide that says otherwise is out of date.',
                },
            },
            {
                '@type': 'Question',
                name: 'How long does buying a property in Spain take?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Two to three months from accepted offer to completion is typical. Obtaining a NIE, arranging finance, or resolving irregularities in the registration of rural buildings are the usual reasons it takes longer.',
                },
            },
        ],
    };

    return (
        <div className="page guide-page">
            <SEO
                title="Buying Property in Spain: A Guide for Non-Resident Buyers"
                description="What a foreign buyer needs to know before purchasing an estate in Andalusia: the NIE, the notary, purchase taxes, timeline, and the checks that matter on rural property."
                url="/buying-guide"
                lang="en"
                keywords="buying property in Spain as a foreigner, NIE number, Spanish property purchase tax, buying a finca in Andalusia, non-resident property Spain"
            />
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>

            <div className="container guide-container">
                <header className="guide-header">
                    <h1>Buying in Spain as a non-resident</h1>
                    <p className="guide-standfirst">
                        Nothing here is difficult. It is simply unfamiliar, and unfamiliar is
                        where money gets lost. This is the sequence a purchase actually follows in
                        Andalusia, what it costs beyond the asking price, and the checks that
                        matter more on a rural estate than on an apartment.
                    </p>
                </header>

                <section className="guide-section">
                    <h2>The short answer</h2>
                    <p>
                        A foreign buyer, resident or not, can buy property in Spain without
                        restriction. You will need a Spanish tax number, an independent lawyer, and
                        roughly ten to twelve per cent on top of the price to cover taxes and fees.
                        From accepted offer to keys is usually two to three months.
                    </p>
                    <p>
                        One thing has changed and is worth stating plainly, because a great deal of
                        published advice has not caught up: <strong>buying property in Spain no
                        longer grants residency</strong>. The golden visa route closed in 2025.
                        Property is an asset here, not an immigration strategy.
                    </p>
                </section>

                <section className="guide-section">
                    <h2>The seven steps</h2>
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
                    <h2>What it costs beyond the price</h2>
                    <p>
                        Budget ten to twelve per cent of the purchase price for a resale property in
                        Andalusia. Rates are set regionally and change, so treat the list below as
                        the shape of the bill rather than the bill itself.
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
                    <h2>What rural property asks that a villa does not</h2>
                    <p>
                        A finca is bought on its land, and land carries questions a built plot never
                        raises. Whether the registered surface matches what is fenced. Whether the
                        farmhouse, the store and the pool are all declared. Whether water is a legal
                        right or a neighbour's goodwill. Whether the access track is public, private
                        with a registered easement, or neither.
                    </p>
                    <p>
                        None of these are unusual and none of them are deal-breakers when they are
                        found early. They are only expensive when they are found after completion.
                    </p>
                </section>

                <section className="guide-section">
                    <h2>Once you own it</h2>
                    <p>
                        A non-resident owner files an annual return on the property even when it is
                        not let, pays the municipal property tax, and may fall within wealth tax
                        depending on the value held in Spain. Your lawyer or a gestor will normally
                        handle this as a small annual retainer.
                    </p>
                    <p>
                        If your money is not in euros, the exchange rate will move more than the
                        agency fee ever will. On a purchase of this size, speak to a currency broker
                        before you sign the private contract, not after.
                    </p>
                </section>

                <p className="guide-disclaimer">
                    This guide is general information about how property purchases work in
                    Andalusia. It is not legal or tax advice, tax rates and rules change, and your
                    own position may differ. Take advice from an independent lawyer and a tax
                    adviser before you commit to a purchase.
                </p>

                <div className="guide-cta">
                    <h2>Ask us the specific question</h2>
                    <p>
                        We work with a small number of buyers at a time, which means the answer you
                        get is about your purchase rather than about purchases in general.
                    </p>
                    <div className="guide-cta-actions">
                        <Link to="/contact" className="btn btn-gold">Speak to us</Link>
                        <Link to="/venta" className="btn btn-secondary">See the portfolio</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyingGuide;
