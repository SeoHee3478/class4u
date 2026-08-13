const express = require("express");

const app = express();
const PORT = 3000;

const courses = [
  { title: "요가 기초반", weekdays: ["월", "수"], price: 30000 },
  { title: "캘리그라피 입문", weekdays: ["화"], price: 25000 },
  { title: "생활 코딩 클래스", weekdays: ["목", "금"], price: 40000 },
];

app.get("/courses", (req, res) => {
  res.json(courses);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
