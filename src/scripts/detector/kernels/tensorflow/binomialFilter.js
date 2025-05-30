import * as tf from '@tensorflow/tfjs-node';

export async function binomialFilter(args) {
  // imageTensor shape: [height, width] veya [height, width, channels]

  const imageTensor = args.inputs.image;
  const backend = args.backend;


  console.log("test1", backend);
  let input = imageTensor;
  let hasChannels = true;
  console.log("isdispose", imageTensor.isDisposedInternal)
  try {
    if (imageTensor.shape.length === 2) {
      console.log("tes2");
      input = imageTensor.expandDims(2);
      console.log("test3");
    }
  } catch (e) {
    console.error("expandDims error:", e);
  }
  const channels = input.shape[2];

  const kernelValues = [
    1, 4, 6, 4, 1,
    4, 16, 24, 16, 4,
    6, 24, 36, 24, 6,
    4, 16, 24, 16, 4,
    1, 4, 6, 4, 1
  ].map(x => x / 256);

  const kernelTensor = tf.tensor4d(kernelValues, [5, 5, 1, 1]);

  const kernelMultiChannel = tf.tile(kernelTensor, [1, 1, channels, 1]);
  console.log("test4");
  // Batch boyutu yoksa ekle
  if (input.shape.length === 3) {
    input = input.expandDims(0);
  }

  const paddedInput = tf.pad(input, [[0, 0], [2, 2], [2, 2], [0, 0]], 'reflect');
  console.log("test5", paddedInput);
  const filtered = tf.conv2d(paddedInput, kernelMultiChannel, 1, 'valid');
  console.log("filtered", filtered);
  console.log("Active backend:", tf.getBackend());
  console.log("Backend instance:", tf.backend());

  console.log("test6");
  // Batch ve channel'ı geri indir
  let result = filtered.squeeze([0]); // batch'i kaldır
  if (!hasChannels) {
    result = result.squeeze([2]); // channel tekse kaldır
  }

  const keepedData = tf.keep(result);
  const data = await result.data();
  console.log("data", data);
  const tensor = tf.tensor(data, keepedData.shape, keepedData.dtype);
  console.log("tenseor", tensor)
  return tensor;

}

export const binomialFilterConfig = {//: KernelConfig
  kernelName: "BinomialFilter",
  backendName: 'tensorflow',
  kernelFunc: binomialFilter,// as {} as KernelFunc,
};

