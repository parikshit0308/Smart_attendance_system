import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" })
);

export const handler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "Request body missing" }) };
    }

    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing email or password" }) };
    }

    const params = {
      TableName: "admintable",
      IndexName: "email-index", // Ensure this index exists
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    // Query DynamoDB
    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);

    if (result.Items && result.Items.length > 0) {
      const admin = result.Items[0];

      // Direct password comparison (⚠️ Consider using hashed passwords for security)
      if (password === admin.password) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Admin login successful", name: admin.name }),
        };
      } else {
        return { statusCode: 401, body: JSON.stringify({ message: "Invalid password" }) };
      }
    } else {
      return { statusCode: 404, body: JSON.stringify({ message: "Admin not found" }) };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
