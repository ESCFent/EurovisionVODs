import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const showsSchema = z.array(z.object({
    id: z.string().regex(/^[^A-Z\s]+$/g),
    name: z.string(),
    date: z.string(),
    type: z.enum(["player", "youtube", "iframe"]),
    url: z.union([z.string().url(), z.string().regex(/^[a-zA-Z0-9_-]{11}$/g)]),
    startsAt: z.optional(z.number()),
    clearkey: z.optional(z.string().regex(/^[0-9a-f]{32}:[0-9a-f]{32}$/g))
})).optional();

const shows = defineCollection({
    loader: glob({ pattern: "**/[^_]*.json", base: "./src/shows" }),
    schema: z.object({
        name: z.string(),
        countryCode: z.string().regex(/^[A-Z]{2}$/g),
        flagBackgroundRotation: z.optional(z.string().regex(/^-?[0-9]{1,3}deg$/g)),
        countryName: z.string(),
        shows: showsSchema,
        categories: z.array(z.object({
            category: z.string(),
            shows: showsSchema
        })).optional()
    }).refine(data => {
        return (data.shows !== undefined ? 1 : 0) + (data.categories !== undefined ? 1 : 0) === 1;
    })
});

export const collections = { shows };