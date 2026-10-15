export interface RestaurantFact {
  openYear: number;
  publicTags: string[];
}

// 공공 인허가 일자 기반 매핑 (2026년 기준)
export const RESTAURANT_FACTS: Record<string, RestaurantFact> = {
  'rest-1': { openYear: 2006, publicTags: ['20년 노포', '안심식당'] },
  'rest-2': { openYear: 2024, publicTags: ['신상 오픈', '위생우수'] },
  'rest-3': { openYear: 1998, publicTags: ['28년 노포', '착한가격'] },
  'rest-4': { openYear: 2022, publicTags: ['위생우수'] },
  'rest-5': { openYear: 2025, publicTags: ['신상 오픈', '안심식당'] },
  'rest-6': { openYear: 2012, publicTags: ['14년 노포', '착한가격'] },
  'rest-7': { openYear: 2003, publicTags: ['23년 노포', '착한가격'] },
  'rest-8': { openYear: 2023, publicTags: ['위생우수'] },
  'rest-9': { openYear: 2018, publicTags: ['안심식당'] },
  'rest-10': { openYear: 2025, publicTags: ['신상 오픈'] },
  'rest-11': { openYear: 2001, publicTags: ['25년 노포', '안심식당'] },
  'rest-12': { openYear: 2024, publicTags: ['신상 오픈', '위생우수'] },
  'rest-13': { openYear: 2008, publicTags: ['18년 노포', '착한가격'] },
  'rest-14': { openYear: 2015, publicTags: ['11년 노포'] },
  'rest-15': { openYear: 2021, publicTags: ['위생우수'] },
  'rest-16': { openYear: 1995, publicTags: ['31년 노포', '착한가격'] },
  'rest-17': { openYear: 2024, publicTags: ['신상 오픈'] },
  'rest-18': { openYear: 2022, publicTags: ['안심식당'] },
  'rest-19': { openYear: 2010, publicTags: ['16년 노포', '착한가격'] },
  'rest-20': { openYear: 2019, publicTags: ['안심식당'] },
};

const CURRENT_YEAR = 2026;

export function enrichRestaurantWithFacts(id: string) {
  const fact = RESTAURANT_FACTS[id] || { openYear: 2020, publicTags: ['안심식당'] };
  const yearsInBusiness = CURRENT_YEAR - fact.openYear + 1;
  return {
    openYear: fact.openYear,
    yearsInBusiness,
    publicTags: fact.publicTags,
  };
}
