import type { CalculatorInput, Complexity, Platform, ProjectStage, ProjectType, ServiceId, Timeline } from './types';

export const PROJECT_TYPES: { id: ProjectType; label: string; baseHours: number }[] = [
  { id: 'landing', label: 'Landing Page', baseHours: 24 },
  { id: 'corporate', label: 'Corporate Website', baseHours: 40 },
  { id: 'saas', label: 'SaaS / Web App', baseHours: 60 },
  { id: 'mobile', label: 'Mobile App', baseHours: 60 },
  { id: 'dashboard', label: 'Dashboard', baseHours: 40 },
  { id: 'ecommerce', label: 'E-commerce', baseHours: 60 },
  { id: 'design-system', label: 'Design System', baseHours: 40 },
  { id: 'ux-audit', label: 'UX Audit', baseHours: 12 },
  { id: 'other', label: 'Other', baseHours: 30 },
];

export const COMPLEXITIES: { id: Complexity; label: string; description: string; multiplier: number }[] = [
  { id: 'standard', label: 'Standard', description: 'Straightforward flows, familiar components and few states.', multiplier: 1 },
  { id: 'advanced', label: 'Advanced', description: 'Multiple states, forms, filtering and richer interactions.', multiplier: 1.25 },
  { id: 'complex', label: 'Complex', description: 'Product logic, roles, edge cases and custom components.', multiplier: 1.5 },
];

export const PLATFORMS: { id: Platform; label: string; multiplier: number }[] = [
  { id: 'web', label: 'Web', multiplier: 1 }, { id: 'ios', label: 'iOS', multiplier: 1 },
  { id: 'android', label: 'Android', multiplier: 1 }, { id: 'ios-android', label: 'iOS + Android', multiplier: 1.2 },
  { id: 'web-mobile', label: 'Web + Mobile', multiplier: 1.35 },
];

export const PROJECT_STAGES: { id: ProjectStage; label: string; description: string; multiplier: number }[] = [
  { id: 'new', label: 'New product', description: 'Designing a product from the ground up.', multiplier: 1.15 },
  { id: 'existing', label: 'Existing product', description: 'Evolving or redesigning an existing product.', multiplier: 1 },
  { id: 'improvement', label: 'UX improvements', description: 'Focused improvements to an existing interface.', multiplier: 0.9 },
];

export const TIMELINES: { id: Timeline; label: string; description: string; multiplier: number }[] = [
  { id: 'flexible', label: 'Flexible', description: 'Standard delivery pace.', multiplier: 1 },
  { id: 'priority', label: 'Priority', description: 'Faster scheduling and delivery.', multiplier: 1.2 },
  { id: 'urgent', label: 'Urgent', description: 'Highest priority and shortest timeline.', multiplier: 1.4 },
];

export const SERVICES: { id: ServiceId; label: string; description: string; hours?: number; percent?: number }[] = [
  { id: 'research', label: 'UX Research', description: 'User and product research before design', hours: 8 },
  { id: 'competitorAnalysis', label: 'Competitor Analysis', description: 'Analysis of comparable products and UX patterns', hours: 4 },
  { id: 'userFlow', label: 'User Flow', description: 'Detailed user flows and scenario mapping', hours: 6 },
  { id: 'wireframes', label: 'Wireframes', description: 'Low-fidelity structure before visual design', hours: 8 },
  { id: 'prototype', label: 'Interactive Prototype', description: 'Clickable prototype for testing or presentation', hours: 8 },
  { id: 'usabilityTesting', label: 'Usability Testing', description: 'Prototype testing and design iterations', hours: 12 },
  { id: 'designSystem', label: 'Design System', description: 'Reusable UI components, styles and patterns', hours: 16 },
  { id: 'responsive', label: 'Responsive Design', description: 'Additional layouts for desktop, tablet and mobile', percent: 0.25 },
  { id: 'developerHandoff', label: 'Developer Handoff', description: 'Design specifications and developer-ready files', hours: 6 },
  { id: 'designSupport', label: 'Design Support', description: 'Design support during development', hours: 10 },
];

export const HOURS_PER_ADDITIONAL_SCREEN = 3;
export const DEFAULT_INPUT: CalculatorInput = {
  projectType: 'saas', screens: 10, complexity: 'standard', platform: 'web', projectStage: 'existing', timeline: 'flexible', currency: 'USD', hourlyRate: 30,
  services: { research: false, competitorAnalysis: false, userFlow: false, wireframes: false, prototype: false, usabilityTesting: false, designSystem: false, responsive: false, developerHandoff: false, designSupport: false },
};
