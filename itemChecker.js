import { makeRequest } from './csgoRollApi.js';
import { sendTelegramMessage, sendPoll, getKnifeFilters } from './telegramBot.js';

export const checkNewItems = async () => {
    const KNIFE_FILTERS = getKnifeFilters();
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
Value: $${node.totalValue}
Coins: ${tradeItem.value}`;
                    await sendTelegramMessage(message, tradeItem.itemVariant.iconUrl);
                    sendPoll(knife); // Send poll asynchronously
                }
            }
        }
    }
};