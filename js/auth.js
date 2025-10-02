// ✅ Firebase 通用初始化
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDKAAxNpKqcSsS2onwlKANl9tLmCy6UGo",
  authDomain: "ht-chat-91e5f.firebaseapp.com",
  databaseURL: "https://ht-chat-91e5f-default-rtdb.firebaseio.com",
  projectId: "ht-chat-91e5f",
  storageBucket: "ht-chat-91e5f.appspot.com", // ✅ 确认这里改成 appspot.com
  messagingSenderId: "325331727527",
  appId: "1:325331727527:web:d994b7241a7cc28e9dd782",
  measurementId: "G-VYV13LWP14"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// ✅ 自动监听登录状态
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("已登录:", user.email);

    // 更新头像（如果有头像元素）
    if (document.getElementById("userPhoto")) {
      document.getElementById("userPhoto").src = user.photoURL || "assets/login-placeholder.svg";
    }

    // 从数据库读取用户资料
    const userRef = ref(db, "users/" + user.uid);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (document.getElementById("userNickname")) {
        document.getElementById("userNickname").textContent = data.nickname || "";
      }
    }
  } else {
    console.log("未登录");
    if (document.getElementById("userPhoto")) {
      document.getElementById("userPhoto").src = "assets/login-placeholder.svg";
    }
  }
});

// ✅ 公共登出
export function logout() {
  signOut(auth);
}
