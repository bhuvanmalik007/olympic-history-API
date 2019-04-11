const express = require("express");
const router = express.Router();

// What is the growth/degrowth percentage of number of athletes in Winter Olympics?

const winnerSeasonSwitcher = season => `select round(avg(age))
from
(
select event_id as e_id, medal, id as p_id from participates_in
where medal != 'na'
)
inner join
(
select * from event natural join game
where season = '${season}'
)
on e_id = event_id
inner join participant on participant.id = p_id and participant.event_id = e_id`

const athleteSeasonSwitcher = arr => `select round(avg(age)${arr[1]}) from
(
select * from participant inner join event on participant.event_id = event.event_id
where event.game_name like '%${arr[0]}%'
)`

// Average age of olympic winners
router.get("/winners/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = winnerSeasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const meanAge = result.rows[0][0];
      const percentage = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          meanAge
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

// Average age of olympic athletes
router.get("/athletes/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = athleteSeasonSwitcher(req.params.season === 'summer' ? ['Summer', '-1'] : ['Winter', '+1']);
      console.log(query);
      const result = await req.connection.execute(query);
      const meanAge = result.rows[0][0];
      const percentage = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          meanAge
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
