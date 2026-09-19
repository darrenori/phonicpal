/**
 * Loads face-api and its two small models (face detector and expression net).
 * Kept in its own module so it is fetched only when Sparky Helps turns on, and left
 * out entirely from the single-file artifact build, where the camera is unavailable.
 */

import * as faceapi from '@vladmandic/face-api';
import detectorManifest from './models/tiny_face_detector_model-weights_manifest.json';
import expressionManifest from './models/face_expression_model-weights_manifest.json';
import detectorWeightsUrl from './models/tiny_face_detector_model.bin?url';
import expressionWeightsUrl from './models/face_expression_model.bin?url';

export type FaceApi = typeof faceapi;

async function readBinary(url: string): Promise<ArrayBuffer> {
  // Small assets may be inlined as data URIs; decode those without a network request.
  if (url.startsWith('data:')) {
    const binary = atob(url.slice(url.indexOf(',') + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load model weights (${response.status})`);
  return response.arrayBuffer();
}

export async function loadFaceApi(): Promise<FaceApi> {
  // face-api bundles all of TensorFlow.js but only declares part of its namespace.
  const tf = faceapi.tf as unknown as { setBackend(name: string): Promise<boolean>; ready(): Promise<void> };
  try {
    if (!(await tf.setBackend('webgl'))) await tf.setBackend('cpu');
  } catch {
    await tf.setBackend('cpu');
  }
  await tf.ready();
  const [detector, expression] = await Promise.all([readBinary(detectorWeightsUrl), readBinary(expressionWeightsUrl)]);
  faceapi.nets.tinyFaceDetector.loadFromWeightMap(faceapi.tf.io.decodeWeights(detector, detectorManifest[0].weights as never));
  faceapi.nets.faceExpressionNet.loadFromWeightMap(faceapi.tf.io.decodeWeights(expression, expressionManifest[0].weights as never));
  return faceapi;
}
