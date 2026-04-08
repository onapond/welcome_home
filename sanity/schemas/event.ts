import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "교회 일정",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "행사 제목",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "분류",
      type: "string",
      options: {
        list: [
          { title: "예배", value: "worship" },
          { title: "교육", value: "education" },
          { title: "행사", value: "event" },
          { title: "선교", value: "mission" },
          { title: "기타", value: "etc" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "시작 일시",
      type: "datetime",
      options: { timeFormat: "HH:mm" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "종료 일시",
      type: "datetime",
      options: { timeFormat: "HH:mm" },
    }),
    defineField({
      name: "location",
      title: "장소",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "행사 내용",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "행사 이미지",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "registrationUrl",
      title: "등록/신청 링크",
      type: "url",
    }),
  ],
  orderings: [
    {
      title: "날짜 (가까운 순)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "date", media: "image" },
    prepare({ title, subtitle }) {
      const dateStr = subtitle
        ? new Date(subtitle).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
        : "";
      return { title, subtitle: dateStr };
    },
  },
});
