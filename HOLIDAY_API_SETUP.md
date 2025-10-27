# 공휴일 API 연동 가이드

이 문서는 공공데이터포털의 대한민국 공휴일 API를 연동하는 방법을 설명합니다.

## 1. 공공데이터포털 API 신청

### 1.1 회원가입 및 로그인
1. [공공데이터포털](https://www.data.go.kr) 접속
2. 회원가입 후 로그인

### 1.2 특일정보 API 신청
1. [특일정보 API 페이지](https://www.data.go.kr/data/15012690/openapi.do) 접속
2. **"활용신청"** 버튼 클릭
3. 필수 정보 입력:
   - **활용목적**: 캘린더 애플리케이션에 공휴일 표시
   - **상세기능설명**: 미니 캘린더에 한국 공휴일을 표시하여 사용자 경험 향상
4. 신청 완료 후 승인 대기 (일반적으로 1시간 ~ 2일 소요)

### 1.3 인증키 확인
1. 로그인 > **마이페이지** > **오픈API** > **개발계정 상세보기**
2. **일반 인증키(Decoding)** 복사 (URL 인코딩 안 된 키 사용)

## 2. 환경변수 설정

### 2.1 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
# PowerShell에서 실행
Copy-Item .env.example .env.local
```

### 2.2 API 키 설정
`.env.local` 파일을 열고 발급받은 API 키를 입력합니다:

```env
# 공공데이터포털 특일정보 API 키
NEXT_PUBLIC_HOLIDAY_API_KEY=발급받은_디코딩_인증키_입력

# Supabase (기존 값 유지)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Google Calendar API (기존 값 유지)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

⚠️ **주의**: 
- `일반 인증키(Decoding)` 를 사용하세요 (Encoding 키 아님)
- 키에 특수문자가 있으면 따옴표로 감쌀 필요 없습니다

## 3. 개발 서버 재시작

환경변수 변경 후 반드시 개발 서버를 재시작하세요:

```bash
# 기존 서버 중단 (Ctrl + C)

# 서버 재시작
npm run dev
# 또는
pnpm dev
```

## 4. 동작 확인

### 4.1 브라우저 콘솔 확인
1. 애플리케이션 실행 후 미니 캘린더 열기
2. 브라우저 개발자 도구 (F12) > Console 탭 확인
3. 다음 메시지가 표시되면 성공:
   ```
   공휴일 XX개 로드 완료
   ```

### 4.2 캘린더에서 공휴일 확인
- 미니 캘린더에서 공휴일이 **빨간색**으로 표시됩니다
- 주말(토, 일)도 함께 빨간색으로 표시됩니다

## 5. 문제 해결

### API 키가 설정되지 않은 경우
**증상**: 콘솔에 다음 메시지 표시
```
공휴일 API 키가 설정되지 않았습니다. 기본 데이터를 사용합니다.
.env.local 파일에 NEXT_PUBLIC_HOLIDAY_API_KEY를 추가하세요.
```

**해결**:
1. `.env.local` 파일이 생성되었는지 확인
2. `NEXT_PUBLIC_HOLIDAY_API_KEY` 값이 `YOUR_API_KEY_HERE`가 아닌지 확인
3. 개발 서버 재시작

### API 호출 실패
**증상**: 콘솔에 다음 메시지 표시
```
공휴일 API 로드 실패, 기본 데이터를 사용합니다
```

**가능한 원인**:
1. **API 승인 대기 중**: 신청 후 승인까지 시간이 필요합니다
2. **잘못된 키**: Encoding 키 대신 Decoding 키를 사용하세요
3. **트래픽 제한**: 일일 트래픽 제한을 초과했을 수 있습니다
4. **네트워크 문제**: 인터넷 연결을 확인하세요

**해결**:
1. [공공데이터포털 마이페이지](https://www.data.go.kr/mypage/servicekey)에서 승인 상태 확인
2. 일반 인증키(Decoding) 사용 확인
3. 트래픽 제한 확인 (하루 1000건 제공)
4. 방화벽 설정 확인

### CORS 오류
**증상**: 브라우저 콘솔에 CORS 에러 표시

**해결**: 
이 문제는 발생하지 않아야 합니다. 공공데이터포털 API는 CORS를 지원합니다. 
만약 발생한다면 Next.js의 API Routes를 통해 프록시 처리가 필요할 수 있습니다.

## 6. API 스펙

### 엔드포인트
```
GET https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo
```

### 요청 파라미터
| 파라미터 | 설명 | 필수 | 예시 |
|---------|------|------|------|
| serviceKey | 인증키(Decoding) | O | 발급받은 키 |
| solYear | 연도 | O | 2025 |
| _type | 응답 형식 | X | json |
| numOfRows | 한 페이지 결과 수 | X | 100 |

### 응답 예시
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE."
    },
    "body": {
      "items": {
        "item": [
          {
            "dateKind": "01",
            "dateName": "1월1일",
            "isHoliday": "Y",
            "locdate": 20250101,
            "seq": 1
          }
        ]
      },
      "numOfRows": 100,
      "pageNo": 1,
      "totalCount": 15
    }
  }
}
```

## 7. 구현 세부사항

### 로드되는 연도
현재 구현은 다음 3개 연도의 공휴일을 로드합니다:
- 작년 (currentYear - 1)
- 올해 (currentYear)
- 내년 (currentYear + 1)

### Fallback 데이터
API 로드 실패 시 하드코딩된 2025, 2026년 공휴일 데이터를 사용합니다.

### 캐싱
공휴일 데이터는 컴포넌트 마운트 시 한 번만 로드됩니다.

## 8. 참고 자료

- [공공데이터포털 특일정보 API](https://www.data.go.kr/data/15012690/openapi.do)
- [공공데이터포털 이용가이드](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do)
- [한국천문연구원](https://www.kasi.re.kr/)

## 9. 라이선스 및 이용 조건

- **제공기관**: 한국천문연구원
- **이용허락범위**: 제한없음
- **상업적 이용**: 가능
- **출처표시**: 필수 아님 (권장)

