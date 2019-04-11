const express = require("express");
const router = express.Router();

//  What is the growth/degrowth percentage of number of athletes in Winter Olympics?

const seasonSwitcher = season => `select c_o, round((c_p - p_p)*100/p_p) as growth from
(
select year as c_o, count(id) as c_p from (select year, count(*) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = '${season}'
group by year, athlete.id
order by x desc )
group by year
order by year desc
)
cross join
(
select year as p_o, count(id) as p_p from (select year, count(*) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = '${season}'
group by year, athlete.id
order by x desc )
group by year
order by year desc
)
where c_o - p_o = 4`

router.get("/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const year = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const percentage = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          year,
          percentage
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
