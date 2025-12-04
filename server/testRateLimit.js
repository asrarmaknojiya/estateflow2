const axios = require("axios");

const BASE_URL = "http://localhost:4500"; // yahan apna actual port daal
const TOTAL_REQUESTS = 1;

const testLoginRateLimit = async () => {
    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
        console.log(`\n🔹 Request #${i} sending...`);

        try {
            const res = await axios.post(`${BASE_URL}/login`, {
                email: "admin@gmail.com",
                password: "0000",
            });

            console.log(
                `✅ Request #${i} -> Status: ${res.status}, Data:`,
                res.data
            );
        } catch (err) {
            console.log(`❌ Request #${i} FAILED`);

            if (err.response) {
                // Server ne response bheja (status 4xx/5xx)
                console.log("Status:", err.response.status);
                console.log("Data:", err.response.data);
            } else if (err.request) {
                // Request gayi, lekin response hi nahi aaya
                console.log("No response received from server");
                console.log("Error code:", err.code);
            } else {
                // Request banate time hi error
                console.log("Error message:", err.message);
            }
        }
    }
}

testLoginRateLimit();
