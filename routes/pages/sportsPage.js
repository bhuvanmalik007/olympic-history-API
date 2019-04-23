const express = require("express");
const router = express.Router();

//  Host City
const queryResolver = (param1, param2) =>
  ({
    sportsList: `select distinct spt_name from event e,game g where e.game_name=g.game_name and season='${param1}' order by spt_name`,
    mensEvents: `select distinct event_name from event where spt_name='${param1}' and event_name not like '%Women''s%'`,
    womensEvents: `select distinct event_name from event where spt_name='${param1}' and event_name not like '%Men''s%'`,
    topAthletesByMedalCount: `select distinct y.ath_name,p1.team_name,y.cnt as "Total Medals", y.rank from (select p.id, ath_name, count(*) cnt, DENSE_RANK() OVER (ORDER BY count(*) DESC) AS rank   from participates_in p, event e, athlete a where a.id=p.id and e.event_id=p.event_id and a.sex='${param2}' and spt_name='${param1}' and medal<>'na' group by p.id,ath_name) y, participates_in p1 where y.id=p1.id and y.rank<=5 order by rank FETCH FIRST 10 ROWS ONLY`,
    popularityTrend: `select spt_name,year,count(*) from participates_in p2, event e2, game g2 where e2.event_id=p2.event_id and e2.game_name=g2.game_name and  spt_name='${param1}' group by spt_name,year order by year`,
    popularityInEvents: `select x.spt_name,x.year,x.cnt/y.totcnt*100 from(select e2.spt_name,g2.year,count(*) as cnt from participates_in p2, event e2, game g2 where e2.event_id=p2.event_id and e2.game_name=g2.game_name and e2.spt_name='${param1}' group by e2.spt_name,g2.year) x,(select year,count(*) as totcnt from participates_in p3, event e3, game g3 where e3.event_id=p3.event_id and e3.game_name=g3.game_name group by year order by year) y where x.year=y.year`,
    cntryParticipationTrend: `select spt_name,year,(count(*)) as cnt,team_name from participates_in p2, event e2, game g2 where e2.event_id=p2.event_id and e2.game_name=g2.game_name and  spt_name='${param1}' group by spt_name,year,team_name having count(*) = (select max(count(*)) from participates_in p3, event e3, game g3 where e3.event_id=p3.event_id and e3.game_name=g3.game_name and e2.spt_name=e3.spt_name and g2.year=g3.year group by spt_name,year,team_name) order by g2.year`,
    topAthletesPoint: `select ath_name,team_name,spt_name,COALESCE (gcnt, 0) AS gcnt , COALESCE (scnt, 0) as scnt,COALESCE (bcnt, 0) as bcnt, (COALESCE (gcnt, 0) *4+ COALESCE (scnt,0)*2+COALESCE (bcnt, 0)*1) as pnt,DENSE_RANK() OVER (ORDER BY (COALESCE (gcnt, 0) *4+ COALESCE (scnt,0)*2+COALESCE (bcnt, 0)*1) DESC) AS rank from(select ath_name,team_name,spt_name, count(medal) as gcnt from participates_in p, event e,game g , athlete a where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id and spt_name='${param1}' and medal='Gold' and a.sex='${param2}'  group by ath_name,team_name,spt_name)gld full outer join(select ath_name, team_name, spt_name,scnt,bcnt from (select ath_name,team_name,spt_name, count(medal) as scnt from participates_in p, event e, game g, athlete a where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id  and spt_name='${param1}' and medal='Silver' and a.sex='${param2}' group by ath_name,team_name,spt_name)slv full outer join(select ath_name,team_name,spt_name, count(medal) as bcnt from participates_in p, event e,game g , athlete a where e.event_id=p.event_id and e.game_name=g.game_name and a.id=p.id  and spt_name='${param1}' and medal='Bronze' and a.sex='${param2}'  group by ath_name,team_name,spt_name)brz using(ath_name,team_name,spt_name)) sb using (ath_name,team_name,spt_name) order by pnt desc FETCH FIRST 10 ROWS ONLY`
  })

router.get("/list/(:season)", function(req, res, next) {
  async function run() {
    try {
      console.log(req.params.season)
      // const query = queryResolver(req.params.season).sportsList;
      const result = await req.connection.execute(queryResolver(req.params.season).sportsList);
      const sports = result.rows.reduce((acc, arr) => [...acc, arr[0]], [])
      res.send({
        sports,
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

router.post("/getdetails", function(req, res, next) {
  if(!req.body.sport) res.send({ error: "sport name not found" });
  async function run() {
    try {
      const mensEventsResult = await req.connection.execute(queryResolver(req.body.sport).mensEvents);
      const mensEvents = mensEventsResult.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const womensEventsResult = await req.connection.execute(queryResolver(req.body.sport).womensEvents);
      const womensEvents = womensEventsResult.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const topAthletesByMedalCountMensResult = await req.connection.execute(queryResolver(req.body.sport, 'M').topAthletesByMedalCount);
      const topAthletesByMedalCountMens = topAthletesByMedalCountMensResult.rows.reduce((acc, arr) => [...acc, {name: arr[0], country: arr[1], medalCount: arr[2], rank: arr[3]}], []);

      const topAthletesByMedalCountResultWomens = await req.connection.execute(queryResolver(req.body.sport, 'F').topAthletesByMedalCount);
      const topAthletesByMedalCountWomens = topAthletesByMedalCountResultWomens.rows.reduce((acc, arr) => [...acc, {name: arr[0], country: arr[1], medalCount: arr[2], rank: arr[3]}], []);

      // Participation Trend
      const popularityTrendResults = await req.connection.execute(queryResolver(req.body.sport).popularityTrend);
      // edit here
      const popularityTrend = {
        year: popularityTrendResults.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        count: popularityTrendResults.rows.reduce((acc, arr) => [...acc, arr[2]], []),
      }

      const popularityInEventsResults = await req.connection.execute(queryResolver(req.body.sport).popularityInEvents);
      // edit here
      const popularityInEvents = {
        year: popularityInEventsResults.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        percentage: popularityInEventsResults.rows.reduce((acc, arr) => [...acc, Math.round( arr[2] * 10) / 10], []),
      }

      const cntryParticipationTrendResults = await req.connection.execute(queryResolver(req.body.sport).cntryParticipationTrend);
      // edit here
      const cntryParticipationTrend = {
        countries: cntryParticipationTrendResults.rows.reduce((acc, arr) => [...acc, arr[3]], []),
        years: cntryParticipationTrendResults.rows.reduce((acc, arr) => [...acc, arr[1]], []),
        count: cntryParticipationTrendResults.rows.reduce((acc, arr) => [...acc, arr[2]], [])
      }

      // on hold
      const topAthletesPointMResults = await req.connection.execute(queryResolver(req.body.sport, 'M').topAthletesPoint);
      // edit here
      const topAthletesPointM = topAthletesPointMResults.rows.reduce((acc, arr) => [...acc, {name: arr[0], country: arr[1], goldCount: arr[3], silverCount: arr[4], bronzeCount: arr[5], points: arr[6], rank: arr[7]}], []);

      const topAthletesPointFResults = await req.connection.execute(queryResolver(req.body.sport, 'F').topAthletesPoint);
      // edit here
      const topAthletesPointF = topAthletesPointFResults.rows.reduce((acc, arr) => [...acc, {name: arr[0], country: arr[1], goldCount: arr[3], silverCount: arr[4], bronzeCount: arr[5], points: arr[6], rank: arr[7]}], []);



      res.send({
        data: {
        mensEvents,
        womensEvents,
        topAthletesByMedalCountMens,
        topAthletesByMedalCountWomens,
        popularityTrend,
        popularityInEvents,
        cntryParticipationTrend,
        topAthletesPointM,
        topAthletesPointF,
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
