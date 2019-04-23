const express = require("express");
const router = express.Router();

//  Host City
const getGameInfoQuery = (year, season) =>
  `select year,city,season from game where game_name='${year} ${season}'`

const topWinnerQuery = (year, season, gender) => `select distinct y.Ath_Name, y.cnt,team_name  from
(select * from
(select p.id, ath_name, count(*) cnt from participates_in p, event e, game g ,athlete a
where a.id=p.id and e.event_id=p.event_id and e.game_name=g.game_name and a.sex='${gender}' and g.game_name='${year} ${season}' and medal<>'na' group by p.id,ath_name order by count(*) desc) where  rownum<11)y,
participates_in p1,event e1 where y.id=p1.id and  p1.event_id=e1.event_id order by y.cnt desc`

// `select distinct y.Ath_Name, y.cnt,team_name  from
// (select * from
// (select p.id, ath_name, count(*) cnt from participates_in p, event e, game g ,athlete a
// where a.id=p.id and e.event_id=p.event_id and e.game_name=g.game_name and a.sex='${gender}' and g.game_name='${year} ${season}' and medal<>'na' group by p.id,ath_name order by count(*) desc) where  rownum<11)y,
// participates_in p1,event e1 where y.id=p1.id and  p1.event_id=e1.event_id order by y.cnt desc`


router.get("/(:year)/(:season)/(:gender)", function(req, res, next) {
  async function run() {
    try {
      const query1 = getGameInfoQuery(req.params.year, req.params.season === 'summer' ? 'Summer' : 'Winter')
      const result1 = await req.connection.execute(query1);
      const query2 = topWinnerQuery(req.params.year, req.params.season === 'summer' ? 'Summer' : 'Winter', req.params.gender)
      const result2 = await req.connection.execute(query2);
      topAthletes = result2.rows.reduce((acc, arr) =>
        [...acc, {
          athlName: arr[0],
          medalCount: arr[1],
          country: arr[2],
          sport: arr[3]
        }], []);

      const data = {
        year: result1.rows[0][0],
        hostCity: result1.rows[0][1],
        season: result1.rows[0][2],
        topAthletes
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

router.get("/", function(req, res, next) {
  res.json({ data: "DBMS Project" });
});

module.exports = router;
