require("dotenv").config();
const axios = require("axios");
const pool = require("./db");

const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;

async function fetchAndSaveCourses() {
  try {
    const response = await axios.get(
      "https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api",
      {
        params: {
          serviceKey: SERVICE_KEY,
          pageNo: 1,
          numOfRows: 100,
          type: "json",
          instt_code: "3780000",
        },
      },
    );

    const items = response.data.body.items.item;
    console.log(`가져온 강좌 수: ${items.length}`);

    for (const item of items) {
      const weekdays = item.operDay ? item.operDay.split("+") : [];
      const price = item.lctreCost ? parseInt(item.lctreCost, 10) : 0;

      await pool.query(
        `INSERT INTO courses
          (title, weekdays, price, target_raw, institution_name, address, start_date, end_date, registration_start, registration_end, homepage_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (title, institution_name, start_date)
         DO UPDATE SET
           weekdays = EXCLUDED.weekdays,
           price = EXCLUDED.price,
           target_raw = EXCLUDED.target_raw,
           address = EXCLUDED.address,
           end_date = EXCLUDED.end_date,
           registration_start = EXCLUDED.registration_start,
           registration_end = EXCLUDED.registration_end,
           homepage_url = EXCLUDED.homepage_url`,
        [
          item.lctreNm,
          weekdays,
          price,
          item.edcTrgetType,
          item.operInstitutionNm,
          item.edcRdnmadr,
          item.edcStartDay || null,
          item.edcEndDay || null,
          item.rceptStartDate || null,
          item.rceptEndDate || null,
          item.homepageUrl,
        ],
      );
    }

    console.log("DB 저장 완료!");
  } catch (error) {
    console.error("실패:", error.message);
  } finally {
    pool.end();
  }
}

fetchAndSaveCourses();
