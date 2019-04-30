const express = require("express");
const router = express.Router();
const coordinatesGenerator = require('./../helpers');


// How has the number of nations participating in Olympics changed over the years?

const queryResolver = param => ({
  nationparticcntchange: `select count(noc) as Number_of_countries, year from
  (select distinct noc, game_name as g_name from team inner join event on event.event_id = team.event_id)
  inner join game on game.game_name = g_name
  where season = '${param}'
  group by year
  order by year`,
  favsportbycountry: `select spt_name, count(noc) as "Favourite sport of countries"  from(
    (select distinct noc, spt_name from participates_in p, event e,  team t
    where e.event_id=p.event_id and t.team_name=p.team_name and p.event_id=t.event_id  and  medal<>'na'
    group by t.noc,e.spt_name having count(medal) = (select  max(count( medal)) from participates_in p2, event e2 , team t2
    where e2.event_id=p2.event_id  and t2.team_name=p2.team_name and p2.event_id=t2.event_id and t.noc=t2.noc and  medal<>'na'
    group by t2.noc,e2.spt_name ) )
    union
    (select distinct noc, spt_name from participates_in p, event e , team t
    where e.event_id=p.event_id and t.team_name=p.team_name and p.event_id=t.event_id and noc not in
    ( select distinct noc from participates_in p1, event e1 , team t1 where e1.event_id=p1.event_id and t1.team_name=p1.team_name and p1.event_id=t1.event_id
    and medal<>'na')
    group by t.noc,e.spt_name having count(medal) = (select  max(count( medal)) from participates_in p2, event e2, team t2
    where e2.event_id=p2.event_id and t2.team_name=p2.team_name and p2.event_id=t2.event_id and t.noc=t2.noc
    group by t2.noc,e2.spt_name))) group by spt_name order by count(noc) desc FETCH FIRST 10 ROWS ONLY`,
    nextLikelyWinners: `select spt_name, noc from event e, game g, participates_in p, team t
    where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and g.season='Summer' and medal<>'na'
    group by noc,spt_name having count(*) = (select max( count(*)) from event e1, game g1, participates_in p1, team t1
    where e1.game_name=g1.game_name and p1.event_id=e1.event_id and p1.event_id=t1.event_id and p1.team_name=t1.team_name and g1.season='Summer' and medal<>'na' and e.spt_name=e1.spt_name
    group by t1.noc,e1.spt_name) order by spt_name`,
    seniorWinners: `select spt_name, COALESCE (gcnt, 0) AS gold , COALESCE (scnt, 0) as silver,COALESCE (bcnt, 0) as bronze, (COALESCE (gcnt, 0) + COALESCE (scnt, 0)+COALESCE (bcnt, 0)) as total_medal_count
    from
    (select spt_name, count(medal) as gcnt from event e, game g, participates_in p, team t, participant pn
    where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and medal='Gold' and pn.age>='50'
    group by spt_name)gld full outer join
    (select spt_name,scnt,bcnt from (select spt_name, count(medal) as scnt from event e, game g, participates_in p, team t, participant pn
    where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and medal='Silver' and pn.age>='50'
    group by spt_name)slv full outer join
    (select spt_name, count(medal) as bcnt from event e, game g, participates_in p, team t, participant pn
    where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and medal='Bronze' and pn.age>='50'
    group by spt_name)brz
    using(spt_name)) sb
    using (spt_name) order by total_medal_count desc FETCH FIRST 20 ROWS ONLY`,
    gymnweight: ` select year,round(winner_avg_weight),round(loser_avg_weight),round(loser_avg_weight)-round(winner_avg_weight) as difference from(select year,avg(weight) loser_avg_weight  from event e, game g, participates_in p, team t, (select * from participant where weight<>0) pn, athlete a where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and a.id=pn.id and medal='na' and a.sex='M' and spt_name='Gymnastics'group by year) loss full outer join(select year,avg(weight) winner_avg_weight from event e, game g, participates_in p,team t, (select * from participant where weight<>0) pn, athlete a where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and a.id=pn.id and medal<>'na' and a.sex='M' and spt_name='Gymnastics'group by year) win using (year) where winner_avg_weight is not null and loser_avg_weight is not null order by year`,
    bBallHeight: `select year,round(winner_avg_height),round(loser_avg_height), round(winner_avg_height)-round(loser_avg_height) as "difference(winner-loser)" from
    (select year,avg(height) loser_avg_height  from event e, game g, participates_in p, team t, (select * from participant where height<>0) pn, athlete a
    where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and a.id=pn.id and medal='na' and a.sex='M' and spt_name='Basketball'
    group by year) loss
    full outer join
    (select year,avg(height) winner_avg_height from event e, game g, participates_in p, team t, (select * from participant where height<>0) pn, athlete a
    where e.game_name=g.game_name and p.event_id=e.event_id and p.event_id=t.event_id and p.team_name=t.team_name and p.id=pn.id and p.event_id=pn.event_id and a.id=pn.id and medal<>'na' and a.sex='M' and spt_name='Basketball'
    group by year) win
    using (year) order by year`,
    leaderBoard: `select * from
    (select year,noc,COALESCE (gcnt, 0) AS gcnt , COALESCE (scnt, 0) as scnt,COALESCE (bcnt, 0) as bcnt, (COALESCE (gcnt, 0) *4+ COALESCE (scnt, 0)*2+COALESCE (bcnt, 0)*1) as pnt,
    DENSE_RANK() OVER (partition by year ORDER BY (COALESCE (gcnt, 0) *4+ COALESCE (scnt, 0)*2+COALESCE (bcnt, 0)*1) DESC) AS rank from
    (select g.year, noc, count(medal) as gcnt  from participates_in p, event e, game g, team t
    where p.event_id=e.event_id and e.game_name=g.game_name and t.team_name=p.team_name and p.event_id=t.event_id and medal='Gold' and season='${param}'
    group by g.year, t.noc)gld
    full outer join
    (select year,noc,scnt,bcnt from
    (select g.year, noc, count(medal) as scnt from participates_in p, event e, game g, team t
    where p.event_id=e.event_id and e.game_name=g.game_name and t.team_name=p.team_name and p.event_id=t.event_id and medal='Silver' and season='${param}'
    group by g.year, t.noc) slv
    full outer join
    (select g.year, noc, count(medal) as bcnt from participates_in p, event e, game g, team t
    where p.event_id=e.event_id and e.game_name=g.game_name and t.team_name=p.team_name and p.event_id=t.event_id and medal='Bronze' and season='${param}'
    group by g.year, t.noc) brz
    using (year,noc)) sb
    using (year,noc))
    where rank<=3
    order by year,pnt desc`
})
router.get("/nationparticcntchange/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver(req.params.season === 'summer' ? 'Summer' : 'Winter').nationparticcntchange;
      const result = await req.connection.execute(query);
      const count = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const year = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          year,
          count
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

// Top 10 countries with best women/men athlete ratio
router.get("/bestsexratio", function(req, res, next) {
  async function run() {
    try {
      const query = `select team_name, ratio from
      (
      select * from
      (
      select noc, round(women/men,2) as ratio from
      (
      select count(id) as Men, noc
      from
      olympic_stg
      where sex = 'M'
      group by noc
      )
      natural join
      (
      select count(id) as Women, noc
      from
      olympic_stg
      where sex = 'F'
      group by noc
      )
      order by ratio desc
      )
      where rownum < 11
      )
      natural join
      (
      select * from
      (
      select distinct team_name, noc
      from team
      where noc != 'CHN' and noc != 'PRK'
      )
      union
      (
      select distinct team_name, noc
      from team
      where team_name = 'China' or team_name = 'North Korea'
      )
      )
      order by ratio desc`;
      const result = await req.connection.execute(query);
      const country = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const ratio = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          country,
          ratio
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

// Favourite sport of each country decided based on: in which sport the country has won the max no of medals. If a country has not won any medal so far, the favourite sport is decided based on in which sport the country has the max participation.

router.get("/favsportbycountry", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver().favsportbycountry;
      const result = await req.connection.execute(query);
      const sportName = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const countryCount = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      res.send({
        data: {
          sportName,
          countryCount
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

// Countries most likely to win in the next olympics in each sport based on past record:
router.get("/nextwinners", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver().nextLikelyWinners;
      const result = await req.connection.execute(query);
      // const sportName = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      // const country = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);

      res.send({
        data: {
          result
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

// sports with maximum senior (over 50 year old) medal winners :
router.get("/seniorwinners", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver().seniorWinners;
      const result = await req.connection.execute(query);
      const sport = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      // const seniorWinners = result.rows.reduce((acc, arr) => [...acc, {sport: arr[0], gold: arr[1], silver: arr[2], bronze: arr[3], total: arr[4]}], []);
      const medalTally = result.rows.reduce((acc, arr) => [...acc, [arr[1], arr[2], arr[3]]],[]);
      coordinatesArray = coordinatesGenerator(medalTally);
      // // const sportName = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      // // const country = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);

      res.send({
        data: {
          sport,
          coordinatesArray
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


// Does weight matter in gymnastics? In most of the cases an average male medal winners weighed less than someone who didnt win a medal
// For this analysis we have left the rows that had no weight data so that the average count does not get corrupted.
router.get("/gymnweight", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver().gymnweight;
      const result = await req.connection.execute(query);
      // const gymnWeightData = result.rows.reduce((acc, arr) => [...acc, {year: arr[0], winnerWeight: arr[1], loserWeight: arr[2], difference: arr[3]}], []);
      const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const winnerWeights = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      const loserWeight = result.rows.reduce((acc, arr) => [...acc, arr[2]], []);
      const difference = result.rows.reduce((acc, arr) => [...acc, arr[3]], []);

      res.send({
        data: {
          // result
          years,
          winnerWeights,
          loserWeight,
          difference
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


// Does height matter in Basketball?
// In most of the cases an average male medal winner is taller than someone who didnt win a medal
// For this analysis we have left the rows that had no height data so that the average count does not get corrupted.

router.get("/bballheight", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver().bBallHeight;
      const result = await req.connection.execute(query);
      // const gymnWeightData = result.rows.reduce((acc, arr) => [...acc, {year: arr[0], winnerWeight: arr[1], loserWeight: arr[2], difference: arr[3]}], []);
      const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const winnerAvgWeights = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      const loserAvgWeight = result.rows.reduce((acc, arr) => [...acc, arr[2]], []);
      const difference = result.rows.reduce((acc, arr) => [...acc, arr[3]], []);

      res.send({
        data: {
          // result
          years,
          winnerAvgWeights,
          loserAvgWeight,
          difference
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


router.get("/leaderboard/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver(req.params.season).leaderBoard;
      const result = await req.connection.execute(query);

      // const leaderBoard = result.rows.reduce((acc, arr) => [...acc, {year: arr[0], winnerWeight: arr[1], loserWeight: arr[2], difference: arr[3]}], []);
      // for()
      // const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      // const winnerAvgWeights = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      // const loserAvgWeight = result.rows.reduce((acc, arr) => [...acc, arr[2]], []);
      // const difference = result.rows.reduce((acc, arr) => [...acc, arr[3]], []);

      res.send({
        data: {
          result

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
