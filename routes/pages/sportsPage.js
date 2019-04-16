const express = require("express");
const router = express.Router();

//  Host City
const searchStringResolver = (searchString) =>
  ``

router.get("/", function(req, res, next) {
  async function run() {
    try {
      console.log(req.query.name)
      const query1 = searchStringResolver(req.query.name)
      // const result1 = await req.connection.execute(query1);

      console.log(req.query)
      const query2 = searchStringResolver(req.query.getinfo)
      // const result1 = await req.connection.execute(query1);


      const data = {
        hello: 'world'
      }

      res.send({
        data,
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
