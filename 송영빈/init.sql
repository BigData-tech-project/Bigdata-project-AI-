-- USERS 테이블 생성
CREATE TABLE USERS (
    ID VARCHAR(16) NOT NULL PRIMARY KEY,
    PASSWORD VARCHAR(64) NOT NULL, -- SHA256은 64자의 고정 길이 해시
    EMAIL VARCHAR(40),
    NICKNAME VARCHAR(20) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- INFO 테이블 생성
CREATE TABLE INFO (
    ID VARCHAR(16) NOT NULL,
    REGION VARCHAR(16),
    DISEASES VARCHAR(100),
    PRIMARY KEY (ID),
    FOREIGN KEY (ID) REFERENCES USERS(ID) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO USERS VALUES ('testid', '9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05', 'email@test.com', '테스트계정');
-- password: testpassword
INSERT INTO INFO VALUES ('testid', '울산', '축농증, 비만');

INSERT INTO USERS VALUES ('admin', '749f09bade8aca755660eeb17792da880218d4fbdc4e25fbec279d7fe9f65d70', 'admin@test.com', '관리자계정');
-- password: adminpassword
INSERT INTO INFO VALUES ('admin', '부산', '기관지염');