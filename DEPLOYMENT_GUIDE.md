# Tintoro Shop 배포 가이드

## 📋 현재 상태

- Cloudflare Pages 프로젝트: `tintoro`
- 기본 도메인: `https://tintoroshop.com`
- B2B 도매 포털: `https://tintoroshop.com/wholesale`
- 프로덕션 브랜치: `backup/tintoro-final-20261114`
- D1 데이터베이스 바인딩과 Cloudflare Access 설정은 완료되어 있습니다.
- 마스터 주문 로그인을 사용하려면 아래 안내에 따라 `MASTER_WHOLESALE_CODE` Secret을 설정해야 합니다. 일반 계정은 `/admin/`에서 등록합니다.

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
├── kbeauty.html        (K-Beauty 페이지)
├── m_kbeauty.html      (모바일 K-Beauty 페이지)
├── styles.css          (스타일시트)
├── script.js           (JavaScript 로직)
├── wholesale/          (B2B 포털: /wholesale)
├── wholesale.html      (/wholesale 경로 호환 리디렉션)
├── assets/             (카탈로그 상품 이미지)
├── product-images.js   (상품 이미지 매핑)
├── _redirects          (Cloudflare Pages 경로 리디렉션)
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

## 🔐 도매 계정 관리자 설정 (필수)

계정 번호는 브라우저 파일에 저장하지 않고 Cloudflare D1에 저장합니다. 현재 프로덕션에는 D1 바인딩과 Access가 설정되어 있습니다. 환경을 새로 구성할 때는 아래 설정을 적용하세요.

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

배포 및 설정 후 사이트 푸터의 **Wholesale account admin** 링크를 열고 Access로 로그인합니다. 계정번호와 점포 정보를 추가·수정하거나 비활성화할 수 있습니다. 기존에 프런트엔드 파일에 있었던 계정번호는 더 이상 포함되지 않으므로, 계정 검증을 재개하기 전에 관리자 화면에서 다시 등록하세요. 기존 파일은 공개되어 있었으므로 운영 전에 기존 번호를 교체하는 것을 권장합니다.

### 4. 마스터 주문 로그인 설정 (선택)

Cloudflare Pages 프로젝트의 **Settings → Variables and Secrets → Production**에서 `MASTER_WHOLESALE_CODE`라는 Secret을 추가합니다. Secret 값은 서버에서만 확인되며 브라우저 파일이나 Git에 넣지 마세요. 설정한 코드는 D1 계정 목록이 비어 있어도 주문 계정 검증을 통과합니다. 그 외 계정은 계속 활성 상태의 D1 계정과 대조됩니다.

Secret을 추가하거나 변경한 뒤에는 새 배포를 실행해야 합니다. 마스터 코드를 바꾸려면 Cloudflare에서 Secret 값을 교체하고 다시 배포하세요. 이 Secret을 설정하지 않으면 기존 D1 계정 검증만 사용됩니다.

`/api/accounts/verify`는 주문 사이트에서 계정번호를 확인하기 위한 공개 엔드포인트이며, 등록 여부만 반환합니다. 운영 시 Cloudflare WAF의 rate limiting 규칙을 적용해 반복 조회를 제한하세요.

> 참고: 도매 가격과 카탈로그는 현재 브라우저에 전달되는 정적 페이지에 있습니다. 계정 검증은 계정 목록을 숨기지만, 가격 자체를 인증 사용자에게만 비공개로 제공하는 보안 기능은 아닙니다.
>
> 주문 이메일은 현재 Formspree로 직접 전송됩니다. 주문 화면에서 계정번호를 재검증하지만, Formspree 자체는 그 번호를 검증하지 않습니다. 주문 제출까지 서버에서 강제 검증하려면 주문 접수도 Pages Function으로 전환해야 합니다.

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

**마지막 업데이트:** 2026-11-15
**상태:** 배포 설정 완료. 주문 검증은 D1 계정 등록 또는 `MASTER_WHOLESALE_CODE` Secret 설정이 필요합니다.
