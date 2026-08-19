const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const pool = require("./db");
const { fetchAndSaveCourses } = require("./fetchCourses");

const app = express();
const PORT = 3000;
const CRON_SCHEDULE = process.env.FETCH_CRON_SCHEDULE || "0 3 * * *";

app.use(cors());

cron.schedule(CRON_SCHEDULE, () => {
  console.log("강좌 정기 재수집 시작");
  fetchAndSaveCourses().catch((err) =>
    console.error("정기 재수집 실패:", err),
  );
});

app.get("/courses", async (req, res) => {
  try {
    const { weekday, maxprice } = req.query;
    console.log("받은 필터 조건:", { weekday, maxprice });

    let query = "SELECT * FROM courses WHERE 1=1";
    const params = [];
    if (weekday) {
      params.push(weekday);
      query += ` AND $${params.length} = ANY(weekdays)`;
    }

    if (maxprice) {
      params.push(maxprice);
      query += ` AND price <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "DB 조회 실패" });
  }
});

app.get("/courses/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "강좌를 찾을 수 없습니다" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "DB 조회 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
