import { registerKernel } from '@tensorflow/tfjs';
import { binomialFilterConfig } from './binomialFilter.js';
import { downsampleBilinearConfig } from './downsampleBilinear.js';

registerKernel(binomialFilterConfig);
registerKernel(downsampleBilinearConfig);