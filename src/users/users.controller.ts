import {
  Body,
  Controller,
  Delete,
  Get,
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

@ApiTags('users')
@ApiSecurity('bearer')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers() {
    return this.userService.users({});
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:uuid')
  getUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.userService.user({ id: uuid });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  postNewUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:uuid')
  patchUser(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser({
      where: { id: uuid },
      data: updateUserDto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:uuid')
  deleteUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.userService.deleteUser({ id: uuid });
  }
}
