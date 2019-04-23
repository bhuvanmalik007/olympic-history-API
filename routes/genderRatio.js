const express = require("express");
const router = express.Router();

// Gender Ratio Women/Men over the years

const seasonSwitcher = season => `select year, round(Women/Men,2) as gender_ratio from
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
      const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const ratios = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          years,
          ratios
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
