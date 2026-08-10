declare module "stripe" {
  class Stripe {
    constructor(apiKey: string, config?: any);
    [key: string]: any;
  }
  namespace Stripe {
    type Event = any;
    namespace Checkout {
      type Session = any;
    }
    type Subscription = any;
  }
  export = Stripe;
}

declare module "twilio";
