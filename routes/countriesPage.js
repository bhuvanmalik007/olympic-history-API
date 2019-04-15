const express = require("express");
const router = express.Router();

//  Participation trend
const countryResolver = country =>
  `(select team_name,year, count(*) cnt from participates_in p, event e, game g
  where e.event_id=p.event_id and e.game_name=g.game_name and team_name='${country}' group by  team_name, year )order by year`

router.get("/", function(req, res, next) {
  async function run() {
    try {
      const query1 = countryResolver(req.query.country)
      const result1 = await req.connection.execute(query1);
      const years = result1.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      const participationCount = result1.rows.reduce((acc, arr) => [...acc, arr[2]], []);

      // const query2 = topWinnerQuery(req.params.year, req.params.season === 'summer' ? 'Summer' : 'Winter')
      // const result2 = await req.connection.execute(query2);
      // topAthletes = result2.rows.reduce((acc, arr) =>
      //   [...acc, {
      //     athlName: arr[0],
      //     medalCount: arr[1],
      //     country: arr[2],
      //     sport: arr[3]
      //   }], []);

      const data = {
        years,
        participationCount
      }

      res.send({
        data,
        error: false
      });
    } catch (error) {
      console.error(error);
      res.json({
        error
      });
    }
  }

  run();
});


module.exports = router;
