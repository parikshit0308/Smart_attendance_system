import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // Import DynamoDBClient
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'; // Import DynamoDBDocumentClient and PutCommand
import { randomBytes } from 'crypto'; // To generate random user_id
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // Import S3Client for image upload

// Initialize DynamoDB and S3 clients
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const BUCKET_NAME = 'gsmcp'; // Use the provided S3 bucket name

// Function to upload images to S3
async function uploadImagesToS3(studentId, images) {
  const s3Urls = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const fileExtension = image.filename.split('.').pop();
    const s3Key = `students/${studentId}/image_${i + 1}.${fileExtension}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(image.file, 'base64'), // Assuming image is base64 encoded
      ContentType: image.contentType,
      ACL: 'public-read', // Makes image publicly accessible
    };

    try {
      const data = await s3.send(new PutObjectCommand(uploadParams));
      s3Urls.push(`https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`);
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Error uploading image to S3');
    }
  }

  return s3Urls;
}

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
    const { class: studentClass, department, email, name, password, phoneno, rollno, images } = parsedBody;

    // Check if all required fields are present
    if (!studentClass || !department || !email || !name || !password || !phoneno || !rollno || !images || images.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields or images" }) };
    }

    const studentId = randomBytes(16).toString('hex'); // Generate a random studentId
    console.log("Generated studentId:", studentId);

    // Upload images to S3 and get the URLs
    let imageUrls = [];
    try {
      imageUrls = await uploadImagesToS3(studentId, images);
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ message: "Error uploading images" }) };
    }

    // Create the user item to be added to DynamoDB
    const userItem = {
      studentId,    // Unique student ID
      class: studentClass,    // Student's class
      department,   // Department
      email,        // Email
      name,         // Name
      password,     // Password
      phoneno,      // Phone number
      rollno,       // Roll number
      images: imageUrls, // Image URLs from S3
    };

    const params = {
      TableName: 'studentTable', // Table name updated to 'studentTable'
      Item: userItem,
    };

    // Use the PutCommand to insert the item into DynamoDB
    const command = new PutCommand(params);
    await dynamoDB.send(command);

    console.log("Data saved successfully");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User created successfully', studentId }), // Send back the studentId
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create user', details: error.message }),
    };
  }
};
