# Tintoro Shop 배포 가이드

## 📋 현재 상태

- Cloudflare Pages 프로젝트: `tintoro`
- 기본 도메인: `https://tintoroshop.com`
- B2B 도매 포털: `https://tintoroshop.com/wholesale`
- 프로덕션 브랜치: `backup/tintoro-final-20261114`
- D1 데이터베이스 바인딩과 Cloudflare Access 설정은 완료되어 있습니다.
- `/admin/`과 `/api/admin/*`는 관리자용 Cloudflare Access 및 서버 측 권한 확인을 유지합니다.
- 소비자 홈페이지는 현재 공개 준비 버전을 유지합니다. 도매 포털은 `TINTORO` 브랜드로 제공하며, 별도 `TINTORO SHOP` 버튼은 소비자 홈으로 연결합니다.
- 데스크톱·모바일 카탈로그와 상품 이미지/스크립트는 고객 Access JWT와 활성 D1 도매 계정 이메일을 모두 확인한 뒤 제공하도록 구현되어 있습니다. 운영 Access 앱, 고객 audience, 계정 이메일 매핑을 설정하기 전에는 배포하지 마세요.
- `/api/accounts/verify`는 로그인 이메일과 일치하는 활성 계정의 계정번호만 확인합니다. 주문·계정 문의는 서버 API가 입력을 검증한 뒤 각각 별도 Formspree endpoint로 전달합니다.
- 공개 배포 전에 고객 인증과 Formspree endpoint 설정, 개인정보 처리방침 검토를 완료하세요.

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
├── kbeauty.html        (고객 인증이 필요한 데스크톱 도매 카탈로그/주문 요청)
├── m_kbeauty.html      (고객 인증이 필요한 모바일 도매 카탈로그/주문 요청)
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
├── functions/          (Pages Functions 인증, 계정 검증, 문의/주문 API)
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

### 3. 고객용 도매 Access와 주문 설정

1. 고객 전용 Access 애플리케이션을 만들고 승인된 도매 고객 이메일만 허용합니다. 관리자 앱과 다른 Audience를 사용합니다.
2. 해당 앱의 보호 경로에 다음을 모두 포함하고 `pages.dev`와 사용자 지정 도메인에도 같은 보호를 적용합니다.
   - `/kbeauty*`, `/m_kbeauty*`
   - `/product-images.js`, `/product-details.js`, `/assets/products/*`
   - `/api/accounts/verify`, `/api/wholesale/order`
3. Pages의 **Settings → Variables and Secrets**에 추가합니다.
   - `WHOLESALE_ACCESS_AUDS`: 고객 전용 Access 앱 Audience 값
   - `FORMSPREE_ORDER_ENDPOINT`: 주문 요청 전용 Formspree URL (`https://formspree.io/f/<endpoint-id>`)
   - `FORMSPREE_INQUIRY_ENDPOINT`: 계정 문의 전용 Formspree URL (`https://formspree.io/f/<endpoint-id>`)
4. D1의 각 승인 고객 레코드에서 `email`을 Access 로그인 이메일과 정확히 일치시키고 `is_active = 1`로 둡니다. 비어 있거나 일치하지 않는 이메일은 접근할 수 없습니다.
5. Pages Functions 한도 초과 시에도 정적 카탈로그가 공개되지 않도록 Pages의 Functions 실행을 **Fail closed**로 설정합니다.
6. 이전에 데스크톱·모바일에서 직접 사용한 공용 Formspree endpoint는 새 별도 endpoint가 동작하는지 확인한 뒤 Formspree에서 비활성화하세요. 이전 endpoint가 활성 상태면 공개된 예전 경로로 주문 요청을 직접 위조할 수 있습니다.

인증 미설정이나 D1 확인 실패 시 카탈로그는 fail-closed로 거부됩니다. 주문 제출은 로그인 이메일·계정번호를 서버에서 다시 확인한 후 Formspree로 전달되며, 주문 확정 전 재고·가격·배송 확인이 필요합니다.

### 4. 계정 정보 등록

Access 정책을 통과한 관리자는 `https://tintoroshop.com/admin/`에서 계정번호와 점포 정보를 추가·수정하거나 비활성화할 수 있습니다. 관리자 URL은 공개 도매 푸터에 링크하지 않습니다. 고객 포털 검증은 고객 Access 설정과 D1 이메일 매핑이 완료된 후에만 사용할 수 있습니다.

## 🛡️ 고객용 도매 주문 흐름

- 주문은 즉시 확정이 아닌 주문 요청입니다. 폼은 `Submit Order Request`를 사용하고, 제출 전에 `We’ll confirm availability, pricing, and shipping before finalizing your order.`를 표시합니다. 서버가 주문 요청을 접수하면 `Order request received`를 표시합니다.
- 일반 계정 문의에서 사업장 주소를 제거했습니다. 실제 주문 요청에는 배송 확인을 위해 `Shipping Address`를 별도로 받습니다.
- `/api/wholesale/order`는 인증된 고객 이메일과 계정번호의 D1 일치를 확인하고, 설정된 전용 Formspree endpoint로만 전달합니다. 주문 endpoint가 미설정이면 제출을 거부합니다.
- `/api/wholesale/inquiry`는 일반 문의를 별도 Formspree endpoint로 전달합니다. 실제 전송을 확인하기 전까지 양식 성공을 가정하지 마세요.
- Formspree의 기존 endpoint와 과거 제출 기록, 보관·삭제 설정은 운영자가 확인해야 합니다. 이전 endpoint는 주문용 새 경로를 확인한 후 비활성화하세요.

## 🔏 개인정보 처리방침 검토

- 게시 가능한 최종 개인정보 처리방침은 아직 확인되지 않았으며, 액세스 요청 링크는 이메일 앱을 여는 mailto 방식입니다. 확정 전 정책 링크를 공개 페이지에 추가하지 마세요.
- 주문 요청 폼은 계정번호, 업체명, 전화번호, 배송 주소, 승인 이메일, 주문 품목·수량, 제출 합계와 메모를 수집해 서버 API를 통해 전용 Formspree endpoint로 전달합니다. 계정 문의 폼은 이름, 업체명, 전화번호, 이메일, 선택 메모를 별도 endpoint로 전달하며 주소는 수집하지 않습니다.
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

**상태:** 고객 Access 앱, `WHOLESALE_ACCESS_AUDS`, D1 고객 이메일, 전용 Formspree endpoint 및 Fail-closed 설정을 확인한 후에만 도매 주문 복원 변경을 배포합니다.
