import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulePostDto } from './dto/schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('scheduling')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  @Post('channels/:channelId')
  schedule(
    @Param('channelId') channelId: string,
    @Body() dto: SchedulePostDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.schedulingService.schedule(channelId, req.user.id, dto);
  }

  @Get('channels/:channelId')
  getSchedule(
    @Param('channelId') channelId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.schedulingService.getSchedule(channelId, req.user.id);
  }

  @Delete(':postId')
  cancel(@Param('postId') postId: string, @Req() req: { user: { id: string } }) {
    return this.schedulingService.cancel(postId, req.user.id);
  }
}
