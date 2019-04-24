const express = require("express");
const router = express.Router();

//  Get lists

const seasonSwitcher = season => ({
  seasonYears: `select distinct year from game
                where season = '${season}'
                order by year`,
  sportsList: `select distinct spt_name, game.season
              from
              (
              select * from sport natural join event
              )
              natural join game
              where season = '${season}'
              order by spt_name`
});

router.get("/years/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter').seasonYears;
      const result = await req.connection.execute(query);
      const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      res.send({
        data: {
          years,
          season: req.params.season
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

router.get("/sports/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter').sportsList;
      const result = await req.connection.execute(query);
      const sportNames = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      res.send({
        data: {
          sportNames,
          season: req.params.season
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

router.get("/dbrowcount", function(req, res, next) {
  async function run() {
    try {
      const query = `select count(*) from athlete a, game g, event e, team t, participant pn, participates_in p
      where e.game_name=g.game_name and t.event_id=e.event_id and pn.id=a.id and pn.event_id=e.event_id and p.id=pn.id and p.event_id=pn.event_id and p.event_id=t.event_id and p.team_name=t.team_name`;
      const result = await req.connection.execute(query);
      const queryCount = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      res.send({
        data: {
          queryCount
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
