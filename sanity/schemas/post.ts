import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "공지사항 & 소식",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "제목",
      type: "string",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "slug",
      title: "URL 슬러그",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "분류",
      type: "string",
      options: {
        list: [
          { title: "공지", value: "notice" },
          { title: "소식", value: "news" },
          { title: "간증", value: "testimony" },
        ],
        layout: "radio",
      },
      initialValue: "notice",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "게시 일시",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "메인 노출",
      type: "boolean",
      initialValue: false,
      description: "홈페이지 메인에 노출할 게시글입니다.",
    }),
    defineField({
      name: "body",
      title: "본문",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "caption", title: "이미지 캡션", type: "string" }),
            defineField({ name: "alt", title: "대체 텍스트", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "images",
      title: "첨부 이미지",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
  orderings: [
    {
      title: "날짜 (최신순)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", date: "date" },
    prepare({ title, subtitle, date }) {
      const cat = { notice: "공지", news: "소식", testimony: "간증" }[subtitle as string] ?? subtitle;
      const dateStr = date ? new Date(date).toLocaleDateString("ko-KR") : "";
      return { title, subtitle: `[${cat}] ${dateStr}` };
    },
  },
});
