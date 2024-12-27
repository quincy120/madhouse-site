import {loadStripeOnramp} from '@stripe/crypto';

import {CryptoElements, OnrampElement} from './StripeCryptoElements';

const stripeOnrampPromise = loadStripeOnramp("pk_test_51QQgiBBbHYAruVQW1RHBGU4SQmRIk6wHouvNcG44AfnWEtvtMWuZJ2QJvpFEMMzkCSK4IpJuRljuCTqaKzcmk1Yd00XOSjSUxG");

export default () => {
  // IMPORTANT: replace with your logic of how to mint/retrieve client secret
  const clientSecret = "cos_1Lb6vsAY1pjOSNXVWF3nUtkV_secret_8fuPvTzBaxj3XRh14C6tqvdl600rpW7hG4G";

  return (
    <CryptoElements stripeOnramp={stripeOnrampPromise}>
      <OnrampElement clientSecret={clientSecret} />
    </CryptoElements>
  );
}