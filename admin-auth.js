/* =========================================================
   admin-auth.js — 본사 관리자 암호 인증 공통 모듈
   - 어느 기기에서든 암호를 입력해 본사 관리자임을 인증합니다.
   - 인증되면 그 기기(브라우저)에 기억되어 다시 묻지 않습니다.
   - 암호는 원문이 아니라 SHA-256 해시로만 보관됩니다.
   ========================================================= */

/* 관리자 암호의 SHA-256 해시 (원문: 코드에 적지 않음) */
var ADMIN_PW_HASH = "71c4aed236a85e9d8336bbe94f4b8866e3884ee0c3813ce844f1319a00081588";

/* 이 기기가 관리자 인증을 통과했는지 표시하는 저장 키 */
var ADMIN_FLAG_KEY = "admin_authed";
var ADMIN_FLAG_VALUE = "yangji-ok-v1";   // 단순 플래그 값(버전 포함)

/* 입력 문자열을 SHA-256 16진수 문자열로 변환 (브라우저 내장 기능 사용) */
function sha256Hex(text) {
    var enc = new TextEncoder();
    return crypto.subtle.digest("SHA-256", enc.encode(text)).then(function (buf) {
        var arr = Array.prototype.slice.call(new Uint8Array(buf));
        return arr.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
}

/* 이 기기가 이미 관리자로 인증되어 있는가 */
function isAdminAuthed() {
    try { return localStorage.getItem(ADMIN_FLAG_KEY) === ADMIN_FLAG_VALUE; }
    catch (e) { return false; }
}

/* 관리자 인증 해제(로그아웃) */
function adminLogout() {
    try { localStorage.removeItem(ADMIN_FLAG_KEY); } catch (e) {}
}

/* 암호를 입력받아 검증. 성공 시 이 기기를 관리자로 기억하고 true 반환.
   - onResult(true/false) 콜백으로 결과를 전달 (비동기) */
function promptAdminLogin(onResult) {
    var input = window.prompt("본사 관리자 암호를 입력하세요");
    if (input === null) { if (onResult) onResult(false); return; }   // 취소
    sha256Hex(input).then(function (h) {
        if (h === ADMIN_PW_HASH) {
            try { localStorage.setItem(ADMIN_FLAG_KEY, ADMIN_FLAG_VALUE); } catch (e) {}
            if (onResult) onResult(true);
        } else {
            alert("암호가 올바르지 않습니다.");
            if (onResult) onResult(false);
        }
    }).catch(function () {
        alert("인증 처리 중 오류가 발생했습니다.");
        if (onResult) onResult(false);
    });
}
