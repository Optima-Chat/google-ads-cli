import { IsString } from 'class-validator';

export class ExecuteQueryDto {
  @IsString()
  query: string;
}
