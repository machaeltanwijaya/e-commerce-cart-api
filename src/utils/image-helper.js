import fs from "fs/promises";
import sharp from "sharp";

const optimizeImage = async (filePath) => {
	const inputBuffer = await fs.readFile(filePath);
	const outputBuffer = await sharp(inputBuffer)
		.resize({
			width: 1200,
			withoutEnlargement: true,
		})
		.toBuffer();
	await fs.writeFile(filePath, outputBuffer);
};

export default optimizeImage;