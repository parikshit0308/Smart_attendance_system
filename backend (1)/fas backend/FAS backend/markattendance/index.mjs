import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = "mark_attendance";

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const origin = event.headers?.origin || "";
  const isLocalhost = origin.startsWith("http://localhost");

  const corsHeaders = {
    "Access-Control-Allow-Origin": isLocalhost ? origin : "",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Credentials": true,
  };

  // Preflight request (CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const method = event.httpMethod || event.requestContext?.http?.method;

    if (method === "POST") {
      const body = JSON.parse(event.body || '{}');

      const {
        studentId,
        session,
        Attendance_status,
        date,
        rollno,
        studentname,
        subject
      } = body;

      if (!studentId || !session || !Attendance_status || !date || !rollno || !studentname || !subject) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Missing required fields" }),
        };
      }

      const putParams = {
        TableName: TABLE_NAME,
        Item: {
          studentId,
          session,
          Attendance_status,
          date,
          rollno,
          studentname,
          subject
        }
      };

      await dynamoDB.send(new PutCommand(putParams));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Attendance marked successfully",
          studentId,
          session,
          date
        }),
      };

    } else if (method === "GET") {
      const { studentId } = event.queryStringParameters || {};

      if (!studentId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Missing required query parameter: studentId" }),
        };
      }

      const queryParams = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "studentId = :sid",
        ExpressionAttributeValues: {
          ":sid": studentId
        }
      };

      const result = await dynamoDB.send(new QueryCommand(queryParams));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          studentId,
          totalRecords: result.Items.length,
          attendanceRecords: result.Items
        }),
      };
    } else {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
    }

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
