import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { asyncScheduler } from 'rxjs';
import { UserModule } from 'src/user/user.module';


@Module({
    imports:[
        forwardRef(()=>UserModule),
        JwtModule.register({
            secret:process.env.JWT_SECRET,
            signOptions:{expiresIn:process.env.JWT_EXPIRES_IN}
        })
    ],
    exports:[]
})
export class AuthModule {}
