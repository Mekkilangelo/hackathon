export interface DetectedLocation {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

/**
 * Service de géolocalisation.
 * Actuellement mocké — retourne Grenoble.
 * En production : remplacer par un appel IP-geoloc (ex: ipapi.co, MaxMind)
 * ou les coordonnées GPS du navigateur transmises par le frontend.
 */
export class LocationService {
  async detect(_ipOrToken?: string): Promise<DetectedLocation> {
    // TODO: intégrer un vrai provider (ipapi, MaxMind, GPS browser)
    return {
      city: "Grenoble",
      region: "Isère",
      country: "France",
      lat: 45.1885,
      lng: 5.7245,
    };
  }
}

export const locationService = new LocationService();
