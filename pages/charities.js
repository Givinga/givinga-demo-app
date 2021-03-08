import { useRef, useState, useCallback, useEffect } from "react";
import Head from "next/head";
import Nav from "../components/nav";
import Router from "next/router";
import useDebounce from "../helpers/debounce";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import {
  getStripe,
  donateViaCheckout,
  subaccountFundingViaIntents,
  subscriptionDonation,
  JPYIntentsDonation
} from "../api/GivingaPaymentsAPI";
import { userProfile, submitFundedDonation } from "../api/GivingaAPI";

export default function Charities({ stripeSecret, user }) {
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([]);

  const debouncedSearchTerm = useDebounce(query, 500);

  const stripePromise = loadStripe(stripeSecret.publicKey);

  const donate = useCallback(async (charityId) => {
    setResults([]);
    setProcessing(true);
    const stripe = await stripePromise;
    let session = await donateViaCheckout(
      stripeSecret.token,
      user.email,
      process.env.NEXT_PUBLIC_DEFAULT_DONOR,
      charityId,
      "USD"
    );
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  }, []);

  const donateJPY = useCallback(async (charityId) => {
    setResults([]);
    setProcessing(true);
    const stripe = await stripePromise;
    let paymentIntent = await JPYIntentsDonation(
      stripeSecret.token,
      process.env.NEXT_PUBLIC_DEFAULT_DONOR,
      charityId
    );

    if (paymentIntent !== undefined) {
      const result = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD
        }
      );

      if (result.error) {
        alert(result.error.message);
        this.setState({ processing: false });
      } else {
        if (result.paymentIntent.status === "succeeded") {
          this.setState({ processing: false });
          alert("Succesfully donated in JPY");
        }
      }
    } else {
      // We hit an error above.
      this.setState({ processing: false });
    }
  }, []);

  const recurringDonation = useCallback(async (charityId) => {
    setResults([]);
    setProcessing(true);
    const stripe = await stripePromise;
    let subscriptionId = await subscriptionDonation(
      stripeSecret.token,
      charityId
    );
    alert(`Succesfully created subscription: ${subscriptionId}`);
    setProcessing(false);
  }, []);

  const fundedDonation = useCallback((charityId) => {
    setResults([]);
    setProcessing(true);
    fetch(`/api/donate?charityId=${charityId}`)
      .then((response) => response.json())
      .then((data) => {
        Router.push("/success");
      });
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setProcessing(true)
      fetch(`/api/charities?filterText=${query}`)
        .then((response) => response.json())
        .then((data) => {
          setProcessing(false)
          setResults(data);
        });
    } else {
      setProcessing(false)
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div class="flex flex-col">
      <Nav />
      <section class="w-full px-6 mb-12 antialiased bg-white select-none spacey-6 mt-8">
        <center>
          <input
            class="bg-purple-white shadow rounded border-0 p-3 mb-4 w-full"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a charity"
            type="text"
          />
        </center>
        <div class="flex flex-col">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        EIN
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Info
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Matched
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Direct Donation (USD)
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Direct Donation (JPY)
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Recurring Donation
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Funded Donation
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {results.map((charity) => {
                      return (
                        <tr key={charity.id}>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="flex-shrink-0 h-10 w-10">
                                <img
                                  class="h-10 w-10 object-contain"
                                  src="givinga.png"
                                  alt=""
                                ></img>
                              </div>
                              <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">
                                  {charity.ein}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">
                              {charity.name}
                            </div>
                            <div class="text-sm text-gray-500">
                              {charity.address.city}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            {charity.matched ? (
                              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Matched
                              </span>
                            ) : (
                              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Not Matched
                              </span>
                            )}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => donate(charity.id)}
                            >
                              Direct Donation (USD)
                            </button>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => donateJPY(charity.id)}
                            >
                              Direct Donation (JPY)
                            </button>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => recurringDonation(charity.id)}
                            >
                              $5/Month Recurring Donation
                            </button>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="bg-gray-800 active:bg-gray-700 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => fundedDonation(charity.id)}
                            >
                              Funded Donation
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
          {
            processing ?
            (<div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 m-auto mt-10"></div>)
            : ("")
          }
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps(context) {
  const stripeSecret = await getStripe();
  const user = await userProfile();

  return {
    props: {
      user,
      stripeSecret,
    },
  };
}
