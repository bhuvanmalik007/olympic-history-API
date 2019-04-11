const express = require("express");
const router = express.Router();

// How has the number of nations participating in Olympics changed over the years?

const seasonSwitcher = season => `select count(noc) as Number_of_countries, year from
(select distinct noc, game_name as g_name from team inner join event on event.event_id = team.event_id)
inner join game on game.game_name = g_name
where season = '${season}'
group by year
order by year`

router.get("/nationparticcntchange/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
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
      athlete_stg
      where sex = 'M'
      group by noc
      )
      natural join
      (
      select count(id) as Women, noc
      from
      athlete_stg
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

module.exports = router;
