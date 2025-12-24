import { AnalyticsPort } from '../../ports';

export class CompositeAnalyticsAdapter implements AnalyticsPort {
  readonly capability = 'analytics' as const;
  private adapters: AnalyticsPort[];

  constructor(adapters: AnalyticsPort[]) {
    this.adapters = adapters;
  }

  async init(): Promise<void> {
    await Promise.all(this.adapters.map(a => a.init()));
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.adapters.forEach(a => a.identify(userId, traits));
  }

  track(event: string, properties?: Record<string, unknown>): void {
    this.adapters.forEach(a => a.track(event, properties));
  }

  screen(name: string, properties?: Record<string, unknown>): void {
    this.adapters.forEach(a => a.screen(name, properties));
  }

  reset(): void {
    this.adapters.forEach(a => a.reset());
  }
}
