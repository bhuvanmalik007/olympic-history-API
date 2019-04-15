const express = require("express");
const router = express.Router();

//  Get lists

const seasonSwitcher = season => `select distinct year from game
where season = '${season}'
order by year`

router.get("/years/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const years = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      res.send({
        data: {
          years,
          season: req.params.season
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
