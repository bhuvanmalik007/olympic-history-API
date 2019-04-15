const express = require("express");
const router = express.Router();

//  What are the top 10 countries with highest tally of medals in Olympics?

const seasonSwitcher = season => `select team_name, gold_medals_won, silver_medals_won, bronze_medals_won from
(
select team_name, gold_medals_won, silver_medals_won, bronze_medals_won, (gold_medals_won + silver_medals_won + bronze_medals_won) as total_medals from
(
select team_name, sum(medals_won) as gold_medals_won from
(
select team_name, count(*) as medals_won from
(
select team_name, medal, year from
(
select distinct event_id, team_name, medal, year from
(
select * from
(
select * from participates_in
where medal = 'Gold'
)
natural join
(
select event_id, year from event natural join game
where season = '${season}'
))))
group by team_name
order by team_name
)
group by team_name
--order by total_medals_won desc
)
natural join
(
select team_name, sum(medals_won) as silver_medals_won from
(
select team_name, count(*) as medals_won from
(
select team_name, medal, year from
(
select distinct event_id, team_name, medal, year from
(
select * from
(
select * from participates_in
where medal = 'Silver'
)
natural join
(
select event_id, year from event natural join game
where season = '${season}'
))))
group by team_name
order by team_name
)
group by team_name
--order by total_medals_won desc
)
natural join
(
select team_name, sum(medals_won) as bronze_medals_won from
(
select team_name, count(*) as medals_won from
(
select team_name, medal, year from
(
select distinct event_id, team_name, medal, year from
(
select * from
(
select * from participates_in
where medal = 'Bronze'
)
natural join
(
select event_id, year from event natural join game
where season = '${season}'
))))
group by team_name
order by team_name
)
group by team_name
--order by total_medals_won desc
)
order by total_medals desc
)
where rownum < 11`

router.get("/(:season)", function(req, res, next) {
  async function run() {
    try {
      const query = seasonSwitcher(req.params.season === 'summer' ? 'Summer' : 'Winter');
      const result = await req.connection.execute(query);
      const country = result.rows.reduce((acc, arr) => [...acc, arr[0]], []);
      const gold = result.rows.reduce((acc, arr) => [...acc, arr[1]], []);
      const silver = result.rows.reduce((acc, arr) => [...acc, arr[2]], []);
      const bronze = result.rows.reduce((acc, arr) => [...acc, arr[3]], []);

      res.send({
        data: {
          country,
          gold,
          silver,
          bronze
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
