import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client with region
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

export const handler = async (event) => {
  console.log("Function started");

  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "Request body missing" }) };
    }

    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing email or password" }) };
    }

    const params = {
      TableName: 'studentTable',   // Hardcoded table name
      IndexName: 'email-index',    // Hardcoded index name
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    // Query DynamoDB
    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);

    if (result.Items && result.Items.length > 0) {
      const user = result.Items[0];

      // Direct password comparison (⚠️ Not recommended for production)
      if (password === user.password) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            studentId: user.studentId,
            class: user.class,
            department: user.department,
            email: user.email,
            name: user.name,
            phoneno: user.phoneno,
            rollno: user.rollno
          }),
        };
      } else {
        return { statusCode: 401, body: JSON.stringify({ message: "Invalid password" }) };
      }
    } else {
      return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
