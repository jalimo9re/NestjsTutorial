import { Controller,Post,Body, Get, Param,Put ,Delete, UseGuards, Req, Query} from '@nestjs/common';
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
import { Pagination } from 'nestjs-typeorm-paginate';

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

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Get(':id')
    findOne(@Param() params):Observable<User>{
        return this.userService.findOne(params.id);
    }


    // TODO solo el propio usuario podra actualizarse a si mismo DONE
    // tambien podria hacerse con un guard, pero lo he hecho asi para probar otras posibilidades
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    updateOne(@Usr() userjwt:User,@Param('id') id:string,@Body() user:User):Observable<any>{
        return this.userService.updateOne(Number(id),user,userjwt);
    }

    @UseGuards(JwtAuthGuard)
    @Put('password/:id')
    updatePassword(@Usr() userjwt:User,@Param('id') id:string,@Body() user:User):Observable<any>{
        return this.userService.updatePassword(Number(id),user,userjwt);
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

    /*// TODO 
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Get()
    findAll():Observable<User[]>{
        return this.userService.findAll();
    }*/
    @Get()
    index(
        @Query('page') page=1,
        @Query('limit') limit=100,
    ):Observable<Pagination<User>>{
        limit= limit > 100 ? 100 : limit;

        const route= `${process.env.API_URL}:${process.env.PORT}/api/users`;
        return this.userService.paginate({
            page : Number(page),
            limit : Number(limit),
            route
        });
    }    

    @Post('exists')//TODO mirar porque devuelve el primer usuario sino se le pasa un email
    emailExits(@Body() user:User):Observable<Boolean>{
        return this.userService.emailExits(user);
    }
    // TODO findOneByEmail DONE
    // TODO updateRoleofUser DONE
    // TODO updatePassword
    // TODO userexist DONE
}
