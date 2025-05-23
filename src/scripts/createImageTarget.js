import { OfflineCompiler } from "./offline-compiler.js";
import { writeFile } from 'fs/promises';
import { loadImage } from 'canvas';

/**
 * @param {string[]} imagePaths - image file paths (absolute or relative)
 * @param {string} outputPath - path to save the compiled .mind file
 */
export async function run(imagePaths, outputPath = 'targets.mind') {
  const images = await Promise.all(imagePaths.map(value => loadImage(value)));
  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets(images, console.log);
  const buffer = compiler.exportData();
  await writeFile(outputPath, buffer);
}
