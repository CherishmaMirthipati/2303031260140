require("dotenv").config();

const express = require("express");
const Log = require("./middleware/logger");

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
    await Log(
        "backend",
        "info",
        "route",
        "Home route accessed successfully"
    );

    res.json({
        message: "Backend service is running!"
    });
});

app.post("/calculate", async (req, res) => {

    await Log(
        "backend",
        "info",
        "controller",
        "Calculate API called"
    );

    const { a, b } = req.body;

    if (typeof a !== "number" || typeof b !== "number") {

        await Log(
            "backend",
            "error",
            "handler",
            "Invalid input. Expected numbers."
        );

        return res.status(400).json({
            error: "Both a and b must be numbers"
        });
    }

    const result = a + b;

    await Log(
        "backend",
        "debug",
        "service",
        "Addition completed successfully"
    );

    res.json({
        result
    });

});

app.listen(process.env.PORT, async () => {

    console.log(`Server running on port ${process.env.PORT}`);

    await Log(
        "backend",
        "info",
        "config",
        "Server started successfully"
    );

});