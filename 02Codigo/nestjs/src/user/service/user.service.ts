import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable,from, map, switchMap } from 'rxjs';
import { UserEntity } from '../model/user.entity';
import { User } from '../model/user.interface';
import { AuthService } from 'src/auth/services/auth.service';
import { Console } from 'console';

@Injectable()
export class UserService {
    constructor(
        private authService: AuthService,
        @InjectRepository(UserEntity)
         private readonly userRepository: Repository<UserEntity>,
    ){}

    create(user:User):Observable<User>{
        //return from(this.userRepository.save(user));
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash:string)=>{
                const newUser=new UserEntity();
                newUser.email   =user.email;
                newUser.name    =user.name;
                newUser.password=passwordHash;
                return from (this.userRepository.save(newUser)).pipe(
                    map((user:User)=>{
                        const {password ,...result}=user;   
                        return result;
                    })
                );
            })
        );
    }
    login(user:User):Observable<string>{
        console.log(process.env.JWT_SECRET);
        console.log(process.env.JWT_EXPIRES_IN);
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
