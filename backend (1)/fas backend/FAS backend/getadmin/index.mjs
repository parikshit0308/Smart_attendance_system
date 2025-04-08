import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDB = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" })
);

export const handler = async (event) => {
  const origin = event.headers?.origin || "";
  const isLocalhost = origin.startsWith("http://localhost");

  const corsHeaders = {
    "Access-Control-Allow-Origin": isLocalhost ? origin : "",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Access-Control-Allow-Credentials": true,
  };

  // Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Request body missing" }),
      };
    }

    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing email or password" }),
      };
    }

    const params = {
      TableName: "admintable",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);

    if (result.Items && result.Items.length > 0) {
      const admin = result.Items[0];

      if (password === admin.password) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Admin login successful", name: admin.name }),
        };
      } else {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Invalid password" }),
        };
      }
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Admin not found" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
