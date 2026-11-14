# Tintoro Shop 배포 가이드

## 📋 현재 상태

✅ **완료됨:**
- GitHub 저장소 생성: `qnam0321/tintotoshop-web`
- 모든 웹사이트 파일 업로드
- 정적 HTML/CSS/JS 파일 준비 완료
- Git 저장소에 커밋 및 푸시

## 🚀 Cloudflare Pages 배포 방법

### 방법 1: 웹 인터페이스 (권장)

#### Step 1: Cloudflare 대시보드 접속
1. https://dash.cloudflare.com에 로그인
2. 좌측 메뉴에서 **"Workers & Pages"** 클릭

#### Step 2: 새 프로젝트 생성
1. **"Create a project"** 또는 **"Create application"** 버튼 클릭
2. **"Import an existing Git repository"** 선택
3. **"Get started"** 클릭

#### Step 3: GitHub 저장소 연결
1. **"Connect to Git"** 클릭
2. GitHub 로그인 (필요시)
3. **"Authorize Cloudflare Workers and Pages"** 클릭
4. 저장소 선택: `qnam0321/tintotoshop-web`
5. Production branch: `main` (기본값)

#### Step 4: 빌드 설정
이 설정으로 유지:
- **Framework**: None (또는 Skip)
- **Build command**: (비워두기)
- **Build output directory**: `.` (또는 `/`)

#### Step 5: 배포
1. **"Deploy"** 클릭
2. 배포 진행 (2-3분 소요)

### 배포 후 접속 정보

**배포 URL (자동 생성):**
```
https://tintotoshop-web.pages.dev
```

**자동 배포:**
- 이제부터 GitHub에 코드를 푸시하면 자동으로 배포됩니다
- 변경사항은 수 초 내에 반영됩니다

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
├── accounts.js         (계정 관련 로직)
├── package.json        (프로젝트 메타데이터)
├── README.md           (프로젝트 설명)
└── .github/
    └── workflows/      (GitHub Actions 설정)
```

## ⚡ 이후 작업

### 웹사이트 수정 방법

1. **로컬에서 수정:**
   ```bash
   git clone https://github.com/qnam0321/tintotoshop-web.git
   cd tintotoshop-web
   # 파일 수정...
   ```

2. **GitHub에 푸시:**
   ```bash
   git add .
   git commit -m "Update website content"
   git push origin main
   ```

3. **자동 배포:**
   - Cloudflare Pages가 자동으로 감지하여 배포
   - 1-2분 후 변경사항 반영됨

### 도메인 연결 (선택)

나중에 도메인을 연결하려면:
1. Cloudflare에서 Pages 프로젝트 클릭
2. "Custom domains" 섹션
3. 도메인 추가

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

**마지막 업데이트:** 2026-11-14
**상태:** 배포 준비 완료 ✅
