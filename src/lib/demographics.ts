// Demographic data collection utilities

interface GeolocationData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

interface UserDemographics {
  country: string;
  region?: string;
  city?: string;
  timezone?: string;
  age?: number;
  birthDate?: string;
  birthYear?: number;
  gender?: string;
  detectedAt: string;
  ipAddress?: string;
}

// Get geolocation from IP using a free service
export async function getGeolocationFromIP(ipAddress: string): Promise<GeolocationData | null> {
  try {
    // Using ipapi.co (free tier: 1000 requests/day). If IP is unknown, let the service infer it.
    const target = ipAddress && ipAddress !== 'unknown'
      ? `https://ipapi.co/${ipAddress}/json/`
      : 'https://ipapi.co/json/'

    const response = await fetch(target, {
      headers: {
        'User-Agent': 'spiritual-gifts-app/1.0'
      }
    });

    if (!response.ok) {
      console.warn('Geolocation API request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.warn('Geolocation API error:', data.reason);
      return null;
    }

    return {
      country: data.country_name || 'Unknown',
      region: data.region || '',
      city: data.city || '',
      timezone: data.timezone || '',
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
}

// Extract birth date from Google OAuth user metadata
export function extractBirthDateFromGoogleData(rawUserMetaData: Record<string, unknown>): { birthDate?: string; age?: number } {
  try {
    // Google OAuth might provide birth_date or birthday in various formats
    const birthDate = rawUserMetaData?.birth_date ||
      rawUserMetaData?.birthday ||
      rawUserMetaData?.birthdate;

    if (!birthDate) {
      return {};
    }

    // Parse birth date and calculate age
    const birth = new Date(birthDate as string);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return {
      birthDate: birth.toISOString().split('T')[0], // YYYY-MM-DD format
      age: age >= 0 && age <= 150 ? age : undefined // Sanity check
    };
  } catch (error) {
    console.warn('Error extracting birth date from Google data:', error);
    return {};
  }
}

// Get age group for analytics
export function getAgeGroup(age: number): string {
  if (age < 18) return '< 18';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

// Get user's IP address from request headers
export function getUserIP(request: Request): string {
  // Check various headers that might contain the real IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xClientIp = request.headers.get('x-client-ip');

  // x-forwarded-for can contain multiple IPs, use the first one
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  return xRealIp || cfConnectingIp || xClientIp || 'unknown';
}

// Collect comprehensive demographics data
export async function collectUserDemographics(
  ipAddress: string,
  rawUserMetaData: Record<string, unknown>
): Promise<UserDemographics> {
  const geolocation = await getGeolocationFromIP(ipAddress);
  const { birthDate, age } = extractBirthDateFromGoogleData(rawUserMetaData);
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : undefined;
  const gender = (rawUserMetaData?.gender as string) || undefined;

  return {
    country: geolocation?.country || 'Unknown',
    region: geolocation?.region,
    city: geolocation?.city,
    timezone: geolocation?.timezone,
    age,
    birthDate,
    birthYear,
    gender,
    detectedAt: new Date().toISOString(),
    ipAddress: ipAddress !== 'unknown' ? ipAddress : undefined
  };
}

// Check if user has demographics data
export async function userHasDemographics(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/demographics/check?userId=${userId}`);
    if (!response.ok) {
      console.warn('Failed to check demographics status');
      return false;
    }
    const data = await response.json();
    return data.hasDemographics || false;
  } catch (error) {
    console.error('Error checking demographics:', error);
    return false;
  }
}

// Trigger demographics collection for a user
export async function triggerDemographicsCollection(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/demographics/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      console.warn('Demographics collection failed:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering demographics collection:', error);
    return false;
  }
}
