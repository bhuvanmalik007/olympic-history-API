const express = require("express");
const router = express.Router();

// How has the number of athletes changed over the years?

const seasonSwitcher = season => `select year, count(id) as y from (select year, count(*) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = '${season}'
group by year, athlete.id
order by x desc )
group by year
order by year desc`

router.get("/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const year = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const count = result.rows.reduce(
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

router.get("/", function(req, res, next) {
  res.json({ data: "DBMS Project" });
});

module.exports = router;
