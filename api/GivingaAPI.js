export async function addUser(firstName, lastName, email, remoteId) {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/add-user`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "post",
      body: JSON.stringify({
        firstName: email,
        lastName: lastName,
        email: email,
        remoteId: remoteId,
      }),
    }
  );

  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}

export async function listSubAccounts() {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/sub-accounts`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "get",
    }
  );

  if (response.ok) {
    let json = await response.json();

    return json.users;
  } else {
    return response;
  }
}

export async function listTransactions() {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/transactions?accountNumbers=${process.env.NEXT_PUBLIC_DEFAULT_USER}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "get",
    }
  );

  if (response.ok) {
    let json = await response.json();
    return json.sort(function (x, y) {
      return y.timestamp - x.timestamp;
    });
  } else {
    return response;
  }
}

export async function accountDetail(email) {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/users?email=${email}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "get",
    }
  );
  if (response.ok) {
    let json = await response.json();

    return json;
  } else {
    return response;
  }
}

export async function userProfile() {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/accounts?numbers=${process.env.NEXT_PUBLIC_DEFAULT_USER}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "get",
    }
  );
  if (response.ok) {
    let json = await response.json();
    return json[0];
  } else {
    return response;
  }
}

export async function userTransactions(account_number) {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/transactions?accountNumbers=${account_number}&startDate=2020-03-03&endDate=2021-12-29`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "get",
    }
  );
  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    return response;
  }
}

export async function charitySearch(query) {
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/charities?filterText=${query}&length=10`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
      },
      method: "get",
    }
  );
  if (response.ok) {
    let json = await response.json();
    return json.charities;
  } else {
    return response;
  }
}

export async function submitFundedDonation(charityId) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_TEST}/donation`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEXT_PUBLIC_FULLSEND_KEY}`,
        Allow: "POST",
      },
      body: JSON.stringify({
        accountNumber: `${process.env.NEXT_PUBLIC_DEFAULT_USER}`,
        charityId: charityId,
        amount: 50,
        notes: "Test donation from the demo app!",
      }),
    }
  );

  if (response.ok) {
    let json = await response.json();
    return json;
  } else {
    console.log(response);
    return response;
  }
}
