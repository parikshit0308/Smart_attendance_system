import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDB = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "ap-south-1" })
);

export const handler = async (event) => {
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
        body: JSON.stringify({ message: "Request body missing" }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid JSON format" }),
      };
    }

    const { email, password } = parsedBody;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing email or password" }),
      };
    }

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
          headers: corsHeaders,
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
          headers: corsHeaders,
          body: JSON.stringify({ message: "Invalid password" }),
        };
      }
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Student not found" }),
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
