/* ===== firebase-db.js : 전 페이지 공통 클라우드 저장 모듈 ===== */

/* 1) STEP 3에서 복사한 본인의 firebaseConfig 로 교체하세요 */
const firebaseConfig = {
  apiKey: "여기에_본인_값",
  authDomain: "여기에_본인_값",
  projectId: "여기에_본인_값",
  storageBucket: "여기에_본인_값",
  messagingSenderId: "여기에_본인_값",
  appId: "여기에_본인_값"
};

firebase.initializeApp(firebaseConfig);
const fsdb = firebase.firestore();

/* 2) 현장 구분 코드: 각 현장 PC에서 최초 1회만 물어보고 기억합니다 */
var SITE_ID = "";
try {
  SITE_ID = localStorage.getItem("site_id") || "";
  if (!SITE_ID) {
    SITE_ID = (prompt("이 PC의 현장 코드를 입력하세요 (예: 강남현장)") || "미지정").trim();
    localStorage.setItem("site_id", SITE_ID);
  }
} catch (e) { SITE_ID = "미지정"; }

/* 3) 클라우드 저장: dbSave("저장키", 데이터) */
function dbSave(key, value) {
  return fsdb.collection("siteData").doc(SITE_ID + "_" + key).set({
    site: SITE_ID,
    key: key,
    value: JSON.stringify(value),
    updatedAt: new Date().toISOString()
  }).catch(function (e) { console.warn("클라우드 저장 실패(오프라인?):", e); });
}

/* 4) 클라우드 불러오기: dbLoad("저장키", 기본값).then(데이터 => ...) */
function dbLoad(key, fallback) {
  return fsdb.collection("siteData").doc(SITE_ID + "_" + key).get()
    .then(function (snap) {
      return snap.exists ? JSON.parse(snap.data().value) : fallback;
    })
    .catch(function () { return fallback; });
}
