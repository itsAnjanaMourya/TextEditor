import { google } from 'googleapis';

export const listFilesController = async (req, res) => {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and 
          trashed = false`,
      fields: 'files(id, name, webViewLink, modifiedTime)',
      pageSize: 100
    });

    res.json({
      success: true,
      files: response.data.files || []
    });

  } catch (error) {
    console.error('Drive API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};