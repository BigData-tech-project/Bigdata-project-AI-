document.addEventListener("DOMContentLoaded", function() {
    const loginButton = document.getElementById('login');
    const loginForm = document.querySelector('form');

    loginButton.addEventListener('click', function(event) {
        event.preventDefault();

        const id = document.getElementById('id').value.trim();
        const pw = document.getElementById('pw').value.trim();

        if (id === '') {
            alert('아이디를 입력하세요.');
            return;
        }

        if (pw === '') {
            alert('비밀번호를 입력하세요.');
            return;
        }

        // 비밀번호를 SHA-256으로 인코딩
        hashPassword(pw).then((hashedPw) => {
            // 유효성 검사를 통과하면 AJAX로 로그인 요청
            const formData = new FormData();
            formData.append('id', id);
            formData.append('pw', hashedPw);  // 해싱된 비밀번호를 전송

            fetch('/login/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken,  // Django CSRF 토큰
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 로그인 성공 후 리디렉션
                    window.location.href = '/';  // 루트로 이동
                } else {
                    alert('아이디나 비밀번호가 잘못되었습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('로그인 요청에 실패했습니다.');
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