import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto, @Req() req: { user: { id: string } }) {
    return this.feedbackService.create(req.user.id, dto);
  }

  @Get()
  getAll(@Req() req: { user: { id: string } }) {
    return this.feedbackService.getForUser(req.user.id);
  }
}
