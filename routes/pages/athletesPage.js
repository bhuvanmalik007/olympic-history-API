const express = require("express");
const router = express.Router();

//  Host City
const queryResolver = (param) =>
({
  search: `select distinct a.id,a.ath_name, t.noc from athlete a, participates_in p, team t where a.id=p.id and p.team_name=t.team_name and p.event_id=t.event_id and  upper(ath_name) like upper('${param}%') FETCH FIRST 150 ROWS ONLY`,
  getDetails: `select p.id,ath_name,team_name,event_name,spt_name, g.city||' '||year,g.season, sex,age,height,weight, medal from participates_in p, participant pt, event e, game g , athlete a
  where p.id=pt.id and p.event_id=pt.event_id and e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id  and a.id='${param}' order by year`
})

// search: `select distinct a.id,a.ath_name, t.noc from athlete a, participates_in p, team t where a.id=p.id and p.team_name=t.team_name and p.event_id=t.event_id and  upper(ath_name) like upper('${param}%')`,

router.get("/search/", function(req, res, next) {
  async function run() {
    try {
      console.log(req.query.name)
      const query1 = queryResolver(req.query.name).search
      const result1 = await req.connection.execute(query1);
      const athletes = result1.rows.reduce((acc, arr) => [...acc, {id: arr[0], name: arr[1], noc: arr[2]}], []);
      // const id = result1.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      // const name = result1.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      // const noc = result1.rows.reduce((acc, arr) => [...acc, arr[2]], []);

      console.log(result1)

      const data = {
        harsha: 'sucks dick',
        athletes
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

router.get("/", function(req, res, next) {
  res.json({ data: "DBMS Project" });
});

module.exports = router;
