import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TargetingType,
  DeviceType,
  DayOfWeek,
  AgeRangeType,
  GenderType,
  IncomeRangeType,
  ParentalStatusType,
  ProximityRadiusUnits,
} from '../targeting-types';

/**
 * Base targeting DTO
 */
class BaseTargetingDto {
  @IsEnum(TargetingType)
  type: TargetingType;

  @IsOptional()
  @IsBoolean()
  negative?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  bidModifier?: number;
}

/**
 * Location targeting - 地理位置定向
 */
export class LocationTargetingDto extends BaseTargetingDto {
  @IsString()
  geoTargetConstant: string; // e.g., "2840" for United States
}

/**
 * Proximity targeting - 半径定向
 */
export class ProximityTargetingDto extends BaseTargetingDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @Min(0)
  radius: number;

  @IsOptional()
  @IsEnum(ProximityRadiusUnits)
  radiusUnits?: ProximityRadiusUnits;
}

/**
 * Device targeting - 设备定向
 */
export class DeviceTargetingDto extends BaseTargetingDto {
  @IsEnum(DeviceType)
  device: DeviceType;
}

/**
 * Schedule targeting - 时间定向
 */
export class ScheduleTargetingDto extends BaseTargetingDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsNumber()
  @Min(0)
  @Max(24)
  startHour: number;

  @IsOptional()
  @IsNumber()
  startMinute?: number; // 0, 15, 30, 45

  @IsNumber()
  @Min(0)
  @Max(24)
  endHour: number;

  @IsOptional()
  @IsNumber()
  endMinute?: number; // 0, 15, 30, 45
}

/**
 * Age range targeting - 年龄定向
 */
export class AgeRangeTargetingDto extends BaseTargetingDto {
  @IsEnum(AgeRangeType)
  ageRange: AgeRangeType;
}

/**
 * Gender targeting - 性别定向
 */
export class GenderTargetingDto extends BaseTargetingDto {
  @IsEnum(GenderType)
  gender: GenderType;
}

/**
 * Income range targeting - 收入定向
 */
export class IncomeRangeTargetingDto extends BaseTargetingDto {
  @IsEnum(IncomeRangeType)
  incomeRange: IncomeRangeType;
}

/**
 * Parental status targeting - 育儿状态定向
 */
export class ParentalStatusTargetingDto extends BaseTargetingDto {
  @IsEnum(ParentalStatusType)
  parentalStatus: ParentalStatusType;
}

/**
 * User list targeting - 受众定向
 */
export class UserListTargetingDto extends BaseTargetingDto {
  @IsString()
  userListId: string;
}

/**
 * Union type for all targeting DTOs
 * 使用 type 字段进行区分
 */
export class AddTargetingDto {
  @IsEnum(TargetingType)
  type: TargetingType;

  // Location
  @IsOptional()
  @IsString()
  geoTargetConstant?: string;

  // Proximity
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  radius?: number;

  @IsOptional()
  @IsEnum(ProximityRadiusUnits)
  radiusUnits?: ProximityRadiusUnits;

  // Device
  @IsOptional()
  @IsEnum(DeviceType)
  device?: DeviceType;

  // Schedule
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  startHour?: number;

  @IsOptional()
  @IsNumber()
  startMinute?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  endHour?: number;

  @IsOptional()
  @IsNumber()
  endMinute?: number;

  // Age range
  @IsOptional()
  @IsEnum(AgeRangeType)
  ageRange?: AgeRangeType;

  // Gender
  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  // Income range
  @IsOptional()
  @IsEnum(IncomeRangeType)
  incomeRange?: IncomeRangeType;

  // Parental status
  @IsOptional()
  @IsEnum(ParentalStatusType)
  parentalStatus?: ParentalStatusType;

  // User list
  @IsOptional()
  @IsString()
  userListId?: string;

  // Common
  @IsOptional()
  @IsBoolean()
  negative?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  bidModifier?: number;
}
