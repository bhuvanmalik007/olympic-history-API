const express = require("express");
const router = express.Router();

//  Host City
const queryResolver = (param) =>
({
  citiesBySeason: `select city from game where season = '${param}'`,
  getDetails: `select p.id,ath_name,team_name,event_name,spt_name, g.city||' '||year,g.season, sex,age,height,weight, medal from participates_in p, participant pt, event e, game g , athlete a
  where p.id=pt.id and p.event_id=pt.event_id and e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id  and a.id='${param}' order by year`
})

router.get("/citiesbyseason", function(req, res, next) {
  async function run() {
    try {
      console.log(req.query.name)
      const query = queryResolver(req.params.name).citiesBySeason
      const result = await req.connection.execute(query);
      const cities = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        harsha: 'sucks dick',
        cities
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


router.get("/getinfo/(:id)", function(req, res, next) {
  async function run() {
    try {
      console.log(req.params.id)
      const query = queryResolver(req.params.id).getDetails;
      const result = await req.connection.execute(query);
      participationHistory = result.rows.reduce((acc, arr) => [...acc, {id: arr[0], name: arr[1], country: arr[2], event: arr[3], game: arr[5], age: arr[8], weight: arr[10], medal: arr[11]}], []);
      console.log(result)

      const data = {
        result
      }

      res.send({
        participationHistory,
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
