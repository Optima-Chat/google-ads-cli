/**
 * Targeting Types - 定向类型定义
 */

// 定向类型枚举
export enum TargetingType {
  LOCATION = 'location',
  PROXIMITY = 'proximity',
  DEVICE = 'device',
  SCHEDULE = 'schedule',
  AGE_RANGE = 'age_range',
  GENDER = 'gender',
  INCOME_RANGE = 'income_range',
  PARENTAL_STATUS = 'parental_status',
  USER_LIST = 'user_list',
}

// 设备类型
export enum DeviceType {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  CONNECTED_TV = 'CONNECTED_TV',
}

// 星期枚举
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// 年龄范围
export enum AgeRangeType {
  AGE_RANGE_18_24 = 'AGE_RANGE_18_24',
  AGE_RANGE_25_34 = 'AGE_RANGE_25_34',
  AGE_RANGE_35_44 = 'AGE_RANGE_35_44',
  AGE_RANGE_45_54 = 'AGE_RANGE_45_54',
  AGE_RANGE_55_64 = 'AGE_RANGE_55_64',
  AGE_RANGE_65_UP = 'AGE_RANGE_65_UP',
  AGE_RANGE_UNDETERMINED = 'AGE_RANGE_UNDETERMINED',
}

// 性别类型
export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNDETERMINED = 'UNDETERMINED',
}

// 收入等级
export enum IncomeRangeType {
  INCOME_RANGE_0_50 = 'INCOME_RANGE_0_50',
  INCOME_RANGE_50_60 = 'INCOME_RANGE_50_60',
  INCOME_RANGE_60_70 = 'INCOME_RANGE_60_70',
  INCOME_RANGE_70_80 = 'INCOME_RANGE_70_80',
  INCOME_RANGE_80_90 = 'INCOME_RANGE_80_90',
  INCOME_RANGE_90_UP = 'INCOME_RANGE_90_UP',
  INCOME_RANGE_UNDETERMINED = 'INCOME_RANGE_UNDETERMINED',
}

// 育儿状态
export enum ParentalStatusType {
  PARENT = 'PARENT',
  NOT_A_PARENT = 'NOT_A_PARENT',
  UNDETERMINED = 'UNDETERMINED',
}

// 半径单位
export enum ProximityRadiusUnits {
  MILES = 'MILES',
  KILOMETERS = 'KILOMETERS',
}

// 定向条件输入类型
export interface LocationTargeting {
  type: TargetingType.LOCATION;
  geoTargetConstant: string; // e.g., "2840" for US
  negative?: boolean;
}

export interface ProximityTargeting {
  type: TargetingType.PROXIMITY;
  latitude: number;
  longitude: number;
  radius: number;
  radiusUnits?: ProximityRadiusUnits;
  negative?: boolean;
}

export interface DeviceTargeting {
  type: TargetingType.DEVICE;
  device: DeviceType;
  bidModifier?: number; // 0-10, where 1 = no change, 0 = -100%, 2 = +100%
}

export interface ScheduleTargeting {
  type: TargetingType.SCHEDULE;
  dayOfWeek: DayOfWeek;
  startHour: number; // 0-24
  startMinute?: number; // 0, 15, 30, 45
  endHour: number; // 0-24
  endMinute?: number; // 0, 15, 30, 45
  bidModifier?: number;
}

export interface AgeRangeTargeting {
  type: TargetingType.AGE_RANGE;
  ageRange: AgeRangeType;
  bidModifier?: number;
  negative?: boolean;
}

export interface GenderTargeting {
  type: TargetingType.GENDER;
  gender: GenderType;
  bidModifier?: number;
  negative?: boolean;
}

export interface IncomeRangeTargeting {
  type: TargetingType.INCOME_RANGE;
  incomeRange: IncomeRangeType;
  bidModifier?: number;
  negative?: boolean;
}

export interface ParentalStatusTargeting {
  type: TargetingType.PARENTAL_STATUS;
  parentalStatus: ParentalStatusType;
  bidModifier?: number;
  negative?: boolean;
}

export interface UserListTargeting {
  type: TargetingType.USER_LIST;
  userListId: string;
  bidModifier?: number;
  negative?: boolean;
}

export type TargetingInput =
  | LocationTargeting
  | ProximityTargeting
  | DeviceTargeting
  | ScheduleTargeting
  | AgeRangeTargeting
  | GenderTargeting
  | IncomeRangeTargeting
  | ParentalStatusTargeting
  | UserListTargeting;

// 定向条件响应类型
export interface TargetingCriterion {
  criterionId: string;
  type: string;
  status: string;
  negative: boolean;
  bidModifier?: number;
  // 具体定向类型数据
  location?: {
    geoTargetConstant: string;
    geoTargetConstantName?: string;
  };
  proximity?: {
    latitude: number;
    longitude: number;
    radius: number;
    radiusUnits: string;
  };
  device?: {
    type: string;
  };
  adSchedule?: {
    dayOfWeek: string;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  };
  ageRange?: {
    type: string;
  };
  gender?: {
    type: string;
  };
  incomeRange?: {
    type: string;
  };
  parentalStatus?: {
    type: string;
  };
  userList?: {
    userListId: string;
  };
}
