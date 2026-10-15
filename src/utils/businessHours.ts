import { BusinessHoursSchedule, BusinessStatusInfo } from '@/types/restaurant';

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 현재 시각을 기준으로 음식점의 실시간 영업 상태(영업중, 브레이크타임, 영업종료)를 판별
 */
export function calculateBusinessStatus(
  schedule?: BusinessHoursSchedule,
  currentDate: Date = new Date()
): BusinessStatusInfo {
  // 스케줄이 없을 경우 기본값
  if (!schedule) {
    return {
      status: 'OPEN',
      label: '영업중',
      subText: '21:30에 영업종료',
      badgeColor: 'green',
    };
  }

  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const openMinutes = timeToMinutes(schedule.open);
  let closeMinutes = timeToMinutes(schedule.close);

  // 심야 영업 (예: 17:00 ~ 02:00) 처리
  const isOvernight = closeMinutes < openMinutes;
  if (isOvernight) {
    closeMinutes += 24 * 60;
  }

  const adjustedCurrentMinutes =
    isOvernight && currentMinutes < openMinutes
      ? currentMinutes + 24 * 60
      : currentMinutes;

  // 1. 브레이크 타임 체크
  if (schedule.breakStart && schedule.breakEnd) {
    const breakStartMinutes = timeToMinutes(schedule.breakStart);
    const breakEndMinutes = timeToMinutes(schedule.breakEnd);

    if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
      return {
        status: 'BREAK',
        label: '브레이크 타임',
        subText: `${schedule.breakEnd}에 영업 재개`,
        badgeColor: 'orange',
      };
    }
  }

  // 2. 영업시간 내 여부 체크
  if (adjustedCurrentMinutes >= openMinutes && adjustedCurrentMinutes < closeMinutes) {
    // 마감 30분 전 라스트오더 안내
    if (closeMinutes - adjustedCurrentMinutes <= 30) {
      return {
        status: 'OPEN',
        label: '영업중 (마감임박)',
        subText: `${schedule.close}에 영업종료`,
        badgeColor: 'green',
      };
    }

    return {
      status: 'OPEN',
      label: '영업중',
      subText: `${schedule.close}에 영업종료`,
      badgeColor: 'green',
    };
  }

  // 3. 영업종료
  return {
    status: 'CLOSED',
    label: '영업 종료',
    subText: `다음 영업 ${schedule.open}`,
    badgeColor: 'gray',
  };
}

/**
 * 업종 및 식당 ID에 따른 기본 현실적인 영업시간 스케줄 매핑
 */
export function getDefaultScheduleForRestaurant(id: string, category: string): BusinessHoursSchedule {
  // 카페
  if (category === '카페/디저트') {
    return {
      open: '09:00',
      close: '22:00',
      lastOrder: '21:30',
    };
  }

  // 이자카야/사시미 등 야간 위주
  if (id === 'rest-14' || id === 'ic-14') {
    return {
      open: '17:00',
      close: '02:00',
      lastOrder: '01:00',
    };
  }

  // 브레이크타임이 있는 일반 식당 (11:00 ~ 21:30, 브레이크타임 15:00 ~ 17:00)
  if (id === 'rest-2' || id === 'rest-4' || id === 'ic-2' || id === 'ic-4' || id === 'ic-8') {
    return {
      open: '11:00',
      close: '21:30',
      breakStart: '15:00',
      breakEnd: '17:00',
      lastOrder: '21:00',
    };
  }

  // 브레이크타임이 15:30 ~ 17:30인 곳
  if (id === 'rest-8' || id === 'ic-3') {
    return {
      open: '11:30',
      close: '22:00',
      breakStart: '15:30',
      breakEnd: '17:30',
      lastOrder: '21:15',
    };
  }

  // 브레이크타임이 16:00 ~ 18:00인 곳 (현재 17:53 기준으로 브레이크타임에 해당하여 테스트 가능!)
  if (id === 'rest-12' || id === 'ic-12' || id === 'ic-18') {
    return {
      open: '11:00',
      close: '22:00',
      breakStart: '16:00',
      breakEnd: '18:00',
      lastOrder: '21:30',
    };
  }

  // 일찍 닫는 식당 (07:00 ~ 17:00 ➔ 현재 17:53 기준으로 영업종료에 해당!)
  if (id === 'rest-16' || id === 'ic-13') {
    return {
      open: '07:00',
      close: '16:30',
      lastOrder: '16:00',
    };
  }

  // 24시간 또는 밤늦게까지 하는 국밥/분식집
  if (id === 'rest-1' || id === 'ic-7' || id === 'rest-6') {
    return {
      open: '06:00',
      close: '23:30',
      lastOrder: '23:00',
    };
  }

  // 기본 일반 식당
  return {
    open: '11:00',
    close: '21:30',
    breakStart: '15:00',
    breakEnd: '17:00',
    lastOrder: '20:50',
  };
}
