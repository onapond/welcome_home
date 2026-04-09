import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "../sanity/schemas";

export default defineConfig({
  name: "chungpa-central-church",
  title: "청파중앙교회 CMS",

  projectId: (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "").trim(),
  dataset: (process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production").trim(),

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id("root")
          .title("콘텐츠 관리")
          .items([
            S.listItem()
              .title("설교")
              .child(S.documentTypeList("sermon").title("설교 목록")),
            S.listItem()
              .title("설교 시리즈")
              .child(S.documentTypeList("sermonSeries").title("시리즈 목록")),
            S.divider(),
            S.listItem()
              .title("공지사항 & 소식")
              .child(S.documentTypeList("post").title("게시글 목록")),
            S.listItem()
              .title("교회 일정")
              .child(S.documentTypeList("event").title("행사 목록")),
            S.listItem()
              .title("주보")
              .child(S.documentTypeList("bulletin").title("주보 목록")),
            S.divider(),
            S.listItem()
              .title("갤러리")
              .child(S.documentTypeList("gallery").title("갤러리 목록")),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
