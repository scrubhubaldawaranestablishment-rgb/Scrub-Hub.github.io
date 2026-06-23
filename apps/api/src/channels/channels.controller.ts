import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto, UpdateChannelDto, WizardStepDto } from './dto/channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  findAll(@Req() req: { user: { id: string } }) {
    return this.channelsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.channelsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateChannelDto, @Req() req: { user: { id: string } }) {
    return this.channelsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChannelDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.channelsService.update(id, req.user.id, dto);
  }

  @Post(':id/wizard')
  wizardStep(
    @Param('id') id: string,
    @Body() dto: WizardStepDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.channelsService.updateWizardStep(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.channelsService.remove(id, req.user.id);
  }
}
