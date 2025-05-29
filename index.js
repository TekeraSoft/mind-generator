import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { unlink } from 'fs/promises';
import { run } from './src/scripts/createImageTarget.js';


const PORT = 3009

const app = express();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get('/', asyncHandler(async (req, res, next) => {
    // await run()
    res.send("Ok")
}))

app.post('/generate', upload.array('images'), asyncHandler(async (req, res, next) => {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No image files provided' });
        }

        const imagePaths = files.map(file => file.path);
        const outputPath = path.join(__dirname, 'uploads', 'targets.mind');

        await run(imagePaths, outputPath);

        res.download(outputPath, 'output.mind', async err => {
            if (!err) {
                await unlink(outputPath);
                await Promise.all(imagePaths.map(p => unlink(p)));
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate targets' });
    }
}));

app.listen(PORT, () => console.log('Listening on', PORT));
