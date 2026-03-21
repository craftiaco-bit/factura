import { Injectable, signal, computed } from '@angular/core';
import { SiteConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  readonly config = signal<SiteConfig>({
    name: 'Motos Honda Concesionarios',
    description: 'Venta de motos Honda',
    language: 'es',
    currency: 'COP',
    whatsapp: '573159923447',
    whatsappMessage: 'Hola, estoy interesado en una moto',
    phone: '3159923447',
    address: 'Av. 1 de Mayo #29-62, Antonio Nariño, Bogotá',
  });

  readonly whatsappUrl = computed(() => {
    const { whatsapp, whatsappMessage } = this.config();
    return `https://api.whatsapp.com/send?phone=${whatsapp}&text=${encodeURIComponent(whatsappMessage)}`;
  });

  readonly phoneUrl = computed(() => `tel:+57${this.config().phone}`);
}
