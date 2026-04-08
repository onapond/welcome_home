import { defineField, defineType } from "sanity";

export default defineType({
  name: "sermon",
  title: "설교",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "설교 제목",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: "date",
      title: "설교 날짜",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "preacher",
      title: "설교자",
      type: "string",
      initialValue: "김항우 목사",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "scripture",
      title: "성경 본문",
      type: "string",
      description: "예: 요한복음 3:16",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "series",
      title: "설교 시리즈",
      type: "reference",
      to: [{ type: "sermonSeries" }],
    }),
    defineField({
      name: "youtubeId",
      title: "유튜브 영상 ID",
      type: "string",
      description: "YouTube URL의 v= 뒤에 오는 11자리 ID (예: dQw4w9WgXcQ)",
    }),
    defineField({
      name: "thumbnail",
      title: "썸네일 이미지",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "summary",
      title: "설교 요약",
      type: "text",
      rows: 4,
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
    select: {
      title: "title",
      subtitle: "scripture",
      date: "date",
      media: "thumbnail",
    },
    prepare({ title, subtitle, date }) {
      return {
        title,
        subtitle: `${date ?? ""} · ${subtitle ?? ""}`,
      };
    },
  },
});
