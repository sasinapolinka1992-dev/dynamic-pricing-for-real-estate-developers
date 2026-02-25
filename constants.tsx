
import { Unit, UnitStatus, UnitTag } from './types';

export const PRIMARY_COLOR = '#6699CC';
export const SECONDARY_COLOR = '#EAEAEA';

export const MOCK_TAGS: UnitTag[] = [
  { id: 't1', name: 'Вид на пруд', impact: 0.05, type: 'view' },
  { id: 't2', name: 'Панорамные окна', impact: 0.03, type: 'view' },
  { id: 't3', name: 'Высокий этаж', impact: 0.02, type: 'floor' },
  { id: 't4', name: 'Угловая', impact: -0.02, type: 'corner' },
];

const statuses = [
  UnitStatus.FREE,
  UnitStatus.RESERVED,
  UnitStatus.RESERVE,
  UnitStatus.SOLD,
  UnitStatus.RECOMMENDED,
  UnitStatus.NON_GROUP,
  UnitStatus.REEVALUATION
];

export const MOCK_UNITS: Unit[] = Array.from({ length: 320 }).map((_, i) => {
  const sectionId = `s-${Math.floor(i / 80) + 1}`;
  const localIndex = i % 80;
  const sectionNumber = Math.floor(i / 80) + 1;
  return {
    id: `u${i}`,
    number: `${sectionNumber * 1000 + localIndex}`,
    floor: Math.floor(localIndex / 10) + 1,
    rooms: (localIndex % 3) + 1,
    area: 35 + (localIndex % 5) * 10,
    basePricePerMeter: 160000,
    currentPrice: 5600000 + (i * 10000),
    status: statuses[i % statuses.length],
    tags: i % 5 === 0 ? ['t1'] : i % 8 === 0 ? ['t2', 't3'] : [],
    projectId: 'p-green-park',
    sectionId,
    project: sectionNumber === 1 ? 'ЖК Авеню' : 'Грин Парк',
    section: String(sectionNumber),
    type: (localIndex % 2 === 0) ? 'Квартира' : 'Апартаменты'
  };
});
