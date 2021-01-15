import Router from "next/router";
import React, { Component } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Nav from "../components/nav";
import {
  CardElement,
  Elements,
  ElementsConsumer,
} from "@stripe/react-stripe-js";
import {
  getStripe,
  subaccountFundingViaIntents,
} from "../api/GivingaPaymentsAPI";

function CheckoutForm({ stripe, elements, token }) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const paymentIntent = await subaccountFundingViaIntents(
      token,
      process.env.NEXT_PUBLIC_DEFAULT_USER
    );

    console.log(paymentIntent);

    if (paymentIntent !== undefined) {
      const result = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (result.error) {
        alert(result.error.message);
        this.setState({ processing: false });
      } else {
        if (result.paymentIntent.status === "succeeded") {
          Router.push("/profile");
        }
      }
    } else {
      // We hit an error above.
      this.setState({ processing: false });
    }
  };

  return (
    <div>
      <Nav />
      <div class="leading-loose">
        <form
          class="max-w-xl m-4 p-10 bg-white rounded shadow-xl"
          onSubmit={handleSubmit}
        >
          <p class="mt-4 text-gray-800 font-medium">Payment information</p>
          <div class="">
            <CardElement />
          </div>
          <div class="mt-4">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

class InjectedCheckoutForm extends Component {
  render() {
    return (
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <CheckoutForm
            stripe={stripe}
            elements={elements}
            currency={this.props.currency}
            token={this.props.token}
          />
        )}
      </ElementsConsumer>
    );
  }
}

export default function DonateForm({ stripeSecret }) {
  const stripePromise = loadStripe(stripeSecret.publicKey);

  return (
    <Elements stripe={stripePromise}>
      <InjectedCheckoutForm currency={"usd"} token={stripeSecret.token} />
    </Elements>
  );
}

export async function getServerSideProps(context) {
  const stripeSecret = await getStripe();

  return {
    props: {
      stripeSecret,
    },
  };
}
