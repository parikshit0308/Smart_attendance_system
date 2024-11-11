import { Injectable } from '@angular/core';
declare var cv: any;

@Injectable({
  providedIn: 'root'
})
export class OpencvService {

  constructor() { }

  initOpenCV(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (cv && cv.onRuntimeInitialized) {
        cv.onRuntimeInitialized = () => {
          resolve();
        };
      } else {
        reject('OpenCV.js failed to load');
      }
    });
  }

  /**
   * Compare two images using OpenCV
   * @param uploadedImage The uploaded image from the student sign-up
   * @param capturedImage The captured image from attendance
   */
  compareFaces(uploadedImage: HTMLImageElement, capturedImage: HTMLImageElement): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      await this.initOpenCV();

      try {
        // Load images into Mat objects
        const uploadedMat = cv.imread(uploadedImage);
        const capturedMat = cv.imread(capturedImage);

        // Convert images to grayscale for simplicity
        const grayUploadedMat = new cv.Mat();
        const grayCapturedMat = new cv.Mat();
        cv.cvtColor(uploadedMat, grayUploadedMat, cv.COLOR_RGBA2GRAY);
        cv.cvtColor(capturedMat, grayCapturedMat, cv.COLOR_RGBA2GRAY);

        // Initialize face detection classifier
        const faceCascade = new cv.CascadeClassifier();
        faceCascade.load('assets/haarcascade_frontalface_default.xml'); // Path to Haar Cascade

        // Detect faces in both images
        const uploadedFaces = new cv.RectVector();
        const capturedFaces = new cv.RectVector();
        const scaleFactor = 1.1;
        const minNeighbors = 3;
        const minSize = new cv.Size(30, 30);

        faceCascade.detectMultiScale(grayUploadedMat, uploadedFaces, scaleFactor, minNeighbors, 0, minSize);
        faceCascade.detectMultiScale(grayCapturedMat, capturedFaces, scaleFactor, minNeighbors, 0, minSize);

        // If faces are detected in both images, compare them
        if (uploadedFaces.size() > 0 && capturedFaces.size() > 0) {
          const uploadedFace = uploadedFaces.get(0);
          const capturedFace = capturedFaces.get(0);

          // Crop the faces
          const uploadedFaceMat = uploadedMat.roi(uploadedFace);
          const capturedFaceMat = capturedMat.roi(capturedFace);

          // Compare the faces using MSE (Mean Squared Error)
          const mse = this.calculateMSE(uploadedFaceMat, capturedFaceMat);

          uploadedFaceMat.delete();
          capturedFaceMat.delete();

          if (mse < 1000) { // Threshold to consider faces as matching
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          reject('No face detected in one or both images');
        }

        // Release memory
        grayUploadedMat.delete();
        grayCapturedMat.delete();
        uploadedMat.delete();
        capturedMat.delete();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Calculate Mean Squared Error (MSE) between two images
   * @param img1 The first image (uploaded face)
   * @param img2 The second image (captured face)
   * @returns The MSE value
   */
  private calculateMSE(img1: any, img2: any): number {
    const diff = new cv.Mat();
    cv.absdiff(img1, img2, diff);
    const diffSquared = new cv.Mat();
    cv.multiply(diff, diff, diffSquared);
    const mse = cv.sumElems(diffSquared).val[0] / (img1.rows * img1.cols);
    diff.delete();
    diffSquared.delete();
    return mse;
  }
}
