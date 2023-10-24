import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserEntity } from './model/user.entity';


@Module({
  
  imports:[TypeOrmModule.forFeature([UserEntity]),AuthModule],
  providers: [UserService],
  controllers: [ UserController],
})
export class UserModule {}
