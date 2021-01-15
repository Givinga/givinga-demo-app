import Head from "next/head";
import Router from "next/router";
import Nav from "../components/nav";
import { useRef, useState, useCallback } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import {
  getStripe,
  subaccountFundingViaCheckout,
  getPaymentMethods,
} from "../api/GivingaPaymentsAPI";
import { userProfile, listTransactions } from "../api/GivingaAPI";

export default function Profile({
  user,
  transactions,
  stripeSecret,
  paymentMethods,
}) {
  const stripePromise = loadStripe(stripeSecret.publicKey);

  const fundAccount = useCallback(async (charityId) => {
    const stripe = await stripePromise;
    let session = await subaccountFundingViaCheckout(
      stripeSecret.token,
      user.email,
      user.number
    );
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  }, []);

  const fundAccountViaElements = () => {
    Router.push("/fund-elements");
  };

  const addPaymentMethod = () => {
    Router.push("/add-payment-method");
  };

  return (
    <div class="grid content-center">
      <Nav />
      <section class="w-full px-6 mb-12 antialiased bg-white select-none">
        <center>
          <div class="rounded rounded-t-lg overflow-hidden shadow max-w-xs my-3">
            <img
              src="https://hub.givinga.com/assets/images/logo.png"
              class="w-full"
            />
            <div class="flex justify-center mt-8">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                class="rounded-full border-solid border-white border-2 -mt-3 w-20 h-20"
              ></img>
            </div>
            <div class="text-center px-3 pb-6 pt-2 space-y-2">
              <h3 class="text-black text-sm bold font-sans">
                {user.firstName} {user.lastName}
              </h3>
              <p class="mt-2 font-sans font-light text-grey-dark">
                User Id: {user.userId}
              </p>
              <p class="mt-2 font-sans font-light text-grey-dark">
                Account #: {user.number}
              </p>
              <p class="mt-2 font-sans font-light text-grey-dark">
                <CurrencyFormat
                  value={user.balance}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"Balance $"}
                />
              </p>
              <button
                className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => fundAccount()}
              >
                Fund Account (Via Checkout)
              </button>
              <button
                className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => fundAccountViaElements()}
              >
                Fund Account (Elements)
              </button>
              <button
                className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => addPaymentMethod()}
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </center>
      </section>
      <section class="w-full px-6 mb-12 antialiased bg-white select-none">
        <div class="text-lg px-4">Payment Methods</div>
        <br />
        <table class="min-w-full divide-y divide-gray-200 border">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment Method ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last 4
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {paymentMethods.map((method) => {
              return (
                <tr key={method.id}>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {method.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {method.card?.last4 ?? "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section class="w-full px-6 mb-12 antialiased bg-white select-none">
        <div class="text-lg px-4">Transaction History</div>
        <br />
        <table class="min-w-full divide-y divide-gray-200 border">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Id
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Charity Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => {
              return (
                <tr key={transaction.transactionId}>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      <CurrencyFormat
                        value={transaction.amountPaid}
                        displayType={"text"}
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        prefix={"$"}
                      />
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {transaction.charityName ?? "N/A (Funding event)"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {transaction.complete ? (
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Complete
                      </span>
                    ) : (
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export async function getServerSideProps(context) {
  const user = await userProfile();
  const transactions = await listTransactions();
  const stripeSecret = await getStripe();
  const paymentMethods = await getPaymentMethods(stripeSecret.token);

  return {
    props: {
      user,
      transactions,
      stripeSecret,
      paymentMethods,
    },
  };
}
