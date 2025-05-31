import * as tf from '@tensorflow/tfjs-core';

export const downsampleBilinear = ({ inputs, backend }) => {
  const { image } = inputs;
  console.log("image:", image);
  image.dataSync();
  const [height, width] = image.shape;

  const newHeight = Math.floor(height / 2);
  const newWidth = Math.floor(width / 2);

  const imageData = backend.readSync(image);
  console.log("imageData:", imageData);
  const outputValues = new Float32Array(newHeight * newWidth);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const y0 = y * 2;
      const x0 = x * 2;

      const i1 = imageData[y0 * width + x0] || 0;
      const i2 = imageData[(y0 + 1) * width + x0] || 0;
      const i3 = imageData[y0 * width + (x0 + 1)] || 0;
      const i4 = imageData[(y0 + 1) * width + (x0 + 1)] || 0;

      const avg = (i1 + i2 + i3 + i4) * 0.25;
      outputValues[y * newWidth + x] = avg;
    }
  }

  // Tensor oluşturup backend'e kaydediyoruz
  const outTensor = tf.tensor2d(outputValues, [newHeight, newWidth], image.dtype);
  return backend.makeTensorInfo(outTensor.shape, outTensor.dtype, outTensor.dataSync());
};

export const downsampleBilinearConfig = {
  kernelName: 'DownsampleBilinear',
  backendName: 'tensorflow',
  kernelFunc: downsampleBilinear,
};
