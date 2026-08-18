require("dotenv").config();
const axios = require("axios");
const pool = require("./db");

const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;
const API_URL = "https://api.data.go.kr/openapi/tn_pubr_public_lftm_lrn_lctre_api";
const NUM_OF_ROWS = 1000;
const REGION_KEYWORD = "경기도 성남시";

async function fetchAllItems() {
  const allItems = [];
  let pageNo = 1;

  while (true) {
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        pageNo,
        numOfRows: NUM_OF_ROWS,
        type: "json",
      },
    });

    const items = response.data.body.items.item || [];
    const totalCount = response.data.body.totalCount;
    allItems.push(...items);

    if (pageNo * NUM_OF_ROWS >= totalCount || items.length === 0) break;
    pageNo++;
  }

  return allItems;
}

async function fetchAndSaveCourses() {
  try {
    const allItems = await fetchAllItems();
    console.log(`전체 강좌 수: ${allItems.length}`);

    // edcPlace(교육 장소)가 아닌 edcRdnmadr(교육장 도로명주소)로 지역을 판별해야
    // "성남이로"(부산), "금성남부교회"(담양) 같은 우연한 문자열 일치를 피할 수 있다.
    const items = allItems.filter((item) =>
      (item.edcRdnmadr || "").includes(REGION_KEYWORD),
    );
    console.log(`성남 강좌 수: ${items.length}`);

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
