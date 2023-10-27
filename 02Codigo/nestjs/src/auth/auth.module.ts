import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { asyncScheduler } from 'rxjs';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.stratety';


@Module({
    imports:[
        forwardRef(()=>UserModule),
        PassportModule,
        JwtModule.register({
            secret:process.env.JWT_SECRET,
            signOptions:{expiresIn:process.env.JWT_EXPIRES_IN}
        })
    ],
    exports:[AuthService],
    providers: [AuthService,JwtStrategy]
})
export class AuthModule {}
