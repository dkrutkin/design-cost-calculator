'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateEstimate, formatCurrency } from '../lib/calculateEstimate';
import { COMPLEXITIES, DEFAULT_INPUT, PLATFORMS, PROJECT_STAGES, PROJECT_TYPES, SERVICES, TIMELINES } from '../lib/pricing';
import type { CalculatorInput, Complexity, Currency, Platform, ProjectStage, Timeline } from '../lib/types';

type Choice = { id: string; label: string; description?: string; multiplier?: number };

const CURRENCIES: { id: Currency; label: string }[] = [
  { id: 'USD', label: '$ USD' },
  { id: 'EUR', label: '€ EUR' },
  { id: 'RUB', label: '₽ RUB' },
];
const FALLBACK_RATES: Record<Currency, number> = { USD: 1, EUR: 0.86, RUB: 84 };
const formatRate = (value: number) => String(Math.round(value * 100) / 100);

function ChoiceCards({ legend, choices, value, onChange, compact = false }: { legend: string; choices: Choice[]; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>
      <div className={compact ? 'choice-grid compact' : 'choice-grid'}>
        {choices.map((choice) => {
          const selected = value === choice.id;
          return (
            <button key={choice.id} type="button" className={`select-card ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => onChange(choice.id)}>
              <span className="choice-top"><strong>{choice.label}</strong>{selected && <span className="check" aria-hidden="true">✓</span>}</span>
              {choice.description && <small>{choice.description}</small>}
              {choice.multiplier !== undefined && <span className="multiplier">×{choice.multiplier}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Home() {
  const [input, setInput] = useState<CalculatorInput>(DEFAULT_INPUT);
  const [screensText, setScreensText] = useState(String(DEFAULT_INPUT.screens));
  const [rateText, setRateText] = useState(String(DEFAULT_INPUT.hourlyRate));
  const [currencyRates, setCurrencyRates] = useState(FALLBACK_RATES);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => calculateEstimate(input), [input]);
  const project = PROJECT_TYPES.find((item) => item.id === input.projectType)!;
  const screenValue = Number(screensText);
  const rateValue = Number(rateText);
  const screenError = screensText === '' || !Number.isInteger(screenValue) || screenValue < 1 || screenValue > 200;
  const rateError = rateText === '' || !Number.isFinite(rateValue) || rateValue <= 0;

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Exchange rate request failed');
        return response.json() as Promise<{ result?: string; rates?: Partial<Record<Currency, number>> }>;
      })
      .then((data) => {
        if (data.result !== 'success') return;
        const eur = data.rates?.EUR;
        const rub = data.rates?.RUB;
        if (typeof eur === 'number' && eur > 0 && typeof rub === 'number' && rub > 0) {
          setCurrencyRates({ USD: 1, EUR: eur, RUB: rub });
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const update = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const setScreens = (text: string) => { setScreensText(text); update('screens', Number(text)); };
  const changeCurrency = (currency: Currency) => {
    if (currency === input.currency) return;
    const currentRate = !rateError ? rateValue : input.hourlyRate;
    const convertedRate = currentRate / currencyRates[input.currency] * currencyRates[currency];
    const nextRate = Math.max(0.01, Math.round(convertedRate * 100) / 100);
    setRateText(formatRate(nextRate));
    setInput((current) => ({ ...current, currency, hourlyRate: nextRate }));
  };
  const cycleCurrency = () => {
    const currentIndex = CURRENCIES.findIndex((currency) => currency.id === input.currency);
    const nextCurrency = CURRENCIES[(currentIndex + 1) % CURRENCIES.length];
    changeCurrency(nextCurrency.id);
  };
  const adjustScreens = (amount: number) => {
    const next = Math.min(200, Math.max(1, (screenError ? 1 : screenValue) + amount));
    setScreens(String(next));
  };
  const reset = () => { setInput(DEFAULT_INPUT); setScreensText(String(DEFAULT_INPUT.screens)); setRateText(String(DEFAULT_INPUT.hourlyRate)); setCopied(false); };
  const copyEstimate = async () => {
    const chosen = SERVICES.filter((service) => input.services[service.id]).map((service) => service.label);
    const text = ['Design project estimate', '', `Project: ${project.label}`, `Screens / pages: ${screensText}`, `Complexity: ${COMPLEXITIES.find((item) => item.id === input.complexity)?.label}`, `Platform: ${PLATFORMS.find((item) => item.id === input.platform)?.label}`, `Hourly rate: ${formatCurrency(input.hourlyRate, input.currency)} / hour`, ...(chosen.length ? ['', ...chosen] : []), '', `Estimated workload: ${result.estimatedHours} hours`, `Estimated cost: ${formatCurrency(result.priceMin, input.currency)}–${formatCurrency(result.priceMax, input.currency)}`].join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  return (
    <>
      <main id="top" className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">Calculate your design project</h1>
          <p>Configure your project to get an estimated design cost.</p>
        </section>

        <div className="calculator-grid">
          <section className="form-card" aria-labelledby="configuration-title">
            <div className="section-heading"><div><h2 id="configuration-title">Project configuration</h2></div><button type="button" className="text-button" onClick={reset}>Reset estimate</button></div>

            <fieldset className="field-group"><legend>Project type</legend><div className="project-type-grid">
              {PROJECT_TYPES.map((item) => { const selected = input.projectType === item.id; return <button key={item.id} type="button" className={`select-card project-card ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => update('projectType', item.id)}><span className="choice-top"><strong>{item.label}</strong>{selected && <span className="check" aria-hidden="true">✓</span>}</span><small>{item.baseHours} base hours</small></button>; })}
            </div></fieldset>

            <div className="divider" />
            <fieldset className="field-group"><legend>Screens / pages</legend><p className="field-help">Include all unique screens or pages in the project.</p>
              <div className="stepper"><button type="button" aria-label="Decrease screens" onClick={() => adjustScreens(-1)} disabled={!screenError && screenValue <= 1}>−</button><input aria-label="Number of screens or pages" aria-describedby={screenError ? 'screens-error' : undefined} aria-invalid={screenError} inputMode="numeric" value={screensText} onChange={(event) => setScreens(event.target.value.replace(/[^0-9]/g, ''))} /><button type="button" aria-label="Increase screens" onClick={() => adjustScreens(1)} disabled={!screenError && screenValue >= 200}>+</button></div>
              {screenError && <p className="error" id="screens-error" role="alert">Enter a whole number between 1 and 200.</p>}
            </fieldset>

            <div className="divider" />
            <ChoiceCards legend="Complexity" choices={COMPLEXITIES} value={input.complexity} onChange={(value) => update('complexity', value as Complexity)} />
            <div className="divider" />
            <ChoiceCards legend="Platform" choices={PLATFORMS} value={input.platform} onChange={(value) => update('platform', value as Platform)} compact />
            <div className="divider" />
            <ChoiceCards legend="Project stage" choices={PROJECT_STAGES} value={input.projectStage} onChange={(value) => update('projectStage', value as ProjectStage)} />

            <div className="divider" />
            <fieldset className="field-group"><legend>Additional services</legend><p className="field-help">Add only the services your project needs.</p><div className="service-grid">
              {SERVICES.map((service) => { const selected = input.services[service.id]; return <label key={service.id} className={`service-card ${selected ? 'selected' : ''}`}><input type="checkbox" checked={selected} onChange={(event) => update('services', { ...input.services, [service.id]: event.target.checked })} /><span className="box" aria-hidden="true">{selected ? '✓' : ''}</span><span><strong>{service.label}</strong><small>{service.description}</small><em>{service.hours ? `+${service.hours} h` : '+25% of UI design'}</em></span></label>; })}
            </div></fieldset>

            <div className="divider" />
            <ChoiceCards legend="Timeline" choices={TIMELINES} value={input.timeline} onChange={(value) => update('timeline', value as Timeline)} compact />
            <div className="divider" />
            <fieldset className="field-group"><legend>Hourly rate</legend><p className="field-help">Set your working rate in {input.currency}. Currency values update using daily exchange rates.</p><div className={`rate-input ${rateError ? 'invalid' : ''}`}><button type="button" className="currency-button" aria-label={`Currency: ${input.currency}. Click to switch currency`} onClick={cycleCurrency}>{CURRENCIES.find((currency) => currency.id === input.currency)?.label}</button><input aria-label={`Hourly rate in ${input.currency}`} aria-describedby={rateError ? 'rate-error' : undefined} aria-invalid={rateError} inputMode="decimal" value={rateText} onChange={(event) => { const text = event.target.value.replace(/[^0-9.]/g, ''); setRateText(text); update('hourlyRate', Number(text)); }} /><span>/ hour</span></div>{rateError && <p className="error" id="rate-error" role="alert">Enter a rate greater than 0.</p>}<a className="rate-source" href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates by ExchangeRate-API</a></fieldset>
          </section>

          <aside className="price-card" id="estimate" aria-labelledby="estimate-title" aria-live="polite">
            <h2 id="estimate-title">Estimated project cost</h2>
            <div className="price-range" key={`${input.currency}-${result.priceMin}-${result.priceMax}`}><span>{formatCurrency(result.priceMin, input.currency)}</span><span>–{formatCurrency(result.priceMax, input.currency)}</span></div>
            <div className="hours-pill">≈ {result.estimatedHours} hours</div>
            <div className="breakdown"><h3>Estimate breakdown</h3><ul>{result.breakdown.map((item) => <li key={item.id}><span><strong>{item.title}</strong>{item.hours !== undefined && <small>{item.hours} h</small>}</span><b>{item.price !== undefined ? formatCurrency(item.price, input.currency) : item.value}</b></li>)}</ul><div className="total-row"><span>Estimated total</span><strong>{formatCurrency(result.price, input.currency)}</strong></div></div>
            <button type="button" className="copy-button" onClick={copyEstimate}>{copied ? 'Copied!' : 'Copy estimate'}</button>
            <p className="disclaimer">This is an estimated price. The final cost may change after project discovery and requirements clarification.</p>
          </aside>
        </div>
      </main>
      <a className="mobile-summary" href="#estimate"><span>Estimated · {result.estimatedHours} h</span><strong>{formatCurrency(result.priceMin, input.currency)}–{formatCurrency(result.priceMax, input.currency)}</strong></a>
    </>
  );
}
