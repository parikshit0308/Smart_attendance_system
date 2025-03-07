import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // Import DynamoDBClient
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'; // Import DynamoDBDocumentClient and PutCommand
import { randomBytes } from 'crypto'; // To generate random studentId

// Initialize DynamoDB client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

export const handler = async (event) => {
  try {
    // Check if the event.body is present
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "No body in the request" }) };
    }

    // Parse the incoming request body
    const parsedBody = JSON.parse(event.body);

    // Destructure the attributes from the incoming body
    const { class: studentClass, department, email, name, password, phoneno, rollno } = parsedBody;

    // Check if all required fields are present
    if (!studentClass || !department || !email || !name || !password || !phoneno || !rollno) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
    }

    const studentId = randomBytes(16).toString('hex'); // Generate a unique studentId

    // Create the student item to be added to DynamoDB
    const studentItem = {
      studentId,   // Unique student ID (String)
      studentClass, // Student's class
      department,  // Department
      email,       // Email
      name,        // Name
      password,    // Password
      phoneno,     // Phone number
      rollno,      // Roll number
    };

    const params = {
      TableName: 'studentTable', // Table name (change if needed)
      Item: studentItem,
    };

    // Use the PutCommand to insert the item into DynamoDB
    await dynamoDB.send(new PutCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Student created successfully', studentId }), // Return studentId
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create student', details: error.message }),
    };
  }
};
