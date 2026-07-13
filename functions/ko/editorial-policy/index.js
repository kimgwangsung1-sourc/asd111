import { createKoreanPageHandler } from "../../../korean-page-function.js";

export const onRequest = createKoreanPageHandler({
  assetPath: "/editorial-policy/",
  englishUrl: "https://neoncps.com/editorial-policy/",
  koreanUrl: "https://neoncps.com/ko/editorial-policy/",
  title: "NEONCPS 편집 정책 | 출처, 업데이트 및 UX 기준",
  description: "이 문서는 NEONCPS 페이지의 검토 기준을 설명합니다. 출처 품질, 업데이트 기준, 정정 처리, 그리고 광고나 UI가 탐색이나 다운로드처럼 위장하면 안 된다는 원칙을 다룹니다.",
  schemaType: "WebPage",
  schemaKey: "name",
  schemaName: "NEONCPS 편집 정책",
  dateModified: "2026-03-18"
});
