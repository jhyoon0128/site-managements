/* =========================================================
   firebase-db.js — 전 페이지 공통 클라우드(Firestore) 저장 모듈
   - 모든 페이지에서 localStorage 와 클라우드를 동시에 사용합니다.
   - 인터넷이 끊겨도 페이지는 localStorage 만으로 정상 동작합니다.
   ========================================================= */

var SITE_ID = "미지정";
var fsdb = null;

(function () {
    /* ★ STEP 3 에서 복사한 본인의 firebaseConfig 로 교체하세요 ★ */
    var firebaseConfig = {
        apiKey:            "(ehs-site-inspection 의 apiKey)",
        authDomain:        "ehs-site-inspection.firebaseapp.com",
        projectId:         "ehs-site-inspection",
        storageBucket:     "ehs-site-inspection.appspot.com",
        messagingSenderId: "(ehs-site-inspection 의 messagingSenderId)",
        appId:             "(ehs-site-inspection 의 appId)"
    };

    /* 현장 구분 코드: 각 PC 최초 1회만 입력받아 기억 */
    try { SITE_ID = localStorage.getItem("site_id") || ""; } catch (e) { SITE_ID = ""; }
    if (!SITE_ID) {
        try {
            SITE_ID = (prompt("이 PC의 현장 코드를 입력하세요 (예: 강남현장)") || "미지정").trim() || "미지정";
            localStorage.setItem("site_id", SITE_ID);
        } catch (e) { SITE_ID = "미지정"; }
    }

    try {
        if (typeof firebase !== "undefined" && firebaseConfig.apiKey.indexOf("여기에") === -1) {
            firebase.initializeApp(firebaseConfig);
            fsdb = firebase.firestore();
        } else if (typeof firebase !== "undefined") {
            console.warn("firebase-db.js: firebaseConfig 를 본인 값으로 교체해 주세요.");
        }
    } catch (e) { console.warn("Firebase 초기화 실패:", e); fsdb = null; }
})();

/* 문서 ID: 현장코드_저장키 ('/' 는 Firestore 에서 금지되므로 치환) */
function _docId(key) { return (SITE_ID + "_" + key).replace(/\//g, "-"); }

/* 클라우드 저장 */
function dbSave(key, value) {
    if (!fsdb) return Promise.resolve(false);
    return fsdb.collection("siteData").doc(_docId(key)).set({
        site: SITE_ID,
        key: key,
        value: JSON.stringify(value),
        updatedAt: new Date().toISOString()
    }).then(function () { return true; })
      .catch(function (e) { console.warn("클라우드 저장 실패(오프라인?):", e); return false; });
}

/* 클라우드 삭제 */
function dbDelete(key) {
    if (!fsdb) return Promise.resolve(false);
    return fsdb.collection("siteData").doc(_docId(key)).delete()
        .then(function () { return true; })
        .catch(function (e) { console.warn("클라우드 삭제 실패:", e); return false; });
}

/* 클라우드에서 1건 불러오기 */
function dbLoad(key, fallback) {
    if (!fsdb) return Promise.resolve(fallback);
    return fsdb.collection("siteData").doc(_docId(key)).get()
        .then(function (snap) {
            return snap.exists ? JSON.parse(snap.data().value) : fallback;
        })
        .catch(function () { return fallback; });
}

/* 이 현장의 클라우드 데이터 전체를 localStorage 로 복원한 뒤 callback(true) 실행 */
function dbSyncAll(callback) {
    if (!fsdb) { if (callback) callback(false); return; }
    fsdb.collection("siteData").where("site", "==", SITE_ID).get()
        .then(function (qs) {
            qs.forEach(function (doc) {
                var d = doc.data();
                if (!d || !d.key) return;
                var v = d.value;
                /* 원본이 순수 문자열로 저장된 키(회사명 등)는 원형으로 복원 */
                try { var p = JSON.parse(v); if (typeof p === "string") v = p; } catch (e) {}
                try { localStorage.setItem(d.key, v); } catch (e) {}
            });
            if (callback) callback(true);
        })
        .catch(function (e) {
            console.warn("클라우드 동기화 실패:", e);
            if (callback) callback(false);
        });
}
