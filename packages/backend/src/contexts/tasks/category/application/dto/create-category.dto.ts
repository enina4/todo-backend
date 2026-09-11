import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Trabajo',
    description: 'Nombre de la categoría',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    required: false,
    description: 'Color asociado a la categoría',
  })
  @IsString()
  @IsOptional()
  color?: string;
}