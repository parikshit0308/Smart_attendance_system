import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "ap-south-1" })
);

export const handler = async (event) => {
  try {
    // Ensure event.body exists and is a valid JSON
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body missing" }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON format" }),
      };
    }

    // Extract email and password
    const { email, password } = parsedBody;

    // Validate input fields
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing email or password" }),
      };
    }

    // Query DynamoDB
    const params = {
      TableName: "studentTable",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);

    if (result.Items && result.Items.length > 0) {
      const student = result.Items[0];

      if (password === student.password) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Student login successful",
            studentId: student.studentId,
            name: student.name,
            department: student.department,
            class: student.class,
            phoneno: student.phoneno,
            rollno: student.rollno,
          }),
        };
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid password" }),
        };
      }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Student not found" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
