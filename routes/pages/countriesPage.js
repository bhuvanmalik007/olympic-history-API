const express = require("express");
const router = express.Router();

const countryResolver = (country, season) => ({
  participationCountQuery: `(select t.noc,year,  season, count(*) cnt from participates_in p, event e, game g, team t
  where e.event_id=p.event_id and e.game_name=g.game_name and t.team_name=p.team_name and p.event_id=t.event_id and season='${season}' and noc='${country}' group by  t.noc, year, season ) order by year`,
  successPercQuery: `select x.noc,x.year, x.cnt/y.totcnt*100 from(select t.noc,year, count(*) cnt from participates_in p, event e, game g , team t where e.event_id=p.event_id and e.game_name=g.game_name and t.team_name=p.team_name and p.event_id=t.event_id and noc='${country}' and  medal<>'na' group by t.noc, year )x,(select t.noc,year, count(*) totcnt from participates_in p, event e, game g , team t where e.event_id=p.event_id and e.game_name=g.game_name and t.team_name=p.team_name and p.event_id=t.event_id and noc='${country}' group by  t.noc, year ) y where x.noc=y.noc and x.year=y.year order by x.year`,
  winnerGenderRatioQuery: `select x.noc,x.year, x.mcnt/y.fcnt from(select noc,year, count(*) as mcnt from participates_in p, event e, game g , athlete a, team t where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id and t.team_name=p.team_name and p.event_id=t.event_id and a.sex='M' and t.noc='${country}' and medal<>'na' group by  noc, year )x,(select noc,year, count(*) as fcnt from participates_in p, event e, game g , athlete a, team t where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id and t.team_name=p.team_name and p.event_id=t.event_id and a.sex='F' and t.noc='${country}' and medal<>'na' group by  noc, year )y where x.noc=y.noc and x.year=y.year order by x.year`
})

router.get("/", function(req, res, next) {
  async function run() {
    try {
      const query = countryResolver(req.query.country, 'Summer').participationCountQuery;
      const result = await req.connection.execute(query);
      const participationCountSummer = {
        years: result.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        values:  result.rows.reduce((acc, arr) => [...acc, arr[3]], [])
      }
      const query1 = countryResolver(req.query.country, 'Winter').participationCountQuery;
      const result1 = await req.connection.execute(query1);
      const participationCountWinter = {
        years: result1.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        values:  result1.rows.reduce((acc, arr) => [...acc, arr[3]], [])
      }
      const query2 = countryResolver(req.query.country).successPercQuery;
      const result2 = await req.connection.execute(query2);
      const successRate = {
        years: result2.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        values:  result2.rows.reduce((acc, arr) => [...acc, Math.round( arr[2] * 10) / 10], [])
      }
      const query3 = countryResolver(req.query.country).winnerGenderRatioQuery;
      const result3 = await req.connection.execute(query3);
      const winnerGenderRatio = {
        years: result3.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        values: result3.rows.reduce((acc, arr) => [...acc, Math.round( arr[2] * 10) / 10], [])
      }

      console.log(winnerGenderRatio.years.length, winnerGenderRatio.values.length)

      const data = {
        participationCountSummer,
        participationCountWinter,
        successRate,
        winnerGenderRatio,
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


router.get("/getcountries", function(req, res, next) {
  async function run() {
    try {
      const query = `select distinct noc from team`;
      const result = await req.connection.execute(query);
      const nocList = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      res.send({
        data: {
          nocList
        },
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
