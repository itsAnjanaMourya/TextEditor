import { google } from 'googleapis';

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

export const listFilesController = async (req, res) => {
    try {
        if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID environment variable not set');
        }

        const response = await drive.files.list({
            q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and 
                (mimeType='application/vnd.google-apps.document' or 
                 mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')`,
            fields: 'files(id, name, webViewLink, mimeType, modifiedTime)',
            orderBy: 'modifiedTime desc',
            pageSize: 100
        });

        const files = response.data.files.map(file => ({
            id: file.id,
            name: file.name,
            webViewLink: file.webViewLink, 
            editLink: `https://docs.google.com/document/d/${file.id}/edit`,
            type: file.mimeType,
            lastModified: file.modifiedTime
        }));

        res.status(200).json({
            message: 'Files retrieved successfully',
            files: files,
            folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
        });
    } catch (error) {
        console.error('Error retrieving files:', {
            message: error.message,
            details: error.response?.data?.error || error.stack
        });
        res.status(500).json({ 
            error: 'Failed to retrieve files',
            details: error.response?.data?.error || error.message,
            suggestion: 'Please verify the folder ID exists and is shared with your account'
        });
    }
};