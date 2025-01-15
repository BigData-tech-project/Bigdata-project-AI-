import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userPw2, setUserPw2] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    userId: "",
    userPw: "",
    userPw2: "",
    email: "",
    nickname: "",
  });

  const validateFields = (field, value) => {
    const errors = { ...fieldErrors };

    if (field === "userId") {
      if (value.length < 6 || value.length > 16) {
        errors.userId = "아이디는 6자 이상, 최대 16자까지 가능해요.";
      } else {
        errors.userId = "";
      }
    }

    if (field === "userPw") {
      if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
        errors.userPw = "비밀번호는 8자 이상, 영어와 숫자를 포함해야해요.";
      } else {
        errors.userPw = "";
      }
    }

    if (field === "userPw2") {
      if (value !== userPw) {
        errors.userPw2 = "비밀번호가 일치하지 않아요.";
      } else {
        errors.userPw2 = "";
      }
    }

    if (field === "email") {
      if (value && (value.length > 40 || !/\S+@\S+\.\S+/.test(value))) {
        errors.email = "유효한 이메일을 입력하거나 공란으로 두세요.";
      } else {
        errors.email = "";
      }
    }

    if (field === "nickname") {
      if (value.length > 20) {
        errors.nickname = "닉네임은 최대 20자까지 가능해요.";
      } else {
        errors.nickname = "";
      }
    }

    setFieldErrors(errors);
  };

  const handleChange = (field, value) => {
    switch (field) {
      case "userId":
        setUserId(value);
        break;
      case "userPw":
        setUserPw(value);
        break;
      case "userPw2":
        setUserPw2(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "nickname":
        setNickname(value);
        break;
      default:
        break;
    }
    validateFields(field, value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(fieldErrors).some((error) => error !== "");
    if (hasErrors) {
      setErrorMessage("입력값을 다시 확인해주세요.");
      return;
    }

    const salt = generateRandomString(50);
    const hashedPassword = await hashPasswordPBKDF2(userPw, salt);

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          pw: hashedPassword,
          email: email,
          nickname: nickname,
          salt: salt,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setErrorMessage("");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setErrorMessage(data.message || "회원가입을 실패했어요.");
      }
    } catch (error) {
      setErrorMessage("서버에 요청을 실패했어요.");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  async function hashPasswordPBKDF2(password, salt) {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const saltBytes = encoder.encode(salt);

    const key = await crypto.subtle.importKey("raw", passwordBytes, { name: "PBKDF2" }, false, [
      "deriveKey",
    ]);

    const pbkdf2Key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      { name: "HMAC", hash: "SHA-256", length: 256 },
      false,
      ["sign"]
    );

    const hashBuffer = await crypto.subtle.sign("HMAC", pbkdf2Key, passwordBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(array, (byte) => characters[byte % characters.length]).join("");
  }

  return (
    <div className="register-container">
      <h1>회원가입</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="user-id">아이디</label>
          <input
            type="text"
            id="user-id"
            value={userId}
            onChange={(e) => handleChange("userId", e.target.value)}
            required
          />
          {fieldErrors.userId && <p className="error-message">{fieldErrors.userId}</p>}
        </div>
        <div>
          <label htmlFor="user-pw">비밀번호</label>
          <input
            type="password"
            id="user-pw"
            value={userPw}
            onChange={(e) => handleChange("userPw", e.target.value)}
            required
          />
          {fieldErrors.userPw && <p className="error-message">{fieldErrors.userPw}</p>}
        </div>
        <div>
          <label htmlFor="user-pw2">비밀번호 확인</label>
          <input
            type="password"
            id="user-pw2"
            value={userPw2}
            onChange={(e) => handleChange("userPw2", e.target.value)}
            required
          />
          {fieldErrors.userPw2 && <p className="error-message">{fieldErrors.userPw2}</p>}
        </div>
        <div>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            placeholder="선택"
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {fieldErrors.email && <p className="error-message">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            placeholder="선택"
            onChange={(e) => handleChange("nickname", e.target.value)}
          />
          {fieldErrors.nickname && <p className="error-message">{fieldErrors.nickname}</p>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "가입중..." : "회원가입"}
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
}

export default Register;