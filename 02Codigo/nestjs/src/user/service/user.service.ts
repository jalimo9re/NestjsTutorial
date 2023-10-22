import { Injectable } from '@nestjs/common';
import { UserEntity } from '../model/user.interface';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable,from, map, switchMap } from 'rxjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
         private readonly userRepository: Repository<UserEntity>,
    ){}

    create(user:User):Observable<User>{
        return from(this.userRepository.save(user));
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
