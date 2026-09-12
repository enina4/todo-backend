import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/contexts/identity-access/auth/infrastructure/jwt-auth.guard';
import { CreateUserDto } from 'src/contexts/identity-access/user/application/dto/create-user.dto';
import { UpdateUserDto } from 'src/contexts/identity-access/user/application/dto/update-user.dto';
import { UserService } from 'src/contexts/identity-access/user/application/user.service';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/contexts/identity-access/auth/infrastructure/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiOkResponse({
    description: 'Lista de usuarios sin passwords',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente',
  })
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para modificar este usuario',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.userService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores pueden eliminar usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ) {
    return this.userService.delete(id, user);
  }
}