const axios = require("axios");
require("dotenv").config();

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

const typeWeights = {
    Placement: 3,
    Result: 2,
    Event: 1
};

async function Log(stack, level, packageName, message) {
    try {
        await axios.post(
            LOG_URL,
            {
                stack,
                level,
                package: packageName,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (error) {
        // Logging failures are ignored to avoid blocking the main flow.
    }
}

function calculateScore(notification) {
    const typeScore = typeWeights[notification.Type] || 0;
    const timeScore = new Date(notification.Timestamp).getTime();
    return typeScore * 10000000000000 + timeScore;
}

function getTopNotifications(notifications, limit = 10) {
    return notifications
        .map((notification) => ({
            ...notification,
            priorityScore: calculateScore(notification)
        }))
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, limit);
}

async function main() {
    try {
        await Log("backend", "info", "service", "Fetching notifications from protected API");

        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${process.env.AUTH_TOKEN}`
            }
        });

        const notifications = response.data.notifications || [];
        const topNotifications = getTopNotifications(notifications, 10);

        await Log("backend", "info", "service", "Top priority notifications calculated");

        process.stdout.write(
            JSON.stringify(
                {
                    count: topNotifications.length,
                    topNotifications
                },
                null,
                2
            )
        );
    } catch (error) {
        await Log("backend", "error", "handler", "Priority inbox calculation failed");

        process.stdout.write(
            JSON.stringify(
                {
                    error: "Failed to calculate priority inbox",
                    status: error.response?.status,
                    details: error.response?.data || error.message
                },
                null,
                2
            )
        );
    }
}

main();