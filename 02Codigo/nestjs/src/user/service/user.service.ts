import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable,from, map, switchMap } from 'rxjs';
import { UserEntity } from '../model/user.entity';
import { User } from '../model/user.interface';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class UserService {
    constructor(
        private authService: AuthService,
        @InjectRepository(UserEntity)
         private readonly userRepository: Repository<UserEntity>,
    ){}

    create(user:User):Observable<User>{
        return from(this.userRepository.save(user));
    }
    login(user:User):Observable<string>{
        return this.validateUser(user.email,user.password).pipe(
            switchMap((user:User)=>{
                if(user){
                    return this.authService
                        .generateJWT(user)
                        .pipe(map((jwt:string)=>jwt))
                }else{
                    return 'Wrong Credentials';
                }
            })
        )
    }

    private validateUser( email:string, password:string):Observable<User>{
        return from(
            this.findByEmail(email).pipe(
                switchMap((user:User)=>{
                    return this.authService
                    .comparePasswords(password,user.password)
                    .pipe(
                        map((match:boolean)=>{
                            if(match){
                                const {password ,...result}=user;   
                                return result;
                            }else{
                                throw Error;
                            }
                        })
                    );
                }),
            ))  
    }

    private findByEmail(email:string):Observable<User>{
        return from(
            this.userRepository.findOne({
                select:['id','name','email','password'],
                where:{'email':email},
            }),
        )
    }
    findAll():Observable <User[]>{
        return from(this.userRepository.find()).pipe(
            map((users:User[])=>{
                users.forEach((user)=>{

                });
                return users;
            }),
        );
    }

    findOne(id:number):Observable <User>{
        return from(this.userRepository.findOneBy({id:id })).pipe(
            map((user:User)=>{
                if(user){
                    return user;
                }else{
                    return null;
                }
            }),
        );
    }

    updateOne(id:number,user:User):Observable<any>{
        delete user.email;
        return from(this.userRepository.update(Number(id),user)).pipe(
            switchMap(()=>this.findOne(id)),
        );
    }

    deleteOne(id:number):Observable<any>{
        return from(this.userRepository.delete(Number(id)))
    }
}
