import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';

const AWS_REGION = "ap-south-1";
const s3 = new S3Client({ region: AWS_REGION });
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

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
        body: JSON.stringify({ message: "No body in the request" }),
      };
    }

    const parsedBody = JSON.parse(event.body);
    const { class: studentClass, department, email, name, password, phoneno, rollno, images } = parsedBody;

    if (!studentClass || !department || !email || !name || !password || !phoneno || !rollno) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    if (!Array.isArray(images) || images.length > 3) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Images must be an array of max 3 items" }),
      };
    }

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "S3 bucket name is not set in environment variables" }),
      };
    }

    const studentId = randomBytes(16).toString('hex');
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const imageBuffer = Buffer.from(images[i], 'base64');
      const fileName = `students/${studentId}/image_${i + 1}.jpg`;

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      const imageUrl = `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
      imageUrls.push(imageUrl);
    }

    const studentItem = {
      studentId,
      studentClass,
      department,
      email,
      name,
      password,
      phoneno,
      rollno,
      images: imageUrls,
    };

    await dynamoDB.send(new PutCommand({ TableName: 'studentTable', Item: studentItem }));

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Student created successfully', studentId, images: imageUrls }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Could not create student', details: error.message }),
    };
  }
};
