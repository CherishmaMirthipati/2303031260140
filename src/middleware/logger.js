const axios = require("axios");

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

async function Log(stack, level, packageName, message) {
    try {
        const response = await axios.post(
            LOG_API_URL,
            {
                stack: stack,
                level: level,
                package: packageName,
                message: message
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Log created:", response.data);

        return response.data;

    } catch (error) {

        console.error(
            "Logging Error:",
            error.response?.data || error.message
        );
    }
}

module.exports = Log;