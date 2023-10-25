import { Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/model/user.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private readonly jwtService:JwtService){}

    comparePasswords(
        passwordSended:string,
        passwordBBDD:string):Observable<any>{
        const match = bcrypt.compare(passwordSended,passwordBBDD);
        return from<any | boolean>(match);
    }

    generateJWT(user:User):Observable<string>{
        return from(this.jwtService.signAsync({user}));
    }

    hashPassword(password:string):Observable<string>{
        return from<string>(bcrypt.hash(password,12))
    }
}
