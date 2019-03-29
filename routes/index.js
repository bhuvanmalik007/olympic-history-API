const express = require("express");
const router = express.Router();

const winter = `select * from (select spt_name, count(*) as x
from event inner join game on game.game_name = event.game_name
where game.season = ‘Winter’
group by spt_name
order by x desc)
WHERE ROWNUM <= 10`

const summer = `select *from (select spt_name, count(*) as x from event
group by spt_name
order by x desc)
WHERE ROWNUM <= 10`

router.get("/eventscount/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = req.params.season === 'summer' ? summer : winter;
      const result = await req.connection.execute(query);
      const sports = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const eventsCount = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );

      res.send({
        data: {
          sports,
          eventsCount
        },
        error: false
      });
    } catch (err) {
      console.error(err);
      res.json({
        err
      });
    }
  }

  run();
});

router.get("/", function(req, res, next) {
  res.json({ data: "DBMS Project" });
});

module.exports = router;
