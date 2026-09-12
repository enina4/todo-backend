import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'juan@test.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'CLIENT',
    enum: ['CLIENT', 'ADMIN'],
    description: 'Rol del usuario',
  })
  @IsIn(['CLIENT', 'ADMIN'])
  @IsOptional()
  role?: 'CLIENT' | 'ADMIN';

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'BLOCKED'],
    description: 'Estado del usuario',
  })
  @IsIn(['ACTIVE', 'BLOCKED'])
  @IsOptional()
  status?: 'ACTIVE' | 'BLOCKED';
}