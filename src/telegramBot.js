import TelegramBot from 'node-telegram-bot-api';
import * as config from '../config.js';

let bot;
let KNIFE_FILTERS = {...config.KNIFE_FILTERS};
let pollKnifeMap = new Map();

export const initializeBot = () => {
    bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

    bot.on('poll_answer', async (pollAnswer) => {
        console.log('Received poll answer:', pollAnswer);
        const knife = pollKnifeMap.get(pollAnswer.poll_id);
        
        if (knife && pollAnswer.option_ids[0] === 1) { // 1 corresponds to "No"
            delete KNIFE_FILTERS[knife];
            console.log(`Removed ${knife} from KNIFE_FILTERS`);
            pollKnifeMap.delete(pollAnswer.poll_id); // Clean up the mapping
        } else if (!knife) {
            console.log('Could not find the corresponding knife for this poll');
        }
    });
};

export const sendTelegramMessage = async (message, imageUrl) => {
    try {
        await bot.sendPhoto(config.TELEGRAM_CHAT_ID, imageUrl, { caption: message });
        console.log(`Telegram message sent for ${message}`);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

export const sendPoll = async (knife) => {
    try {
        var sentPoll = await bot.sendPoll(
            config.TELEGRAM_CHAT_ID,
            `Is this ${knife} interesting?`,
            ['Yes', 'No'],
            { is_anonymous: false }
        );
        pollKnifeMap.set(sentPoll.poll.id, knife);
        console.log(`Poll sent for ${knife} with ID ${sentPoll.poll.id}`);
    } catch (error) {
        console.error('Error sending poll:', error);
    }
};

export const getKnifeFilters = () => KNIFE_FILTERS;