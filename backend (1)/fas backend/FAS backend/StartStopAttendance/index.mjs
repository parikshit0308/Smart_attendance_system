import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-south-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "AttendanceStatus";
const ATTENDANCE_ID = "1"; // Unique ID for attendance status

export async function handler(event) {
    console.log("🚀 Full Event Received:", JSON.stringify(event, null, 2));

    const origin = event.headers?.origin || "*";

    // Handle preflight CORS request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": true,
            },
            body: "",
        };
    }

    try {
        const httpMethod = event.httpMethod || event.requestContext?.http?.method;
        const path = event.rawPath || event.path || event.requestContext?.http?.path;

        if (!httpMethod || !path) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": origin,
                },
                body: JSON.stringify({ message: "Invalid request format. API Gateway may not be configured correctly." }),
            };
        }

        if (httpMethod !== "GET" && httpMethod !== "POST") {
            return {
                statusCode: 405,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": origin,
                },
                body: JSON.stringify({ message: "Method not allowed. Use GET or POST." }),
            };
        }

        let action;
        if (path.endsWith("/startAttendance")) {
            action = "start";
        } else if (path.endsWith("/stopAttendance")) {
            action = "stop";
        } else {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": origin,
                },
                body: JSON.stringify({ message: "Invalid API path." }),
            };
        }

        const isAttendanceActive = action === "start";

        const params = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id: ATTENDANCE_ID },
            UpdateExpression: "SET isAttendanceActive = :status",
            ExpressionAttributeValues: { ":status": isAttendanceActive },
        });

        await dynamoDB.send(params);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ message: `Attendance ${action}ed successfully.` }),
        };
    } catch (error) {
        console.error("❌ Error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ message: "Internal Server Error", details: error.message }),
        };
    }
}
