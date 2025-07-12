import { ApplicationRepository, ContactMessageRepository, CountryRepository, PassengerRepository, PaymentDisputeRepository, VesselRepository, WebhookEventRepository } from '@repositories';
import { ApplicationService, SupabaseService } from '@services';
import { CountriesService } from '@services/countries.service';
import { EmailService } from '@services/email.service';
import { CountriesController } from '@api/controllers/countries.controller';
import { container } from 'tsyringe';

container.register<ApplicationRepository>('ApplicationRepository', {
  useClass: ApplicationRepository,
});
container.register<ContactMessageRepository>('ContactMessageRepository', {
  useClass: ContactMessageRepository,
});
container.register<CountryRepository>('CountryRepository', {
  useClass: CountryRepository,
});
container.register<PassengerRepository>('PassengerRepository', {
  useClass: PassengerRepository,
});
container.register<PaymentDisputeRepository>('PaymentDisputeRepository', {
  useClass: PaymentDisputeRepository,
});
container.register<VesselRepository>('VesselRepository', {
  useClass: VesselRepository,
});
container.register<WebhookEventRepository>('WebhookEventRepository', {
  useClass: WebhookEventRepository,
});

container.register<ApplicationService>('ApplicationService', {
  useClass: ApplicationService,
});

container.register<SupabaseService>('SupabaseService', {
  useClass: SupabaseService,
});

container.register<CountriesService>('CountriesService', {
  useClass: CountriesService,
});

container.register<EmailService>('EmailService', {
  useClass: EmailService,
});

container.register<CountriesController>('CountriesController', {
  useClass: CountriesController,
});

export default container;
