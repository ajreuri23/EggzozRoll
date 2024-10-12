import { checkNewItems } from './itemChecker.js';
import { initializeBot } from './telegramBot.js';

const main = async () => {
    initializeBot();

    while (true) {
        try {
            await checkNewItems();
            await new Promise(resolve => setTimeout(resolve, 60000));  // Wait for 60 seconds before checking again
        } catch (error) {
            console.error('An error occurred:', error);
            await new Promise(resolve => setTimeout(resolve, 300000));  // Wait for 5 minutes before retrying if an error occurs
        }
    }
};

main();