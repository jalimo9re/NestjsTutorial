import { Controller,Post,Body, Get, Param,Put ,Delete, UseGuards, Req} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { DeleteDateColumn } from 'typeorm';
import { User, UserRole } from '../model/user.interface';
import { AuthService } from 'src/auth/services/auth.service';
import { UserEntity } from '../model/user.entity';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Usr } from 'src/auth/decorators/user.decorator';
import { Console } from 'console';

@Controller('users')
export class UserController {
    constructor(private userService:UserService,
       ){}
    
    @Post()
    create(@Body() user:User):Observable<User |{error:any}>{
        return this.userService.create(user).pipe(
            map((user:User)=>user),
            catchError((err)=>of({error:err.message})),
        );
    }

    @Post('login')
    login(@Body() user:User):Observable<{access_token : any}>{ 
        return this.userService.login(user).pipe(
            map((jwt:string)=>{
                return { access_token : jwt};
            })
        );
    }
    @Get(':id')
    findOne(@Param() params):Observable<User>{
        return this.userService.findOne(params.id);
    }
    // TODO 
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Get()
    findAll():Observable<User[]>{
        return this.userService.findAll();
    }

    // TODO solo el propio usuario podra actualizarse a si mismo DONE
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    updateOne(@Usr() userjwt:User,@Param('id') id:string,@Body() user:User):Observable<any>{
        return this.userService.updateOne(Number(id),user,userjwt);
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Delete(':id')
    deleteOne(@Param('id') id:string):Observable<any>{
        return this.userService.deleteOne(Number(id));
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Post('email')//TODO mirar porque devuelve el primer usuario sino se le pasa un email
    findOneByEmail(@Body() user:User):Observable<User>{
        return this.userService.findOneByEmail(user);
    }

    @hasRoles(UserRole.ADMIN)//TODO cambiar el guard de JwtAuthGuard para que sea siempre activo excepto en el login
    @UseGuards(JwtAuthGuard,RolesGuard)//TODO con un decorador quizas?
    @Put('role/:id') //TODO solo admitir un valor dentro de los valores 
    updateRoleOfUser(@Param('id')id:number,@Body()  user:User):Observable<any>{
        const roles=Object.values(UserRole);
        if(roles.includes(user.role)){
            return this.userService.updateRoleOfUser(id,user);
        }else{
            return of({error:`Role '${user.role}' not allowed`});
        }
        
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Post('exits')//TODO mirar porque devuelve el primer usuario sino se le pasa un email
    emailExits(@Body() user:User):Observable<Boolean>{
        return this.userService.emailExits(user);
    }
    // TODO findOneByEmail
    // TODO updateRoleofUser
    // TODO updatePassword
    // TODO userexist
}
