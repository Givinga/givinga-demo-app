import CryptoJS from "crypto-js";
import { sha256 } from "crypto-js/sha256";
import { hmacSHA256 } from "crypto-js/hmac-sha256";
import fetchToCurl from "fetch-to-curl";

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

export async function getSetupIntent(token) {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER}/setup-intents`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    }
  );

  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}

export async function getPaymentMethods(token) {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER}/payment-methods`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
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
    amount: 5000,
    currency: "USD",
    customerCoveringFee: false,
    matchRequested: false,
    subaccountNumber: accountNumber,
    persistPaymentMethod: false,
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER}/payment-intents`,
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
    amount: 5000,
    successURL: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    cancelURL: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    productName: "Account funding",
    quantity: 1,
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER}/checkout`,
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
    amount: 5000,
    charityId: charityId,
    matchRequested: false,
    successURL: `${process.env.NEXT_PUBLIC_APP_URL}/charities`,
    cancelURL: `${process.env.NEXT_PUBLIC_APP_URL}/charities`,
    productName: "Givinga Demo Test Donation!",
    quantity: 1,
    activityId: "Testing on the Givinga demo app!",
  };

  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER}/checkout`,
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

export async function subscriptionDonation(token, charityId) {
  let productBody = {
    name: `Monthly subscription donation to ${charityId}`,
  };

  let productResponse = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/products`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(productBody),
    }
  );

  if (productResponse.ok) {
    let productData = await productResponse.json();

    let intervalBody = {
      interval: "month",
      currency: "usd",
      unitAmount: 500,
    };

    let intervalResponse = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/products/${productData.productId}/prices`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify(intervalBody),
      }
    );

    if (intervalResponse.ok) {
      let intervalData = await intervalResponse.json();

      let subscriptionBody = {
        items: [
          {
            quantity: 1,
            priceId: intervalData.priceId,
          },
        ],
        paymentMethodId: process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD,
        subaccountNumber: process.env.NEXT_PUBLIC_DEFAULT_EMPLOYEE,
        charityId: charityId,
        matchRequested: false,
        notes: "Subscription created via demo app!",
      };

      let subscriptionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENTS_URL}/customers/${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER}/subscriptions`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: JSON.stringify(subscriptionBody),
        }
      );

      if (subscriptionResponse.ok) {
        let subscription = await subscriptionResponse.json();
        return subscription;
      } else {
        //error handle
        return subscriptionResponse;
      }
    } else {
      //errorHandle
      return intervalResponse;
    }
  } else {
    //error handle
    return productResponse;
  }
}
