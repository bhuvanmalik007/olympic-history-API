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

router.get("/", function(req, res, next) {
  res.json({ data: "DBMS Project" });
});

module.exports = router;
