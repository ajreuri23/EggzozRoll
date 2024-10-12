const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token and Chat ID
const TELEGRAM_BOT_TOKEN = '7201937507:AAE2reSehuIpgSn5bpc9xV_SYywRbOGuwus';
const TELEGRAM_CHAT_ID = -4561579077;

// CSGORoll API endpoint and headers
const URL = 'https://api.csgoroll.com/graphql';
const HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'apollographql-client-name': 'csgoroll-www',
    'apollographql-client-version': '36d18a36',
    'origin': 'https://www.csgoroll.com',
    'referer': 'https://www.csgoroll.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
};

// Define the knives and their conditions to search for
const KNIFE_FILTERS = {
    "Bayonet | Blue Steel": ["Field-Tested", "Minimal Wear", "Factory New"],
    "Bayonet | Night": ["Field-Tested", "Minimal Wear", "Factory New"],
    "Flip Knife | Crimson Web": ["Field-Tested", "Minimal Wear", "Factory New"],
    "Stiletto Knife | Damascus Steel": ["Field-Tested", "Minimal Wear", "Factory New"],
    "Stiletto Knife | Blue Steel": ["Field-Tested", "Minimal Wear", "Factory New"],
    "Huntsman Knife | Slaughter": ["Minimal Wear"]
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

async function sendTelegramMessage(message, imageUrl) {
    try {
        await bot.sendPhoto(TELEGRAM_CHAT_ID, imageUrl, { caption: message });
        console.log(`Telegram message sent for ${message}`);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

async function makeRequest(marketName) {
    const params = {
        operationName: 'TradeList',
        variables: JSON.stringify({
            first: 50,
            orderBy: "TOTAL_VALUE_DESC",
            status: "LISTED",
            minTotalValue: 450,
            maxTotalValue: 500,
            marketName: marketName,
            steamAppName: "CSGO",
            maxMarkupPercent: 12,
            t: Date.now()
        }),
        extensions: JSON.stringify({
            persistedQuery: {
                version: 1,
                sha256Hash: "163bee2a7d8cd65ccb5d4439ed43048d0ba9b1c8d059d35e92bca8dcd492d430"
            }
        })
    };

    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,he-IL;q=0.8,he;q=0.7',
        'apollographql-client-name': 'csgoroll-www',
        'apollographql-client-version': '36d18a36',
        'origin': 'https://www.csgoroll.com',
        'referer': 'https://www.csgoroll.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(URL, { params, headers });
        return response.data;
    } catch (error) {
        console.error(`Error making request for ${marketName}:`, error);
        return null;
    }
}

async function checkNewItems() {
    for (const [knife, conditions] of Object.entries(KNIFE_FILTERS)) {
        const marketName = knife.split('|')[0].trim();
        const data = await makeRequest(marketName);

        if (data && data.data && data.data.trades && data.data.trades.edges) {
            for (const edge of data.data.trades.edges) {
                const node = edge.node;
                const tradeItem = node.tradeItems[0];
                const fullMarketName = tradeItem.marketName;
                const color = tradeItem.itemVariant.color;

                if (fullMarketName.includes(knife) && conditions.includes(color)) {
                    const message = `New item found:
Market Name: ${fullMarketName}
Exterior: ${color}
Coins: ${tradeItem.value}`;
                    await sendTelegramMessage(message, tradeItem.itemVariant.iconUrl);
                }
            }
        }
    }
}

async function main() {
    while (true) {
        try {
            await checkNewItems();
            await new Promise(resolve => setTimeout(resolve, 60000));  // Wait for 60 seconds before checking again
        } catch (error) {
            console.error('An error occurred:', error);
            await new Promise(resolve => setTimeout(resolve, 300000));  // Wait for 5 minutes before retrying if an error occurs
        }
    }
}

main();