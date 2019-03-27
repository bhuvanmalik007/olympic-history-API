var express = require("express");
var router = express.Router();
var oracledb = require("oracledb");

router.get("/eventscount", function(req, res, next) {
  async function run() {
    let connection;

    try {
      connection = await oracledb.getConnection({
        user: "chakrabo",
        password: "Login$123", // mypw contains the hr schema password
        connectString: "oracle.cise.ufl.edu:1521/orcl"
      });

      let result = await connection.execute(
        `select *from (select spt_name, count(*) as x from event
        group by spt_name
        order by x desc)
        WHERE ROWNUM <= 10`
      );
      const sports = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const eventsCount = result.rows.reduce(
        (acc, arr) => [...acc, arr[1]],
        []
      );

      console.log(sports);
      res.json({
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
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  run();
});

router.get("/", function(req, res, next) {
  res.json({ data: "DBMS Project" });
});

module.exports = router;
