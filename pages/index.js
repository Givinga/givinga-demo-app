import Head from "next/head";
import Nav from "../components/nav";
import { userProfile } from "../api/GivingaAPI";

export default function Home({ user }) {
  return (
    <div>
      <Nav />
      <div class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
            <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Givinga Demo App
            </p>
            <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto text-justify">
              Welcome to the Givinga Demo App. This open source application
              provides you with all the tools you need to implement Givinga into
              your own application.
            </p>
            <a
              class="mr-5 bg-primary text-black font-bold py-2 px-6 rounded-md text-white"
              href="https://github.com/Givinga/givinga-demo-app"
            >
              View on Github
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const user = await userProfile();
  return {
    props: {
      user,
    },
  };
}
