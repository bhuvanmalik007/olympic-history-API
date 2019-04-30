const express = require("express");
const router = express.Router();

//  Host City
const queryResolver = (param1, param2, param3) =>
({
  citiesBySeason: `select distinct city from game where season = '${param1}'`,
  yearsByCity: `select year from game
  where city = '${param1}'
  order by year`,
  sportsByYear: `select distinct spt_name from event
  where game_name like '${param1}%'`,
  sportsBySeasonCity: `select distinct spt_name from event natural join game
  where season ='${param1}' and city ='${param2}'`,
  eventsBySport: `select distinct event_name from event
  where spt_name = '${param1}'`,
  eventsBySportYear: `select distinct e.event_name from event e, game g where e.game_name=g.game_name and spt_name='${param1}' and year='${param2}'`,
  eventsBySportGender: `select distinct event_name from event
  where spt_name = '${param1}' and event_name like '%${param2=='M'?'Men':'Women'}%'`,
  eventsBySportGenderYear: `Select distinct event_name from event e, game g where e.game_name=g.game_name and spt_name= '${param1}' and event_name like '%${param2=='M'?'Men':'Women'}%' and year = ${param3}`
})

const filterQuery = {
  mainQuery: `select * from
  (
  select distinct * from
  game g natural join event natural join participates_in
  )main
  where   medal = ‘Gold’
  and Season = ‘Summer’
  `

}

// and     city = ‘Athina’
//   and     year = 1896
//   and     spt_name = ‘Athletics’
//   and     category = ‘Men’
//   and     event_name = ’Athletics Men’‘s Shot Put’


router.get("/citiesbyseason/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver(req.params.season).citiesBySeason;
      const result = await req.connection.execute(query);
      const cities = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
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


router.post("/yearsbycity", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver(req.body.city).yearsByCity;
      const result = await req.connection.execute(query);
      const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        years
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

router.get("/sportsbyyear/(:year)", function(req, res, next) {
  async function run() {
    try {
      const query = queryResolver(req.params.year).sportsByYear;
      console.log(query);
      const result = await req.connection.execute(query);
      const sports = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        sports
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

router.post("/sportsbyseasoncity", function(req, res, next) {
  async function run() {
    try {
      console.log(req.body.city)
      const query = queryResolver(req.body.season, req.body.city).sportsBySeasonCity;
      console.log(query)
      const result = await req.connection.execute(query);
      const sports = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        sports
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

router.post("/eventsbysport", function(req, res, next) {
  async function run() {
    try {
      console.log(req.body.city)
      const query = queryResolver(req.body.sport).eventsBySport;
      console.log(query)
      const result = await req.connection.execute(query);
      const events = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        events
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

router.post("/eventsbysportyear", function(req, res, next) {
  async function run() {
    try {
      console.log(req.body.city)
      const query = queryResolver(req.body.sport, req.body.year).eventsBySportYear;
      console.log(query)
      const result = await req.connection.execute(query);
      const events = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        events
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

router.post("/eventsbysportgender", function(req, res, next) {
  async function run() {
    try {
      // console.log(req.body.city)
      const query = queryResolver(req.body.sport, req.body.gender).eventsBySportGender;
      // console.log(query)
      const result = await req.connection.execute(query);
      const events = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        events
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

router.post("/eventsbysportgenderyear", function(req, res, next) {
  async function run() {
    try {
      // console.log(req.body.city)
      const query = queryResolver(req.body.sport, req.body.gender, req.body.year).eventsBySportGenderYear;
      // console.log(query)
      const result = await req.connection.execute(query);
      const events = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        events
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


router.post("/filterQuery", function(req, res, next) {
  async function run() {
    try {
      // console.log(req.body.city)
      const query = queryResolver(req.body.sport, req.body.gender, req.body.year).eventsBySportGenderYear;
      // console.log(query)
      const result = await req.connection.execute(query);
      const events = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);

      const data = {
        events
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
