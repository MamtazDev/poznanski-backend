const fs = require('fs');
const path = require('path');

// Assuming imageData is the ArrayBuffer containing the image data
// and filePath is the path where you want to save the image
const saveImage = async (imageData, filePath, fileName) => {
	return new Promise(async (resolve, reject) => {
		await fs.promises.mkdir(`public/assets/img/${filePath}`, {recursive: true});
		fs.writeFile(
			path.join(`public/assets/img/${filePath}`, fileName),
			imageData,
			(err) => {
				if (err) {
					console.error('Error saving the image:', err);
					reject(false);
				} else {
					console.log('Image saved successfully');
					resolve(true);
				}
			}
		);
	});
};

module.exports = saveImage;
