import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { UserController } from './user/controller/user.controller';
import { UserService } from './user/service/user.service';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './user/model/user.entity';
import { AuthService } from './auth/services/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions:{expiresIn:process.env.JWT_EXPIRES_IN}
    }),
    UserModule,
    AuthModule,

  ],
  controllers: [AppController, UserController],
  providers: [AppService,UserService,AuthService],
})
export class AppModule {}
