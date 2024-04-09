import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import * as geoip from 'geoip-lite';
import { Lookup } from 'geoip-lite';

interface GeoIPCountry {
  name: string;
  iso_code: string;
  iso_code_3: string;
  capital: string;
  tlds: string[];
  continent_code: string;
  is_eu: boolean;
  calling_codes: string[];
  currency: {
    code: string;
    name: string;
  };
  languages: string[];
  population: number;
}

interface LocationDetails {
  ip: string;
  network: string;
  version: 'IPv4' | 'IPv6';
  city: string;
  region: string;
  country: string | null;
  country_code: string | null;
  country_code_iso3: string | null;
  country_capital: string | null;
  country_tld: string | null;
  continent_code: string | null;
  in_eu: boolean | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  country_calling_code: string | null;
  currency: string | null;
  currency_name: string | null;
  languages: string | null;
  country_area: number | null;
  country_population: number | null;
  error: string | null;
}

@Injectable()
export class GeoUtilService {
  getIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) || (request.socket.remoteAddress as string)
    );
  }

  getLocationDetails(ipAddr: string): LocationDetails {
    try {
      const lookup: Lookup = geoip.lookup(ipAddr) || null;
      if (!lookup) {
        return {
          ip: ipAddr,
          error: 'Location details not found',
          network: '0.0.0.0',
          version: 'IPv4',
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
          country_code: 'UNK',
          country_code_iso3: 'UNK',
          country_capital: 'Unknown',
          country_tld: 'Unknown',
          continent_code: 'UNK',
          in_eu: false,
          latitude: 0,
          longitude: 0,
          timezone: 'UTC',
          country_calling_code: '+1',
          currency: 'USD',
          currency_name: 'US Dollar',
          languages: 'en',
          country_area: 0,
          country_population: 0,
        };
      }

      const { range, country, region, city, ll, timezone, area, metro } = lookup;
      const [latitude, longitude] = ll;
      const countryDetails = country ? (country as unknown as GeoIPCountry) : null;

      Logger.debug(`${range} ${country} ${region} ${city} ${latitude} ${longitude} ${metro}`);

      return {
        ip: ipAddr,
        network: range[0].toString(),
        version: ipAddr.includes(':') ? 'IPv6' : 'IPv4',
        city: city || 'Unknown',
        region: region || 'Unknown',
        country: countryDetails?.name || 'Unknown',
        country_code: countryDetails?.iso_code || 'UNK',
        country_code_iso3: countryDetails?.iso_code_3 || 'UNK',
        country_capital: countryDetails?.capital || 'Unknown',
        country_tld: countryDetails?.tlds?.join(',') || 'Unknown',
        continent_code: countryDetails?.continent_code || 'UNK',
        in_eu: countryDetails?.is_eu || false,
        latitude: latitude || 0,
        longitude: longitude || 0,
        timezone: timezone || 'UTC',
        country_calling_code: countryDetails?.calling_codes?.join(',') || '+1',
        currency: countryDetails?.currency?.code || 'USD',
        currency_name: countryDetails?.currency?.name || 'US Dollar',
        languages: countryDetails?.languages?.join(',') || 'en',
        country_area: area || 0,
        country_population: countryDetails?.population || 0,
        error: null,
      };
    } catch (error) {
      Logger.error(`Error getting location details: ${error}`);
      return {
        ip: ipAddr,
        error: 'Error getting location details',
        network: '0.0.0.0',
        version: 'IPv4',
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        country_code: 'UNK',
        country_code_iso3: 'UNK',
        country_capital: 'Unknown',
        country_tld: 'Unknown',
        continent_code: 'UNK',
        in_eu: false,
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        country_calling_code: '+1',
        currency: 'USD',
        currency_name: 'US Dollar',
        languages: 'en',
        country_area: 0,
        country_population: 0,
      };
    }
  }
}
