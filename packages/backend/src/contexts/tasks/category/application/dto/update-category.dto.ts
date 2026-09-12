import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Trabajo',
    description: 'Nombre de la categoría',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'Color asociado a la categoría',
  })
  @IsString()
  @IsOptional()
  color?: string;
}