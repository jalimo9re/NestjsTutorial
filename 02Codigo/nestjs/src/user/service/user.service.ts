import { ForbiddenException, Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
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
                // TODO Solo para dev/test

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
    //TODO : comprobar el caso de que no exista el usuario
    private validateUser( email:string, password:string):Observable<User>{
        return from(
            this.findByEmail(email).pipe(
                switchMap((user:User)=>{
                    return this.authService
                    .comparePasswords(password,user.password)
                    .pipe(
                        map((match:any|boolean)=>{
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
                    delete user.password;   
                });
                return users;
            }),
        );
    }

    findOne(id:number):Observable <User>{
        return from(this.userRepository.findOneBy({id:id })).pipe(
            map((user:User)=>{
                if(user){
                    const {password ,...result}=user;
                    return result;
                }else{
                    return null;
                }
            }),
        );
    }

    findOneByEmail(user:User):Observable <User>{
        return from(this.userRepository.findOne({
            select :['id','name','email','role'],
            where: { email: user.email }
        }));
    }
    emailExits(user:User):Observable <Boolean>{
        return from(this.userRepository.findOne({
            where: { email: Like(`%${user.email}%`) }
        }).then((resp)=>{
            if(resp !== null)
                return true;
            else
                return false;
        })
        );
    }
    updateOne(id:number,user:User,userjwt:User):Observable<any>{
        if(userjwt.id!=id){
            throw ForbiddenException;
        }
        delete user.email;
        delete user.password;
        delete user.role;
        delete user.id;
        return from(this.userRepository.update(Number(id),user)).pipe(
            switchMap(()=>this.findOne(id)),
        );
    }
    updatePassword(id:number,user:User,userjwt:User):Observable<any>{
        if(userjwt.id!=id){
            throw ForbiddenException;
        }
        return from(this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash:string)=>{
                delete user.email;
                delete user.name;
                delete user.role;
                delete user.id;
                return from(this.userRepository.update(Number(id),user)).pipe(
                    switchMap(()=>this.findOne(id)),
                );
            })));
        
    }
    updateRoleOfUser(id:number,user:User):Observable<any>{
        delete user.email;
        delete user.password;
        delete user.name;
        return from(this.userRepository.update(Number(id),user));
    }

    deleteOne(id:number):Observable<any>{
        return from(this.userRepository.delete(Number(id)))
    }
}
