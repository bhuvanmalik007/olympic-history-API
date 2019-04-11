const express = require("express");
const router = express.Router();

// Gender Ratio Women/Men over the years

const winter = `select year, round(Women/Men,2) as gender_ratio from
(
select count(id) as Men, year from
(
select year, count(athlete.id) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = 'Winter'
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
select year, count(athlete.id) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = 'Winter'
group by year, athlete.id
order by x desc
)
natural join athlete
where sex = 'F'
group by year
order by year desc
)`

const summer = `select year, round(Women/Men,2) as gender_ratio from
(
select count(id) as Men, year from
(
select year, count(athlete.id) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = 'Summer'
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
select year, count(athlete.id) as x, athlete.id from athlete_stg inner join athlete on athlete_stg.id = athlete.id
where season = 'Summer'
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
      const query = req.params.season === 'summer' ? summer : winter;
      const result = await req.connection.execute(query);
      // const sports = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      // const eventsCount = result.rows.reduce(
      //   (acc, arr) => [...acc, arr[1]],
      //   []
      // );
      // res.send({
      //   data: {
      //     sports,
      //     eventsCount
      //   },
      //   error: false
      // });
      res.send({
        data: result.rows,
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
