import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // Obtener la IP real del cliente considerando cabeceras de proxies inversos (Pinggy, Ngrok, Cloudflare, etc.)
    const rawIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-original-forwarded-for'] ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      req.ip ||
      'Unknown';

    // Si x-forwarded-for contiene una lista de IPs separadas por coma, la primera es la real del cliente
    const clientIp =
      typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : String(rawIp);

    const { method, originalUrl } = req;

    // Loguear la petición HTTP sin exponer credenciales ni datos sensibles del body/headers
    this.logger.log(
      `Request [${method}] to [${originalUrl}] from client IP: ${clientIp}`,
    );

    next();
  }
}
