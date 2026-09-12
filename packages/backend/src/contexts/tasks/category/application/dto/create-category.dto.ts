import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Trabajo',
    description: 'Nombre de la categoría',
  })

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
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