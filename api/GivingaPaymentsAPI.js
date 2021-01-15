import CryptoJS from "crypto-js";
import { sha256 } from "crypto-js/sha256";
import { hmacSHA256 } from "crypto-js/hmac-sha256";

export async function getStripe() {
  let now = Math.floor(Date.now() / 1000);
  var hash = CryptoJS.HmacSHA256(
    now.toString(),
    process.env.NEXT_PUBLIC_STRIPE_SECRET
  );

  let requestBody = {
    hashEpoch: now,
    hmac: CryptoJS.enc.Hex.stringify(hash),
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/partners/${process.env.NEXT_PUBLIC_STRIPE_ACCOUNT}/authenticate`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );

  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}

export async function subaccountFundingViaIntents(token, accountNumber) {
  const requestBody = {
    amount: 10000,
    currency: "USD",
    customerCoveringFee: false,
    matchRequested: false,
    subaccountNumber: accountNumber,
    persistPaymentMethod: false,
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/payment-intents`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );

  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}

export async function subaccountFundingViaCheckout(
  token,
  email,
  accountNumber
) {
  let requestBody = {
    subaccountNumber: accountNumber,
    currency: "USD",
    amount: 10000,
    successURL: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    cancelURL: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    productName: "Account funding",
    quantity: 1,
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/checkout`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );
  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}

export async function donateViaCheckout(
  token,
  email,
  accountNumber,
  charityId
) {
  let requestBody = {
    givingaAccountNumber: accountNumber,
    currency: "USD",
    amount: 10000,
    charityId: charityId,
    matchRequested: false,
    successURL: `${process.env.NEXT_PUBLIC_APP_URL}/charities`,
    cancelURL: `${process.env.NEXT_PUBLIC_APP_URL}/charities`,
    productName: "Givinga Demo Test Donation!",
    quantity: 1,
    activityId: "Testing on the Givinga demo app!",
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/checkout`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );
  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}
