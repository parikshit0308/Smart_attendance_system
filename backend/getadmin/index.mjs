import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client with region
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

export const handler = async (event) => {
  console.log("Function started");

  try {
    // Check if event.body is present
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "Request body missing" }) };
    }

    // Parse the request body to extract the email and password
    const { email, password } = JSON.parse(event.body);
    
    // Validate if both email and password are provided
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing email or password" }) };
    }

    // Prepare parameters for the DynamoDB query
    const params = {
      TableName: 'admintable',     // Table name set to 'adminTable'
      IndexName: 'email-index',    // Assuming there's an index on email
      KeyConditionExpression: "email = :email", // Query condition for the email
      ExpressionAttributeValues: { ":email": email },
    };

    // Query DynamoDB to fetch the admin based on the email
    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);

    if (result.Items && result.Items.length > 0) {
      const admin = result.Items[0];

      // Direct password comparison (⚠️ Not recommended for production)
      if (password === admin.password) {
        // Return admin details if password matches
        return {
          statusCode: 200,
          body: JSON.stringify({
            adminId: admin.adminId,
            branch: admin.branch,
            email: admin.email,
            name: admin.name,
            phoneno: admin.phoneno
          }),
        };
      } else {
        // If password does not match
        return { statusCode: 401, body: JSON.stringify({ message: "Invalid password" }) };
      }
    } else {
      // If no admin is found with the provided email
      return { statusCode: 404, body: JSON.stringify({ message: "Admin not found" }) };
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
