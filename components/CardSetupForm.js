import React from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import CardSection from "./CardSection";

export default function CardSetupForm({ intent }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmCardSetup(intent, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: "Test User",
        },
      },
    });

    if (result.error) {
      // Display result.error.message in your UI.
      alert("Failed to store payment method");
    } else {
      alert("Succesfully stored paymend method");
    }
  };

  return (
    <div class="leading-loose">
      <form
        class="max-w-xl m-4 p-10 bg-white rounded shadow-xl"
        onSubmit={handleSubmit}
      >
        <div class="">
          <CardSection />
        </div>
        <div class="mt-4">
          <button disabled={!stripe}>Save Card</button>
        </div>
      </form>
    </div>
  );
}
