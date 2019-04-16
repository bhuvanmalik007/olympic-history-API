const express = require("express");
const router = express.Router();

const countryResolver = (country, season) => ({
  participationCountQuery: `(select team_name,year,  season, count(*) cnt from participates_in p, event e, game g
  where e.event_id=p.event_id and e.game_name=g.game_name and team_name='${country}' and season='${season}' group by  team_name, year, season )order by year`,
  successPercQuery: `select x.team_name,x.year, x.cnt/y.totcnt*100 from
  (select team_name,year, count(*) cnt from participates_in p, event e, game g
  where e.event_id=p.event_id and e.game_name=g.game_name and team_name='${country}' and medal<>'na' group by  team_name, year )x,
  (select team_name,year, count(*) totcnt from participates_in p, event e, game g
  where e.event_id=p.event_id and e.game_name=g.game_name and team_name='${country}' group by  team_name, year )y
  where x.team_name=y.team_name and x.year=y.year
  order by x.year`,
  winnerGenderRatioQuery: `select x.team_name,x.year, x.mcnt/y.fcnt from
  (select team_name,year, count(*) as mcnt from participates_in p, event e, game g , athlete a
  where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id and a.sex='M' and team_name='${country}' and medal<>'na' group by  team_name, year )x,
  (select team_name,year, count(*) as fcnt from participates_in p, event e, game g , athlete a
  where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id and a.sex='F' and team_name='${country}' and medal<>'na' group by  team_name, year )y
  where x.team_name=y.team_name and x.year=y.year
  order by x.year`
})

router.get("/", function(req, res, next) {
  async function run() {
    try {
      const query = countryResolver(req.query.country, 'Winter').participationCountQuery;
      const result = await req.connection.execute(query);
      const participationCountSummer = {
        years: result.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        values:  result.rows.reduce((acc, arr) => [...acc, arr[3]], [])
      }
      const query1 = countryResolver(req.query.country, 'Summer').participationCountQuery;
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


module.exports = router;
