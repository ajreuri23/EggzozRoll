import axios from 'axios';
import { CSGOROLL_API_URL } from './config.js';

export const makeRequest = async (marketName) => {
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
        const response = await axios.get(CSGOROLL_API_URL, { params, headers });
        return response.data;
    } catch (error) {
        console.error(`Error making request for ${marketName}:`, error);
        return null;
    }
};