import { createKoreanPageHandler } from "../../../korean-page-function.js";

export const onRequest = createKoreanPageHandler({
  assetPath: "/about/",
  englishUrl: "https://neoncps.com/about/",
  koreanUrl: "https://neoncps.com/ko/about/",
  title: "NEONCPS 소개 | 목적, 운영 범위 및 정정 요청",
  description: "NEONCPS는 주제를 좁게 잡은 브라우저 기반 유틸리티 프로젝트입니다. 방문자가 빠르게 CPS 테스트를 하고, 그 결과를 무리 없이 해석할 수 있도록 필요한 설명까지 함께 제공합니다.",
  schemaType: "AboutPage",
  schemaKey: "name",
  schemaName: "NEONCPS 소개",
  dateModified: "2026-03-18"
});
