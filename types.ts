
export enum UnitStatus {
  FREE = 'Свободно',
  RESERVED = 'Бронь',
  RESERVE = 'Резерв',
  SOLD = 'Продано',
  RECOMMENDED = 'Рекомендации по изменению цены',
  NON_GROUP = 'Не участвуют в группах',
  REEVALUATION = 'Переоценка',
  ASSORTMENT_SUGGESTION = 'Пополнение ассортимента'
}

export interface Unit {
  id: string;
  number: string;
  floor: number;
  rooms: number;
  area: number;
  livingArea?: number;
  kitchenArea?: number;
  ceilingHeight?: number;
  euroType?: boolean;
  basePricePerMeter: number;
  currentPrice: number;
  status: UnitStatus;
  tags: string[];
  projectId: string;
  sectionId: string;
  project?: string;
  section?: string;
  type?: string;
  recommendedPrice?: number;
}

export interface AssortmentRule {
  id: string;
  name: string;
  createdAt: string;
  unitValueType: 'шт' | '%';
  minQuantity: number;
  project: string;
  section: string;
  unitType: string;
  rooms: string;
  method: 'auto' | 'manual';
  isActive: boolean;
  triggerCount: number;
}

export interface AssortmentLog {
  id: string;
  date: string;
  project: string;
  section: string;
  unitType: string;
  area: number;
  unitNumber: string;
  currentPriceTotal: number;
  currentPriceM2: number;
  newPriceTotal: number;
  newPriceM2: number;
  status: 'accepted' | 'declined';
}

export interface ReevaluationRule {
  id: string;
  name: string;
  createdAt: string;
  triggerStatus: UnitStatus;
  daysThreshold: number;
  project: string;
  section: string;
  unitType: string;
  rooms: string;
  method: 'auto' | 'manual';
  isActive: boolean;
  triggerCount: number;
}

export interface ReevaluationLog {
  id: string;
  date: string;
  project: string;
  section: string;
  unitType: string;
  area: number;
  unitNumber: string;
  reservationDate: string;
  releaseDate: string;
  oldPriceTotal: number;
  oldPriceM2: number;
  newPriceTotal: number;
  newPriceM2: number;
  status: 'accepted' | 'declined';
}

export interface UnitTag {
  id: string;
  name: string;
  impact: number;
  type: string;
}

export interface UnitGroup {
  id: string;
  name: string;
  createdAt: string;
  unitIds: string[];
  activeRulesCount: number;
  ruleNames: string[];
}

export interface MonthlyPlanValue {
  month: string;
  units: number;
  area: number;
  pricePerM2: number;
  rub: number;
  factUnits?: number;
  factArea?: number;
  factPrice?: number;
}

export interface SalesPlan {
  id: string;
  project: string;
  section: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  startPriceM2: number;
  endPriceM2: number;
  total: { units: number; area: number; price: number };
  fact: { units: number; area: number; price: number };
  monthlyTargets: MonthlyPlanValue[];
}

export interface PricingRule {
  id: string;
  name: string;
  createdAt: string;
  events: string[];
  planCompletionThreshold?: number;
  frequency: number;
  isIncrease: boolean;
  changeType: 'percent_total' | 'percent_m2' | 'fixed_total' | 'fixed_m2' | 'promo';
  promoId?: string;
  magnitude: number;
  groupId: string;
  startDate: string;
  endDate: string;
  isAuto: boolean;
  status: 'active' | 'paused' | 'blocked';
  hits: number;
  profit: number;
  unitCount: number;
  limits: {
    maxSingleChange: number;
    maxSingleChangeType: 'percent' | 'rub_m2';
    cumulativeLimit?: number;
    velocityBrake?: number;
    velocityBrakePeriod?: 'day' | 'week' | 'month';
    maxTotalWeekly?: number;
    maxTotalMonthly?: number;
  };
}

export interface RuleLog {
  id: string;
  timestamp: string;
  project: string;
  section: string;
  unitType: string;
  unitCount: number;
  ruleName: string;
  oldPrice: number;
  newPrice: number;
  difference: number;
  changePercent: number;
  totalDiff: number;
  groupId?: string;
}
