// Firebase 通用初始化
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDKAAxNpKqcSsS2onwlKANl9tLmCy6UGo",
  authDomain: "ht-chat-91e5f.firebaseapp.com",
  databaseURL: "https://ht-chat-91e5f-default-rtdb.firebaseio.com",
  projectId: "ht-chat-91e5f",
  storageBucket: "ht-chat-91e5f.appspot.com",
  messagingSenderId: "325331727527",
  appId: "1:325331727527:web:d994b7241a7cc28e9dd782",
  measurementId: "G-VYV13LWP14"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// 监听登录状态
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("已登录:", user.email);

    // 从数据库获取头像等信息
    const userRef = ref(db, "users/" + user.uid);
    const snapshot = await get(userRef);

    let avatar = "assets/login-placeholder.svg";
    if (snapshot.exists() && snapshot.val().avatar) {
      avatar = snapshot.val().avatar;
    } else if (user.photoURL) {
      avatar = user.photoURL;
    }

    // ✅ 页面上所有带 userPhoto 的元素都会更新
    document.querySelectorAll("#userPhoto, #userPhotoPreview").forEach(img => {
      img.src = avatar;
    });
  } else {
    // 未登录 → 显示默认头像
    document.querySelectorAll("#userPhoto, #userPhotoPreview").forEach(img => {
      img.src = "assets/login-placeholder.svg";
    });
  }
});

// 公共登出
export function logout() {
  signOut(auth);
}
