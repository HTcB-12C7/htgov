// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup,
  GoogleAuthProvider, updateEmail, sendEmailVerification,
  linkWithPopup, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, get } 
  from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } 
  from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// ✅ Firebase 配置
const firebaseConfig = { /* 你的配置 */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// ✅ 切换显示
window.toggleAccountInfo = function () {
  const popup = document.getElementById('accountPopup');
  popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
};

// ✅ 登录
document.addEventListener("click", (e) => {
  if (e.target.id === "loginBtn") {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password).catch(err => alert(err.message));
  }

  if (e.target.id === "googleLoginBtn") {
    signInWithPopup(auth, provider).catch(err => alert(err.message));
  }

  if (e.target.id === "bindGoogleBtn") {
    const user = auth.currentUser;
    if (!user) return alert("请先登录");
    linkWithPopup(user, provider).then(() => alert("绑定成功")).catch(err => alert(err.message));
  }

  if (e.target.id === "sendVerifyBtn") {
    const user = auth.currentUser;
    if (!user) return alert("请先登录");
    const newEmail = document.getElementById("userEmail").value;
    updateEmail(user, newEmail).then(() => sendEmailVerification(user)).then(() => {
      alert("验证邮件已发送！");
    }).catch(err => alert(err.message));
  }

  if (e.target.id === "saveBtn") {
    saveUserInfo();
  }

  if (e.target.id === "logoutBtn") {
    signOut(auth);
  }
});

// ✅ 保存信息（含头像）
let newAvatarFile = null;
document.addEventListener("change", (e) => {
  if (e.target.id === "updateAvatar") {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      newAvatarFile = file;
      document.getElementById("userPhotoPreview").src = URL.createObjectURL(file);
    } else {
      alert("图片不能超过2MB");
    }
  }
});

async function saveUserInfo() {
  const user = auth.currentUser;
  if (!user) return alert("请先登录");

  let avatarURL = document.getElementById("userPhoto").src;
  if (newAvatarFile) {
    const fileRef = sRef(storage, "avatars/" + user.uid + ".jpg");
    await uploadBytes(fileRef, newAvatarFile);
    avatarURL = await getDownloadURL(fileRef);
    document.getElementById("userPhoto").src = avatarURL;
  }

  await set(ref(db, "users/" + user.uid), {
    nickname: document.getElementById("userNickname").value,
    email: document.getElementById("userEmail").value,
    payMethod: document.getElementById("userPayMethod").value,
    payName: document.getElementById("userPayName").value,
    payAccount: document.getElementById("userPayAccount").value,
    avatar: avatarURL
  });

  alert("信息已更新！");
}

// ✅ 状态监听
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("userInfo").style.display = "block";

    const snapshot = await get(ref(db, "users/" + user.uid));
    const data = snapshot.exists() ? snapshot.val() : {};
    document.getElementById("userNickname").value = data.nickname || "";
    document.getElementById("userEmail").value = data.email || user.email || "";
    document.getElementById("userPayMethod").value = data.payMethod || "";
    document.getElementById("userPayName").value = data.payName || "";
    document.getElementById("userPayAccount").value = data.payAccount || "";

    document.getElementById("userPhoto").src = data.avatar || user.photoURL || "assets/login-placeholder.svg";
    document.getElementById("userPhotoPreview").src = data.avatar || user.photoURL || "assets/login-placeholder.svg";
  } else {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("userInfo").style.display = "none";
    document.getElementById("userPhoto").src = "assets/login-placeholder.svg";
  }
});
