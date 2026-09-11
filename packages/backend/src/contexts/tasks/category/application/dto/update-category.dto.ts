import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Trabajo',
    description: 'Nombre de la categoría',
  })
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