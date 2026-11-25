// Spanish listing titles and descriptions built from Supabase fields
// (src/utils/propertySeo.js). Fixtures copy real listing titles, Nov 2026.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { propertyName, propertyKind, propertySeoTitle, propertySeoDescription } from '../src/utils/propertySeo.js';

const listing = (id, title, type, city, province, extra = {}) => ({
    id, title, type, city, province, area: 300, plot: 100000, bedrooms: 5, price: 1000000, ...extra,
});

const molino = listing(25, 'Molino del Hortelano — Historic Olive Estate with 18th-Century Mill, Málaga', 'Finca', 'Casabermeja', 'Málaga', { area: 980, plot: 124000, price: 2475000 });
const alqueva = listing(6, 'Joya del Alqueva — Finca de 80 ha con Acceso Directo al Mayor Embalse de Europa', 'Finca', 'Olivenza', 'Badajoz');
const flores = listing(36, 'Finca Las Flores en Tarifa: jardines, piscina y naturaleza', 'Finca', 'Tarifa', 'Cádiz');
const exceptional = listing(5, 'EXCEPTIONAL ANDALUSIAN ESTATE NEAR SEVILLA', 'Finca', 'Constantina', 'Sevilla');
const polo = listing(19, 'Luxury Equestrian Estate for Sale Near Sotogrande | Cádiz, Andalusia', 'Finca', 'Jimena de la Frontera', 'Cádiz', { plot: 48 });
const cortijoEcuestre = listing(15, 'Cortijo Ecuestre con Campo de Polo — Jimena de la Frontera, Cádiz', 'Finca', 'Jimena de la Frontera', 'Cádiz');
const rustica = listing(18, 'Finca Rústica Singular con Río Permanente y Cortijo Histórico — San Roque', 'Finca', 'San Roque', 'Cádiz');

test('the report example: name, kind, municipality and province', () => {
    assert.equal(propertySeoTitle(molino), 'Molino del Hortelano: Finca Olivarera en Casabermeja, Málaga');
});

test('a name is taken only when the title has one', () => {
    assert.equal(propertyName(molino), 'Molino del Hortelano');
    assert.equal(propertyName(alqueva), 'Joya del Alqueva');
    assert.equal(propertyName(flores), 'Finca Las Flores');
    assert.equal(propertyName(exceptional), '');
    assert.equal(propertyName(polo), '');
    assert.equal(propertyName(cortijoEcuestre), '');
});

test('kind comes from the title words, earliest first', () => {
    assert.equal(propertyKind(alqueva), 'Finca', 'Olivenza is a town, not an olive grove');
    assert.equal(propertyKind(polo), 'Finca Ecuestre');
    assert.equal(propertyKind(cortijoEcuestre), 'Cortijo Ecuestre');
    assert.equal(propertyKind(rustica), 'Finca Rústica');
});

test('a name that already says the kind is not repeated', () => {
    assert.equal(propertySeoTitle(flores), 'Finca Las Flores en Tarifa, Cádiz');
});

test('listings that would share a title are told apart', () => {
    const a = listing(40, 'EXCEPTIONAL ESTATE', 'Finca', 'Ronda', 'Málaga', { plot: 200000 });
    const b = listing(41, 'GREAT ESTATE', 'Finca', 'Ronda', 'Málaga', { plot: 50000 });
    const ta = propertySeoTitle(a, [a, b]);
    const tb = propertySeoTitle(b, [a, b]);
    assert.notEqual(ta, tb);
    assert.match(ta, /20 ha/);
});

test('an implausible finca plot is left out of the description', () => {
    assert.doesNotMatch(propertySeoDescription(polo), /ha|parcela/);
});

test('lengths stay within 60 and 155 characters', () => {
    for (const p of [molino, alqueva, flores, exceptional, polo, cortijoEcuestre, rustica]) {
        assert.ok(propertySeoTitle(p).length <= 60, propertySeoTitle(p));
        assert.ok(propertySeoDescription(p).length <= 155, propertySeoDescription(p));
    }
});

test('price on demand is never printed as a figure', () => {
    const pod = listing(14, 'Cortijo Andaluz Tradicional en Marchena — 7 Dormitorios', 'Finca', 'Marchena', 'Sevilla', { price: 0, price_on_demand: true });
    assert.match(propertySeoDescription(pod), /Precio a consultar/);
});
