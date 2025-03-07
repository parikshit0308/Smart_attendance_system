import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = "mark_attendance"; // Ensure this matches your DynamoDB table name

export const handler = async (event) => {
  try {
    // Ensure event body exists
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "Request body missing" }) };
    }

    // Parse request body
    const { studentId, session, attendance_status, department, name, rollno } = JSON.parse(event.body);

    // Validate required fields
    if (!studentId || !session || !attendance_status || !department || !name || !rollno) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
    }

    // Generate a timestamp for when attendance is marked
    const timestamp = new Date().toISOString();

    // DynamoDB parameters to store or update attendance record
    const params = {
      TableName: TABLE_NAME,
      Item: {
        studentId,        // Primary Key: Student ID
        session,          // Sort Key: Session
        attendance_status, // Attendance status (e.g., "Present" or "Absent")
        department,       // Student's department
        name,            // Student's name
        rollno,          // Student's roll number
        timestamp        // Timestamp for when the attendance was marked
      }
    };

    // Put (Insert or Update) the attendance record in DynamoDB
    const command = new PutCommand(params);
    await dynamoDB.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Attendance marked successfully", studentId, session, timestamp }),
    };

  } catch (error) {
    // Handle errors
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};
