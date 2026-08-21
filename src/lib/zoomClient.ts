import User from "@/modules/users/schemas/User";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";
import dbConnect from "@/lib/db";

/**
 * Gets a valid Zoom access token for the specified user.
 * Refreshes the token if necessary (Zoom access tokens expire in 1 hour).
 * Wait, Zoom requires Server-to-Server OAuth or standard OAuth. 
 * For standard OAuth, we use the refresh_token to get a new access_token.
 */
export async function getZoomAccessToken(userId: string, companyId: string): Promise<string> {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user || !user.zoomRefreshToken) {
    throw new Error('Zoom is not connected for this user.');
  }

  const settingQuery = companyId ? { key: 'zoom_config', companyId } : { key: 'zoom_config' };
  const setting = await SystemSetting.findOne(settingQuery);
  
  if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret) {
    throw new Error('Zoom integration is not configured in settings.');
  }

  const { clientId, clientSecret } = setting.value;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: user.zoomRefreshToken
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to refresh Zoom token: ${data.reason || data.error_description || 'Unknown error'}`);
  }

  // Update the refresh token in the database
  user.zoomRefreshToken = data.refresh_token;
  await user.save();

  return data.access_token;
}

export async function createZoomMeeting(userId: string, companyId: string, meetingDetails: { topic: string, startTime: string, duration: number }): Promise<string> {
  const accessToken = await getZoomAccessToken(userId, companyId);

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: meetingDetails.topic,
      type: 2, // Scheduled meeting
      start_time: meetingDetails.startTime, // Format: '2020-03-31T12:02:00Z'
      duration: meetingDetails.duration, // In minutes
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        auto_recording: 'none'
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create Zoom meeting: ${data.message || 'Unknown error'}`);
  }

  return data.join_url;
}
