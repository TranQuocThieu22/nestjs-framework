import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import type { ActiveUserData } from '@app/shared-types';

/** Phần header của JWT (đã giải mã base64) */
interface JwtHeader {
  kid?: string;
}

/** Phần payload của JWT phát hành bởi Keycloak */
interface KeycloakJwtPayload {
  iss: string;
  sub: string;
  preferred_username?: string;
  realm_access?: { roles?: string[] };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        request: unknown,
        rawJwtToken: string,
        done: (err: unknown, secret?: string) => void,
      ) => {
        try {
          // Parse the JWT to get the issuer (iss)
          const decoded = JSON.parse(
            Buffer.from(rawJwtToken.split('.')[1], 'base64').toString(),
          ) as KeycloakJwtPayload;
          const issuer = decoded.iss; // e.g. http://localhost:8080/realms/dhvb

          if (!issuer) {
            return done(
              new UnauthorizedException('Issuer not found in token'),
              undefined,
            );
          }

          // Dynamically fetch JWKS from the issuer URL
          const client = new jwksRsa.JwksClient({
            jwksUri: `${issuer}/protocol/openid-connect/certs`,
            cache: true,
            rateLimit: true,
          });

          // Extract the Key ID (kid) from the JWT header
          const header = JSON.parse(
            Buffer.from(rawJwtToken.split('.')[0], 'base64').toString(),
          ) as JwtHeader;

          client.getSigningKey(header.kid, (err, key) => {
            if (err) {
              return done(err, undefined);
            }
            if (!key) {
              return done(new Error('Key is undefined'), undefined);
            }
            const signingKey = key.getPublicKey();
            done(null, signingKey);
          });
        } catch (error) {
          done(error, undefined);
        }
      },
    });
  }

  validate(payload: KeycloakJwtPayload): ActiveUserData {
    // Trích xuất tenantId từ Issuer URL (ví dụ: http://localhost:8080/realms/dhvb -> dhvb)
    const issuerSegments = payload.iss.split('/');
    const tenantId = issuerSegments[issuerSegments.length - 1];

    return {
      userId: payload.sub,
      username: payload.preferred_username ?? '',
      roles: payload.realm_access?.roles ?? [],
      tenantId: tenantId,
    };
  }
}
