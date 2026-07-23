// 🛠️ PythonAnywhere 클라우드 서버 주소로 변경
const BASE_URL = "https://wldus.pythonanywhere.com";
const u = `${BASE_URL}/api/send`;
const callUrl = `${BASE_URL}/api/call`;

let d = JSON.parse(localStorage.getItem("global_shop_records")) || [];
let o = localStorage.getItem("current_user_otp") || "";

window.onload = function () {
  let r = d.find((item) => item.otp === o && item.status === "이용중");
  if (r) {
    document.getElementById("current-user-otp").innerText = o;
    changeView("view-exit-status");
  }
};

function changeView(v) {
  document.getElementById("view-home").classList.add("hidden");
  document.getElementById("view-otp-grant").classList.add("hidden");
  document.getElementById("view-door-opened").classList.add("hidden");
  document.getElementById("view-exit-status").classList.add("hidden");
  document.getElementById("view-login").classList.add("hidden");

  document.getElementById(v).classList.remove("hidden");

  if (v === "view-otp-grant") {
    o = String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById("generated-otp").innerText = o;
  }
}

function getTime() {
  return new Date().toLocaleTimeString();
}

// 🚨 관리자 호출 함수
function actionCallAdmin() {
  fetch(callUrl, { method: "POST" })
    .then((n) => n.json())
    .then((d) => {
      let m = JSON.parse(localStorage.getItem("global_call_records")) || [];
      let c = new Date();
      let h = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")} ${String(c.getHours()).padStart(2, "0")}:${String(c.getMinutes()).padStart(2, "0")}`;

      m.push({ time: h, status: "호출됨" });
      localStorage.setItem("global_call_records", JSON.stringify(m));

      alert("관리자를 호출했습니다.");
    })
    .catch((e) => {
      alert("통신 오류");
    });
}

function actionEnter() {
  const t = getTime();
  const rec = {
    otp: o,
    inTime: t,
    outTime: "-",
    status: "이용중",
  };

  d.push(rec);
  localStorage.setItem("global_shop_records", JSON.stringify(d));
  localStorage.setItem("current_user_otp", o);

  fetch(u, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rec),
  })
    .then((res) => res.json())
    .then((data) => console.log("🎉 중계 성공:", data))
    .catch((err) => console.error("❌ 전송 실패:", err));

  changeView("view-door-opened");
  document.getElementById("current-user-otp").innerText = o;
}

function actionExitConfirm() {
  let c = confirm("가게에서 퇴장하시겠습니까?");

  if (c) {
    const t = getTime();
    let r = d.find((item) => item.otp === o && item.status === "이용중");

    if (r) {
      r.outTime = t;
      r.status = "퇴장완료";
    }

    localStorage.setItem("global_shop_records", JSON.stringify(d));
    localStorage.removeItem("current_user_otp");

    const exitRec = {
      otp: o,
      inTime: r ? r.inTime : "-",
      outTime: t,
      status: "퇴장완료",
    };

    fetch(u, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exitRec),
    })
      .then((res) => res.json())
      .then((data) => console.log("🎉 퇴장 전송 성공:", data))
      .catch((err) => console.error("❌ 퇴장 전송 실패:", err));

    alert("퇴장 처리가 완료되었습니다. 안녕히 가세요!");
    o = "";
    document.getElementById("input-otp").value = "";
    changeView("view-home");
  }
}

function actionLoginCheck() {
  const inputOtp = document.getElementById("input-otp").value;
  let r = d.find((item) => item.otp === inputOtp && item.status === "이용중");

  if (r) {
    o = inputOtp;
    localStorage.setItem("current_user_otp", o);
    document.getElementById("current-user-otp").innerText = o;
    changeView("view-exit-status");
  } else {
    alert("이용 중인 기록이 없거나 이미 퇴장 처리된 OTP입니다.");
    changeView("view-home");
  }
}
