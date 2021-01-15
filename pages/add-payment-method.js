import Head from "next/head";
import Nav from "../components/nav";
import CardSetupForm from "../components/CardSetupForm";
import { userProfile } from "../api/GivingaAPI";
import { getStripe, getSetupIntent } from "../api/GivingaPaymentsAPI";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export default function AddPaymentMethods({ intent, stripeSecret }) {
  const stripePromise = loadStripe(stripeSecret.publicKey);

  return (
    <div>
      <Nav />
      <Elements stripe={stripePromise}>
        <CardSetupForm intent={intent} />
      </Elements>
    </div>
  );
}

export async function getServerSideProps(context) {
  const stripeSecret = await getStripe();
  const intent = await getSetupIntent(stripeSecret.token);
  return {
    props: {
      intent,
      stripeSecret,
    },
  };
}
