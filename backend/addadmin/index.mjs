import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // Import DynamoDBClient
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'; // Import DynamoDBDocumentClient and PutCommand
import { randomBytes } from 'crypto'; // To generate random adminId

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

export const handler = async (event) => {
  console.log("Function started");

  try {
    // Check if the event.body is present
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "No body in the request" }) };
    }

    // Log the event body for debugging
    console.log("Received event body:", event.body);

    // Parse the incoming request body
    const parsedBody = JSON.parse(event.body);

    // Destructure the attributes from the incoming body
    const { branch, email, name, password, phoneno } = parsedBody;

    // Check if all required fields are present
    if (!branch || !email || !name || !password || !phoneno) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
    }

    const adminId = randomBytes(16).toString('hex'); // Generate a random adminId
    console.log("Generated adminId:", adminId);

    // Create the admin item to be added to DynamoDB
    const adminItem = {
      adminId,     // Unique admin ID
      branch,      // Admin's branch
      email,       // Email
      name,        // Name
      password,    // Password
      phoneno,     // Phone number
    };

    const params = {
      TableName: 'admintable', // Table name set to 'adminTable'
      Item: adminItem,
    };

    // Use the PutCommand to insert the item into DynamoDB
    const command = new PutCommand(params);
    await dynamoDB.send(command);

    console.log("Data saved successfully");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Admin created successfully', adminId }), // Send back the adminId
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create admin', details: error.message }),
    };
  }
};
