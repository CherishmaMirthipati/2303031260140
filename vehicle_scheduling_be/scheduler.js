const axios = require("axios");
require("dotenv").config();

const BASE_URL = "http://4.224.186.213/evaluation-service";
const TOKEN = process.env.AUTH_TOKEN;

async function Log(stack, level, packageName, message) {
    try {
        await axios.post(
            `${BASE_URL}/logs`,
            { stack, level, package: packageName, message },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (error) { }
}

async function fetchDepots() {
    await Log("backend", "info", "service", "Fetching depot details");
    const response = await axios.get(`${BASE_URL}/depots`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return response.data.depots;
}

async function fetchVehicles() {
    await Log("backend", "info", "service", "Fetching vehicle maintenance tasks");
    const response = await axios.get(`${BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return response.data.vehicles;
}

function optimizeSchedule(vehicles, capacity) {
    const n = vehicles.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const duration = vehicles[i - 1].Duration;
        const impact = vehicles[i - 1].Impact;

        for (let hours = 0; hours <= capacity; hours++) {
            dp[i][hours] = dp[i - 1][hours];

            if (duration <= hours) {
                dp[i][hours] = Math.max(
                    dp[i][hours],
                    impact + dp[i - 1][hours - duration]
                );
            }
        }
    }

    let selectedTasks = [];
    let remainingHours = capacity;

    for (let i = n; i > 0; i--) {
        if (dp[i][remainingHours] !== dp[i - 1][remainingHours]) {
            const task = vehicles[i - 1];
            selectedTasks.push(task);
            remainingHours -= task.Duration;
        }
    }

    selectedTasks.reverse();

    return {
        maxImpact: dp[n][capacity],
        totalDuration: selectedTasks.reduce((sum, task) => sum + task.Duration, 0),
        selectedTasks
    };
}

async function main() {
    try {
        await Log("backend", "info", "handler", "Vehicle scheduler execution started");

        const depots = await fetchDepots();
        const vehicles = await fetchVehicles();

        await Log("backend", "info", "service", "Depot and vehicle data fetched successfully");

        const schedules = depots.map((depot) => {
            const result = optimizeSchedule(vehicles, depot.MechanicHours);

            return {
                depotId: depot.ID,
                availableMechanicHours: depot.MechanicHours,
                usedMechanicHours: result.totalDuration,
                remainingMechanicHours: depot.MechanicHours - result.totalDuration,
                maxOperationalImpact: result.maxImpact,
                selectedTaskCount: result.selectedTasks.length,
                selectedTasks: result.selectedTasks.map((task) => ({
                    taskId: task.TaskID,
                    duration: task.Duration,
                    impact: task.Impact
                }))
            };
        });

        await Log("backend", "info", "handler", "Vehicle schedules calculated successfully");

        process.stdout.write(
            JSON.stringify(
                {
                    message: "Vehicle maintenance schedule generated successfully",
                    depotCount: depots.length,
                    vehicleTaskCount: vehicles.length,
                    schedules
                },
                null,
                2
            )
        );
    } catch (error) {
        await Log("backend", "error", "handler", "Vehicle scheduler execution failed");

        process.stdout.write(
            JSON.stringify(
                {
                    error: "Failed to generate vehicle maintenance schedule",
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