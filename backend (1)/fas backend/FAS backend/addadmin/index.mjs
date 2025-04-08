import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

export const handler = async (event) => {
  console.log("Function started");

  const origin = event.headers?.origin || '';
  const isLocalhost = origin.startsWith("http://localhost");

  const corsHeaders = {
    "Access-Control-Allow-Origin": isLocalhost ? origin : "",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Credentials": true,
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "No body in the request" }),
      };
    }

    console.log("Received event body:", event.body);
    const parsedBody = JSON.parse(event.body);
    const { branch, email, name, password, phoneno } = parsedBody;

    if (!branch || !email || !name || !password || !phoneno) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const adminId = randomBytes(16).toString('hex');
    console.log("Generated adminId:", adminId);

    const adminItem = {
      adminId,
      branch,
      email,
      name,
      password,
      phoneno,
    };

    const params = {
      TableName: 'admintable',
      Item: adminItem,
    };

    await dynamoDB.send(new PutCommand(params));

    console.log("Data saved successfully");
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Admin created successfully', adminId }),
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Could not create admin', details: error.message }),
    };
  }
};
