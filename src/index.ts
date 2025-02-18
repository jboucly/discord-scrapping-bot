import 'dotenv/config';
import 'module-alias/register';

import { DiscordClient } from './discord-bot';

const client = new DiscordClient();
client.init();
