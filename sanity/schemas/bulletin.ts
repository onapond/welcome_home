import { defineField, defineType } from "sanity";

export default defineType({
  name: "bulletin",
  title: "주보",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "주보 날짜",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pdfFile",
      title: "주보 PDF",
      type: "file",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "announcements",
      title: "교회 소식",
      type: "array",
      of: [{ type: "block" }],
      description: "이번 주 교회 공지사항을 입력하세요.",
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
    select: { date: "date" },
    prepare({ date }) {
      return {
        title: date
          ? new Date(date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }) + " 주보"
          : "주보",
      };
    },
  },
});
