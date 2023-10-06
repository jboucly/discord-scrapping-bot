import DailyListCommand from './daily/daily-list.command';
import DailyCommand from './daily/daily.command';
import MissionListCommand from './mission/mission-list.command';
import MissionCommand from './mission/mission.command';
import PingCommand from './ping/ping.command';

export const Commands = [PingCommand, DailyCommand, MissionCommand, MissionListCommand, DailyListCommand];
