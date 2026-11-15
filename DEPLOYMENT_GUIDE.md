# Tintoro Shop 배포 가이드

## 📋 현재 상태

- Cloudflare Pages 프로젝트: `tintoro`
- 기본 도메인: `https://tintoroshop.com`
- B2B 도매 포털: `https://tintoroshop.com/wholesale`
- 프로덕션 브랜치: `backup/tintoro-final-20261114`
- D1 데이터베이스 바인딩과 Cloudflare Access 설정은 완료되어 있습니다.
- `/admin/`과 `/api/admin/*`는 관리자용 Cloudflare Access 및 서버 측 권한 확인을 유지합니다.
- 공개 도매 카탈로그와 주문 기능은 고객 인증이 준비될 때까지 비활성화되어 있습니다. `kbeauty.html`과 `m_kbeauty.html`은 가격이나 주문 데이터를 포함하지 않는 액세스 안내 페이지입니다.
- `/api/accounts/verify`는 고객 계정번호를 공개 검증하지 않도록 일시 중지되어 있습니다.
- 공개 배포 전 고객 인증, 개인정보 처리방침 및 실제 운영 주체를 다시 확인하세요.

## 🚀 Cloudflare Pages 배포 방법

### 기존 프로젝트에 배포

현재 Pages 프로젝트는 GitHub 저장소 `qnam0321/tintotoshop-web`의 프로덕션 브랜치 `backup/tintoro-final-20261114`를 배포합니다. 이 브랜치에 변경사항을 푸시하면 Cloudflare Pages가 자동으로 배포합니다.

빌드 명령은 비워 두고 출력 디렉터리는 저장소 루트(`.`)를 사용합니다. 새 Pages 프로젝트를 만들거나 프로덕션 브랜치를 `main`으로 변경하지 마세요.

### 배포 후 접속 정보

**프로덕션 URL:**
```
https://tintoroshop.com
```

**B2B 도매 포털:**
```
https://tintoroshop.com/wholesale
```

GitHub 백업/프로덕션 브랜치:
```
https://github.com/qnam0321/tintotoshop-web/tree/backup/tintoro-final-20261114
```

## 🔗 GitHub 저장소

**Repository URL:**
```
https://github.com/qnam0321/tintotoshop-web
```

**클론 명령어:**
```bash
git clone https://github.com/qnam0321/tintotoshop-web.git
```

## 📝 웹사이트 파일 구조

```
tintotoshop-web/
├── index.html          (메인 홈페이지)
├── page2.html          (추가 페이지)
├── kbeauty.html        (도매 액세스 안내, 가격·주문 기능 없음)
├── m_kbeauty.html      (모바일 도매 액세스 안내, 가격·주문 기능 없음)
├── styles.css          (스타일시트)
├── script.js           (JavaScript 로직)
├── wholesale/          (B2B 포털: /wholesale)
├── wholesale.html      (/wholesale 경로 호환 리디렉션)
├── assets/             (카탈로그 상품 이미지)
├── product-images.js   (상품 이미지 매핑)
├── _redirects          (Cloudflare Pages 경로 리디렉션)
├── robots.txt          (검색 크롤링 안내)
├── sitemap.xml         (공개 URL 사이트맵)
├── account-client.js   (서버 계정 검증 호출)
├── admin/              (계정 관리자 화면)
├── functions/          (Pages Functions API)
├── migrations/         (D1 데이터베이스 스키마)
├── _routes.json        (API 요청 라우팅)
├── package.json        (프로젝트 메타데이터)
├── README.md           (프로젝트 설명)
└── DEPLOYMENT_GUIDE.md (배포 및 계정 관리자 안내)
```

## ⚡ 이후 작업

### 웹사이트 수정 방법

1. **로컬에서 수정:**
   ```bash
   git clone https://github.com/qnam0321/tintotoshop-web.git
   cd tintotoshop-web
   # 파일 수정...
   ```

2. **프로덕션 브랜치에 푸시:**
   ```bash
   git add .
   git commit -m "Update website content"
   git push origin backup/tintoro-final-20261114
   ```

3. **자동 배포:**
   - Cloudflare Pages가 자동으로 감지하여 배포
   - 1-2분 후 변경사항 반영됨

### 도메인 연결 (선택)

나중에 도메인을 연결하려면:
1. Cloudflare에서 Pages 프로젝트 클릭
2. "Custom domains" 섹션
3. 도메인 추가

## 🔐 관리자 계정 설정

도매 계정 정보는 Cloudflare D1에 저장됩니다. 현재 프로덕션에는 D1 바인딩과 관리자 전용 Access가 설정되어 있습니다. 환경을 새로 구성할 때는 아래 설정을 적용하세요.

### 1. D1 데이터베이스 생성 및 연결

1. Cloudflare 대시보드에서 **Workers & Pages → D1 SQL Database**로 이동해 데이터베이스를 생성합니다.
2. D1 콘솔에서 `migrations/0001_create_wholesale_accounts.sql`의 SQL을 실행합니다.
3. Pages 프로젝트의 **Settings → Functions → D1 database bindings**에서 변수명 `DB`로 데이터베이스를 연결합니다.
4. 저장 후 Pages 프로젝트를 다시 배포합니다.

### 2. Cloudflare Access 설정

같은 Pages 호스트에 이메일 allowlist 정책을 적용하는 Access 애플리케이션을 만듭니다.

- 관리자 페이지 경로: `/admin*`
- 관리자 API 경로: `/api/admin*`
- 두 애플리케이션 모두 관리자 이메일만 허용합니다. `pages.dev`와 사용자 지정 도메인을 모두 쓸 경우 각 호스트에도 보호 정책을 적용합니다.

Pages 프로젝트의 **Settings → Variables and Secrets**에 다음 변수를 추가하고 다시 배포합니다.

- `ACCESS_TEAM_DOMAIN`: 예) `https://your-team.cloudflareaccess.com`
- `ACCESS_AUDS`: 위 두 Access 애플리케이션의 Audience 값. 쉼표로 구분합니다.
- `ADMIN_EMAILS`: 허용할 관리자 이메일 주소(여러 개면 쉼표로 구분)

서버 API에서도 Access 서명, issuer, audience, 만료 시각과 관리자 이메일을 확인합니다. 환경 변수가 빠졌거나 D1이 연결되지 않으면 관리자 API는 오류를 반환합니다.

### 3. 계정 정보 등록

Access 정책을 통과한 관리자는 `https://tintoroshop.com/admin/`에서 계정번호와 점포 정보를 추가·수정하거나 비활성화할 수 있습니다. 관리자 URL은 공개 도매 푸터에 링크하지 않습니다. 고객 포털은 별도 고객 인증이 설정되기 전까지 계정번호를 조회하거나 검증하지 않습니다.

## 🛡️ 고객용 도매 주문 재개 요건

- 현재 Access 설정과 서버 권한 검사는 관리자 전용입니다. D1 계정번호 확인은 이전에 브라우저에서 호출하는 공개 API였으며 고객 신원 인증을 제공하지 않습니다. 해당 공개 검증 API는 비활성화했습니다.
- 주문을 재개하기 전, 고객에게 적용할 로그인/이메일 allowlist 정책을 정하고 Cloudflare Access 또는 동등한 서버 측 인증을 구성하세요. 인증된 이메일과 D1 도매 계정을 연결하는 방식도 확정해야 합니다.
- 데스크톱·모바일·확장자 유무의 모든 주문 URL과 가격 데이터 요청을 같은 인증 정책으로 보호하세요. 가격을 정적 HTML, JavaScript, JSON, 이미지 메타데이터 또는 공개 캐시에 두지 말고 인증이 확인된 서버 경로에서만 제공해야 합니다.
- 주문 제출 역시 서버에서 인증과 입력을 검증해야 합니다. 기존 폼은 재고·가격·배송 확인 전 주문 요청 방식이었습니다. 향후 폼을 다시 만들 때는 버튼을 `Submit Order Request`로 표시하고, 제출 전 `We’ll confirm availability, pricing, and shipping before finalizing your order.`를 보여주며, 성공 응답 후 `Order request received`를 표시하세요.
- 기존 도매 문의 폼은 일반 계정 문의에도 사업장 주소를 필수로 요구했지만, 액세스 승인에 주소가 필요한 근거는 확인되지 않았습니다. 주소를 요구하지 말고, 실제 주문을 처리할 때 필요한 배송 주소만 별도 수집하세요.
- 기존 주문·문의 페이지는 Formspree를 사용했습니다. 새 액세스 안내 페이지에서는 전송 폼을 제거했지만, Formspree 계정에 기존 제출 기록이 남아 있는지와 보관·삭제 설정은 운영자가 확인해야 합니다.

## 🔏 개인정보 처리방침 검토

- 게시 가능한 최종 개인정보 처리방침은 아직 확인되지 않았으며, 액세스 요청 링크는 이메일 앱을 여는 mailto 방식입니다. 확정 전 정책 링크를 공개 페이지에 추가하지 마세요.
- 과거 주문 요청 폼은 계정번호, 업체명, 전화번호, 사업장 주소, 이메일, 주문 품목·수량, 합계와 메모를 Formspree로 전송했습니다. 일반 계정 문의 폼도 이름, 업체명, 전화번호, 사업장 주소, 이메일과 메모를 수집했습니다.
- 개인정보 처리방침 초안을 공개하기 전에 Formspree 계정과 처리 내역, Cloudflare Pages/Access/D1 로그 및 보관, `info@tintoroshop.com` 메일 서비스, Google Fonts 사용 여부, 쿠키·분석 도구 설정, 보관 기간 및 삭제 절차를 확인하세요. 확인되지 않은 보관·쿠키·분석 주장은 게시하지 마세요.

## ❓ 트러블슈팅

### 배포가 안 되는 경우
- Build output directory를 `.` 또는 `/`로 설정했는지 확인
- Framework를 "None"으로 설정했는지 확인
- GitHub 저장소가 public인지 확인

### 파일이 안 보이는 경우
- `index.html`이 루트 디렉토리에 있는지 확인
- 파일 경로가 정확한지 확인
- 캐시를 새로고침 (Ctrl+Shift+Delete)

## 📞 지원

**Cloudflare Pages 문서:**
https://developers.cloudflare.com/pages/

**GitHub Pages 대안:**
https://pages.github.com/

---

**상태:** 공개 도매 주문은 고객 인증 및 서버 측 가격 보호가 구현될 때까지 비활성화합니다.
