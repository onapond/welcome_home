import { defineField, defineType } from "sanity";

export default defineType({
  name: "sermonSeries",
  title: "설교 시리즈",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "시리즈 제목",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "시리즈 설명",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "thumbnail",
      title: "대표 이미지",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "startDate",
      title: "시작일",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "종료일",
      type: "date",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "startDate", media: "thumbnail" },
  },
});
