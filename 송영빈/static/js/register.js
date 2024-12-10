document.addEventListener("DOMContentLoaded", function() {
    const registerButton = document.getElementById('login');

    registerButton.addEventListener('click', function(event) {
        event.preventDefault();

        const id = document.getElementById('id').value.trim();
        const pw = document.getElementById('pw').value.trim();
        const repw = document.getElementById('repw').value.trim();
        const email = document.getElementById('email').value.trim();
        const nickname = document.getElementById('nickname').value.trim();

        // 유효성 검사
        if (id === '') {
            alert('아이디를 입력하세요.');
            return;
        }

        if (pw === '' || repw === '') {
            alert('비밀번호를 입력하세요.');
            return;
        }

        if (pw !== repw) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (pw.length < 8) {
            alert('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        // 비밀번호를 SHA-256으로 해싱
        hashPassword(pw).then((hashedPw) => {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('pw', hashedPw);  // 해싱된 비밀번호
            if (email) formData.append('email', email);  // 이메일이 선택적으로 입력되었을 때만 추가
            if (nickname) formData.append('nickname', nickname);  // 별명이 선택적으로 입력되었을 때만 추가

            // 서버로 데이터 전송
            fetch('/register/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken,  // Django CSRF 토큰
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('회원가입이 완료되었습니다.');
                    window.location.href = '/nidLogin/';  // 로그인 페이지로 리디렉션
                } else {
                    alert(data.message || '회원가입에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 요청 중 오류가 발생했습니다.');
            });
        }).catch(error => {
            console.error('Error in password hashing:', error);
            alert('비밀번호 해싱에 실패했습니다.');
        });
    });

    // 비밀번호를 SHA-256으로 해싱하는 함수
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
});
