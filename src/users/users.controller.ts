import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { UsersService } from '@app/users/users.service';
import { CreateUserDto } from '@app/users/dto/create-user.dto';
import { UpdateUserDto } from '@app/users/dto/update-user.dto';
import { JwtAuthGuard } from '@app/auth/guards';
import { Role, Roles } from '@app/auth/roles';

@ApiTags('users')
@ApiSecurity('bearer')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get()
  getAllUsers() {
    return this.userService.users({});
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/:uuid')
  getUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.userService.findUserById(uuid);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Post()
  postNewUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(202)
  @Patch('/:uuid')
  patchUser(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(uuid, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/:uuid')
  deleteUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.userService.deleteUser({ id: uuid });
  }
}
