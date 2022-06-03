import {Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {Request, Response} from "express";
import {JwtGuard} from "./jwt.guard";
import {GoogleUserGuard} from "./googleUser.guard";
import {GoogleGuard} from "./google.guard";

@Controller('google')
export class GoogleController {
    @Get('redirect')
    @UseGuards(GoogleUserGuard)
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        if(req.user) {
            res.redirect(`${process.env.FRONTEND_URL}/authComplete?id=${req.user}`)
        }else{
            res.redirect(`${process.env.FRONTEND_URL}/authFailed`)
        }
    }

    @Get('advancedRedirect')
    @UseGuards(GoogleGuard)
    async googleAdvancedAuthRedirect(@Req() req: Request, @Res() res: Response) {
        if(req.user) {
            res.redirect(`${process.env.FRONTEND_URL}/scanner?token=${req.user}`)
        }else{
            res.redirect(`${process.env.FRONTEND_URL}/authFailed`)
        }
    }

    @Get('isAuthenticated')
    @UseGuards(JwtGuard)
    async isAuthenticated(@Req() req: Request, @Res() res: Response) {
        res.status(200);
        res.end();
    }
}
