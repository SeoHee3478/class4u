const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const pool = require("./db");
const { fetchAndSaveCourses } = require("./fetchCourses");

const app = express();
const PORT = 3000;
const CRON_SCHEDULE = process.env.FETCH_CRON_SCHEDULE || "0 3 * * *";
const REGISTRATION_STATUS_CASE = `
  CASE
    WHEN registration_start IS NULL OR registration_end IS NULL THEN NULL
    WHEN registration_start > CURRENT_DATE THEN '접수예정'
    WHEN registration_end >= CURRENT_DATE THEN '접수중'
    ELSE '접수마감'
  END
`;

app.use(cors());

cron.schedule(CRON_SCHEDULE, () => {
  console.log("강좌 정기 재수집 시작");
  fetchAndSaveCourses().catch((err) =>
    console.error("정기 재수집 실패:", err),
  );
});

app.get("/courses", async (req, res) => {
  try {
    const { weekday, status, priceType } = req.query;
    const weekdays = weekday ? [].concat(weekday) : [];
    const statuses = status ? [].concat(status) : [];
    console.log("받은 필터 조건:", { weekdays, statuses, priceType });

    let query = "SELECT * FROM courses WHERE 1=1";
    const params = [];

    if (weekdays.length > 0) {
      params.push(weekdays);
      query += ` AND weekdays && $${params.length}::text[]`;
    }

    if (statuses.length > 0) {
      params.push(statuses);
      query += ` AND (${REGISTRATION_STATUS_CASE}) = ANY($${params.length}::text[])`;
    }

    if (priceType === "free") {
      query += " AND price = 0";
    } else if (priceType === "paid") {
      query += " AND price > 0";
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
