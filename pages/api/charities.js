import { charitySearch } from "../../api/GivingaAPI";

export default async function (req, res) {
  return new Promise((resolve, reject) => {
    charitySearch(req.query.filterText)
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
