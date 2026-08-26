export type ProjectType = 'landing' | 'corporate' | 'saas' | 'mobile' | 'dashboard' | 'ecommerce' | 'design-system' | 'ux-audit' | 'other';
export type Complexity = 'standard' | 'advanced' | 'complex';
export type Platform = 'web' | 'ios' | 'android' | 'ios-android' | 'web-mobile';
export type ProjectStage = 'new' | 'existing' | 'improvement';
export type Timeline = 'flexible' | 'priority' | 'urgent';
export type Currency = 'USD' | 'EUR' | 'RUB';
export type ServiceId = 'research' | 'competitorAnalysis' | 'userFlow' | 'wireframes' | 'prototype' | 'usabilityTesting' | 'designSystem' | 'responsive' | 'developerHandoff' | 'designSupport';

export type CalculatorInput = {
  projectType: ProjectType;
  screens: number;
  complexity: Complexity;
  platform: Platform;
  projectStage: ProjectStage;
  timeline: Timeline;
  currency: Currency;
  hourlyRate: number;
  discountPercent: number;
  services: Record<ServiceId, boolean>;
};

export type BreakdownItem = { id: string; title: string; hours?: number; price?: number; value?: string };
export type CalculatorResult = { estimatedHours: number; price: number; priceMin: number; priceMax: number; breakdown: BreakdownItem[] };
