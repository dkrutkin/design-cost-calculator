import { COMPLEXITIES, HOURS_PER_ADDITIONAL_SCREEN, PLATFORMS, PROJECT_STAGES, PROJECT_TYPES, SERVICES, TIMELINES } from './pricing';
import type { CalculatorInput, CalculatorResult, Currency } from './types';

const roundTen = (value: number) => Math.round(value / 10) * 10;

export function calculateEstimate(input: CalculatorInput): CalculatorResult {
  const project = PROJECT_TYPES.find((item) => item.id === input.projectType)!;
  const complexity = COMPLEXITIES.find((item) => item.id === input.complexity)!;
  const platform = PLATFORMS.find((item) => item.id === input.platform)!;
  const stage = PROJECT_STAGES.find((item) => item.id === input.projectStage)!;
  const timeline = TIMELINES.find((item) => item.id === input.timeline)!;
  const validScreens = Number.isFinite(input.screens) ? Math.min(200, Math.max(1, Math.round(input.screens))) : 1;
  const validRate = Number.isFinite(input.hourlyRate) ? Math.max(1, input.hourlyRate) : 1;
  const screenHours = Math.max(0, validScreens - 1) * HOURS_PER_ADDITIONAL_SCREEN;
  const uiHours = project.baseHours + screenHours;
  const selectedServices = SERVICES.filter((service) => input.services[service.id]);
  const serviceHours = selectedServices.reduce((total, service) => total + (service.hours ?? uiHours * (service.percent ?? 0)), 0);
  const rawHours = (uiHours + serviceHours) * complexity.multiplier * platform.multiplier * stage.multiplier;
  const rawPrice = rawHours * validRate * timeline.multiplier;
  const designBasePrice = uiHours * complexity.multiplier * platform.multiplier * stage.multiplier * validRate;
  const breakdown = [
    { id: 'product-type', title: `Project type · ${project.label}`, hours: Math.round(uiHours * complexity.multiplier * platform.multiplier * stage.multiplier), price: roundTen(designBasePrice) },
    { id: 'screens', title: 'Screens / pages', value: String(validScreens) },
    { id: 'complexity', title: `Complexity · ${complexity.label}`, value: `×${complexity.multiplier}` },
    { id: 'platform', title: `Platform · ${platform.label}`, value: `×${platform.multiplier}` },
    { id: 'project-stage', title: `Project stage · ${stage.label}`, value: `×${stage.multiplier}` },
    ...selectedServices.map((service) => {
      const hours = (service.hours ?? uiHours * (service.percent ?? 0)) * complexity.multiplier * platform.multiplier * stage.multiplier;
      return { id: service.id, title: service.label, hours: Math.round(hours), price: roundTen(hours * validRate) };
    }),
  ];
  breakdown.push(
    timeline.multiplier > 1
      ? { id: 'timeline', title: `Timeline · ${timeline.label} (×${timeline.multiplier})`, price: roundTen(rawPrice - rawPrice / timeline.multiplier) }
      : { id: 'timeline', title: `Timeline · ${timeline.label}`, value: `×${timeline.multiplier}` },
  );
  return { estimatedHours: Math.round(rawHours), price: roundTen(rawPrice), priceMin: roundTen(rawPrice * 0.9), priceMax: roundTen(rawPrice * 1.1), breakdown };
}

export const formatCurrency = (value: number, currency: Currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(value);
