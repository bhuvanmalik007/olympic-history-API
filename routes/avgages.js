const express = require("express");
const router = express.Router();
const coordinatesGenerator = require('../helpers');

// What is the growth/degrowth percentage of number of athletes in Winter Olympics?

const winnerSeasonSwitcher = season => `select * from
(
select year, round(avg(age),1) as Gold_Avg from
(
select e_id, medal, year, age
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
inner join participant on participant.id = p_id and participant.event_id = e_id
)
where medal = 'Gold' and age != 0
group by year
order by year
)
natural join
(
select year, round(avg(age),1) as Silver_Avg from
(
select e_id, medal, year, age
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
inner join participant on participant.id = p_id and participant.event_id = e_id
)
where medal = 'Silver' and age != 0
group by year
order by year
)
natural join
(
select year, round(avg(age),1) as Bronze_Avg from
(
select e_id, medal, year, age
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
inner join participant on participant.id = p_id and participant.event_id = e_id
)
where medal = 'Bronze' and age != 0
group by year
order by year
)`

// const athleteSeasonSwitcher = arr => `select round(avg(age)${arr[1]}) from
// (
// select * from participant inner join event on participant.event_id = event.event_id
// where event.game_name like '%${arr[0]}%'
// )`

// Average age of olympic winners
router.get("/winners/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = winnerSeasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const year = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const medalTally = result.rows.reduce((acc, arr) => [...acc, [arr[1], arr[2], arr[3]]],[]);
      coordinatesArray = coordinatesGenerator(medalTally);
      res.send({
        data: {
          year,
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

// Average age of olympic athletes
// router.get("/athletes/(:season)", function(req, res, next) {
//   async function run() {
//     try {
//       const query = athleteSeasonSwitcher(req.params.season === 'summer' ? ['Summer', '-1'] : ['Winter', '+1']);
//       console.log(query);
//       const result = await req.connection.execute(query);
//       const meanAge = result.rows[0][0];
//       const percentage = result.rows.reduce(
//         (acc, arr) => [...acc, arr[1]],
//         []
//       );
//       res.send({
//         data: {
//           meanAge
//         },
//         error: false
//       });
//     } catch (error) {
//       console.error(error);
//       res.json({
//         error
//       });
//     }
//   }

//   run();
// });

module.exports = router;
