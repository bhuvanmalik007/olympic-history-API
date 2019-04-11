const express = require("express");
const router = express.Router();

//  Top 10 MAle/Female medal winners

const genderSwitcher = gender => `select *
from
(
select ath_name as Name, total_medals_won as "Total Medals Won"
from
(
select f_id, count(medal) as total_medals_won
from
(
select athlete.id as f_id, medal
from
participates_in inner join athlete on participates_in.id = athlete.id
where sex = '${gender}' and medal != 'na'
)
group by f_id
)
inner join athlete on athlete.id = f_id
order by "Total Medals Won" desc
)
where rownum < 11`

router.get("/(:gender)", function(req, res, next) {
  async function run() {
    try {
      const query = genderSwitcher(req.params.gender === 'male' ? 'M' : 'F');
      const result = await req.connection.execute(query);
      const name = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const medalCount = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );
      res.send({
        data: {
          name,
          medalCount
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
