import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

export const uploadController = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'No content provided' });
        }

        const tempFilePath = path.join(__dirname, `temp_${Date.now()}.txt`);
        fs.writeFileSync(tempFilePath, content);

        const fileResponse = await drive.files.create({
            requestBody: {
                name: `letter_${Date.now()}.txt`,
                mimeType: 'text/plain',
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root']
            },
            media: {
                mimeType: 'text/plain',
                body: fs.createReadStream(tempFilePath)
            }
        });

        const fileId = fileResponse.data.id;

        fs.unlinkSync(tempFilePath);

        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        res.status(200).json({
            message: 'File uploaded to Google Drive successfully',
            fileId,
            fileUrl: `https://drive.google.com/file/d/${fileId}/view`
        });
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        res.status(500).json({ 
            error: 'Failed to upload to Google Drive',
            details: error.message 
        });
    }
};