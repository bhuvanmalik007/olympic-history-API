const express = require("express");
const router = express.Router();

// What was the gender participation in Olympic games?

const seasonSwitcher = season => `select * from
(
select count(id) as Men, year from
(
select year, count(athlete.id) as x, athlete.id from olympic_stg inner join athlete on olympic_stg.id = athlete.id
where season = '${season}'
group by year, athlete.id
order by x desc
)
natural join athlete
where sex = 'M'
group by year
order by year desc
)
natural join
(
select count(id) as Women, year from
(
select year, count(athlete.id) as x, athlete.id from olympic_stg inner join athlete on olympic_stg.id = athlete.id
where season = '${season}'
group by year, athlete.id
order by x desc
)
natural join athlete
where sex = 'F'
group by year
order by year desc
)`

router.get("/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const year = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const menCount = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      const womenCount = result.rows.reduce(
        (acc, arr) => [...acc, arr[2]],
        []
      );
      res.send({
        data: {
          year,
          menCount,
          womenCount
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
