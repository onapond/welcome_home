import { defineField, defineType } from "sanity";

export default defineType({
  name: "gallery",
  title: "갤러리",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "앨범 제목",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "날짜",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "분류",
      type: "string",
      options: {
        list: [
          { title: "예배", value: "worship" },
          { title: "행사", value: "event" },
          { title: "수련회 / MT", value: "retreat" },
          { title: "선교", value: "mission" },
          { title: "기타", value: "etc" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "설명",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "images",
      title: "사진",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "사진",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "캡션",
              type: "string",
            }),
          ],
          preview: {
            select: { media: "image", title: "caption" },
            prepare({ media, title }) {
              return { media, title: title ?? "사진" };
            },
          },
        },
      ],
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
      subtitle: "date",
      media: "images.0.image",
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle, media };
    },
  },
});
