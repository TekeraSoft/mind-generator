import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs, { unlink } from 'fs/promises';
import { run } from './src/scripts/createImageTarget.js';
import sharp from 'sharp';


const PORT = 3009

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


const upload = multer({ storage: multer.memoryStorage() });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadsDir = path.join(__dirname, 'uploads');

// Uygulama başlamadan önce klasörü oluştur
fs.mkdir(uploadsDir, { recursive: true })
    .then(() => {
        app.listen(PORT, () => console.log('Listening on', PORT));
    })
    .catch(err => {
        console.error('uploads klasörü oluşturulamadı:', err);
        process.exit(1); // hata varsa uygulamayı başlatma
    });

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

        const convertedImagePaths = [];
        let outputPath;

        for (const file of files) {
            // const ext = path.extname(file.originalname).toLowerCase();
            // const baseName = path.basename(file.originalname, ext);
            const timestamp = Date.now();

            outputPath = path.join(__dirname, 'uploads', `${timestamp}-${file.originalname}.jpeg`);
            await sharp(file.buffer)
                .toFormat('jpeg')
                .jpeg({ quality: 100 })
                .toFile(outputPath);

            // if () {
            //     // .webp'yi .jpeg'e dönüştür ve kaydet

            // } else {
            //     // Diğer dosyaları orijinal formatında kaydet
            //     outputPath = path.join(__dirname, 'uploads', `${timestamp}-${file.originalname}`);
            //     await fs.writeFile(outputPath, file.buffer);
            // }

            convertedImagePaths.push(outputPath);
        }

        const mindOutputPath = path.join(__dirname, 'uploads', `targets-${Date.now()}.mind`);
        await run(convertedImagePaths, mindOutputPath);

        res.download(mindOutputPath, 'targets.mind', async err => {
            if (!err) {
                await unlink(mindOutputPath);
                await Promise.all(convertedImagePaths.map(p => unlink(p)));
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error || 'Failed to generate targets' });
    }
}));

app.listen(PORT, () => console.log('Listening on', PORT));
