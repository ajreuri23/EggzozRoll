import TelegramBot from 'node-telegram-bot-api';
import * as config from './config.js';

let bot;
let KNIFE_FILTERS = {...config.KNIFE_FILTERS};

export const initializeBot = () => {
    bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

    bot.on('poll_answer', (pollAnswer) => {
        console.log('Received poll answer:', pollAnswer);
        const knifeNames = Object.keys(KNIFE_FILTERS);
        const answeredKnife = knifeNames.find(knife => pollAnswer.poll.question.includes(knife));
        
        if (answeredKnife && pollAnswer.option_ids[0] === 1) { // 1 corresponds to "No"
            delete KNIFE_FILTERS[answeredKnife];
            console.log(`Removed ${answeredKnife} from KNIFE_FILTERS`);
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
        await bot.sendPoll(
            config.TELEGRAM_CHAT_ID,
            `Is this ${knife} interesting?`,
            ['Yes', 'No'],
            { is_anonymous: false }
        );
    } catch (error) {
        console.error('Error sending poll:', error);
    }
};

export const getKnifeFilters = () => KNIFE_FILTERS;