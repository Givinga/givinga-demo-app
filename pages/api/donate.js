import { submitFundedDonation } from "../../api/GivingaAPI";

export default async function (req, res) {
  return new Promise((resolve, reject) => {
    submitFundedDonation(parseInt(req.query.charityId))
      .then((response) => {
        res.status(200).json(response);
        res.end();
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        return resolve();
      });
  });
}
