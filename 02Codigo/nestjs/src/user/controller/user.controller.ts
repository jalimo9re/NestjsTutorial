import { Controller,Post,Body, Get, Param,Put ,Delete} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of } from 'rxjs';
import { DeleteDateColumn } from 'typeorm';
import { User } from '../model/user.interface';

@Controller('users')
export class UserController {
    constructor(private userService:UserService){}
    

    @Post()
    create(@Body() user:User):Observable<User |{error:any}>{
        return this.userService.create(user).pipe(
            map((user:User)=>user),
            catchError((err)=>of({error:err.message})),
        );
    }

    @Post('login')
    login(@Body() user:User):Observable<string>{
        return this.userService.login(user).pipe(
            map((jwt:string)=>{
                return jwt;
            })
        );
    }
    @Get(':id')
    findOne(@Param() params):Observable<User>{
        return this.userService.findOne(params.id);
    }

    @Get()
    findAll():Observable<User[]>{
        return this.userService.findAll();
    }

    @Put(':id')
    updateOne(@Param('id') id:string,@Body() user:User ):Observable<any>{
        return this.userService.updateOne(Number(id),user);
    }

    @Delete(':id')
    delteOne(@Param('id') id:string):Observable<any>{
        return this.userService.deleteOne(Number(id));
    }
}
