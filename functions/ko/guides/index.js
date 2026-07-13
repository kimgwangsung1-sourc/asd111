import { createKoreanPageHandler } from "../../../korean-page-function.js";

export const onRequest = createKoreanPageHandler({
  assetPath: "/guides/",
  englishUrl: "https://neoncps.com/guides/",
  koreanUrl: "https://neoncps.com/ko/guides/",
  title: "NEONCPS 가이드 | CPS 측정, 해석 및 안전",
  description: "이 섹션은 메인 CPS 도구를 작은 참고 자료실로 확장한 것입니다. 각 페이지는 NEONCPS의 실제 측정 방식과 그 결과를 어떻게 해석해야 하는지에 맞춰 작성되었습니다.",
  schemaType: "CollectionPage",
  schemaKey: "name",
  schemaName: "NEONCPS 가이드",
  dateModified: "2026-03-30"
});
